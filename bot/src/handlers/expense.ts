import type { Bot } from "grammy";
import type { BotContext } from "../types.js";
import {
  parseExpense,
  getCategoryEmoji,
  getCategoryName,
} from "../parsers/expense-parser.js";
import {
  expenseActionsKeyboard,
  categoryKeyboard,
} from "../keyboards/inline.js";
import { prisma } from "../bot.js";
import { currencySymbol } from "../../../shared/currencies.js";

export function setupExpenseHandler(bot: Bot<BotContext>) {
  // /add command — interactive expense
  bot.command("add", async (ctx) => {
    const isRu = ctx.dbUser!.language === "ru";
    await ctx.reply(
      isRu
        ? "💸 Введите расход:\n" +
          "Например: `кофе 4.50` или `rimi 43.80`\n" +
          "С валютой: `кофе 4.50 usd`"
        : "💸 Enter expense:\n" +
          "Example: `coffee 4.50` or `grocery 43.80`\n" +
          "With currency: `coffee 4.50 usd`",
      { parse_mode: "Markdown" }
    );
  });

  // /balance command
  bot.command("balance", async (ctx) => {
    const accounts = await prisma.account.findMany({
      where: { userId: ctx.dbUser!.id, isArchived: false },
      orderBy: { balance: "desc" },
    });

    const isRu = ctx.dbUser!.language === "ru";

    if (accounts.length === 0) {
      await ctx.reply(
        isRu
          ? "У тебя пока нет счетов. Добавь их в Mini App! 📊"
          : "You don't have any accounts yet. Add them in Mini App! 📊"
      );
      return;
    }

    let total = 0;
    const lines = accounts.map((a) => {
      const bal = Number(a.balance);
      total += bal;
      const sym = currencySymbol(a.currency);
      return `  ${a.name}: *${bal.toFixed(2)} ${sym}*`;
    });

    const mainSym = currencySymbol(ctx.dbUser!.currency);
    await ctx.reply(
      isRu
        ? `💰 *Баланс счетов:*\n\n${lines.join("\n")}\n\n📊 Итого: *${total.toFixed(2)} ${mainSym}*`
        : `💰 *Account balances:*\n\n${lines.join("\n")}\n\n📊 Total: *${total.toFixed(2)} ${mainSym}*`,
      { parse_mode: "Markdown" }
    );
  });

  // /stats command
  bot.command("stats", async (ctx) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const expenses = await prisma.expense.findMany({
      where: {
        userId: ctx.dbUser!.id,
        date: { gte: startOfMonth },
      },
    });

    const incomes = await prisma.income.findMany({
      where: {
        userId: ctx.dbUser!.id,
        date: { gte: startOfMonth },
      },
    });

    const totalExp = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const totalInc = incomes.reduce((s, i) => s + Number(i.amount), 0);
    const mainSym = currencySymbol(ctx.dbUser!.currency);
    const isRu = ctx.dbUser!.language === "ru";

    // Group expenses by category
    const byCat: Record<string, number> = {};
    for (const e of expenses) {
      byCat[e.category] = (byCat[e.category] || 0) + Number(e.amount);
    }

    const catLines = Object.entries(byCat)
      .sort((a, b) => b[1] - a[1])
      .map(
        ([cat, amount]) =>
          `${getCategoryEmoji(cat)} ${getCategoryName(cat)}: ${amount.toFixed(2)} ${mainSym}`
      );

    const monthName = isRu
      ? now.toLocaleDateString("ru-RU", { month: "long" })
      : now.toLocaleDateString("en-US", { month: "long" });

    await ctx.reply(
      isRu
        ? `📊 *Статистика за ${monthName}*\n\n` +
          `💰 Доходы: +${totalInc.toFixed(2)} ${mainSym}\n` +
          `💸 Расходы: −${totalExp.toFixed(2)} ${mainSym}\n` +
          `${totalInc - totalExp >= 0 ? "📈" : "📉"} Итого: ${(totalInc - totalExp).toFixed(2)} ${mainSym}\n\n` +
          (catLines.length > 0 ? `*По категориям:*\n${catLines.join("\n")}` : "Расходов пока нет")
        : `📊 *Stats for ${monthName}*\n\n` +
          `💰 Income: +${totalInc.toFixed(2)} ${mainSym}\n` +
          `💸 Expenses: −${totalExp.toFixed(2)} ${mainSym}\n` +
          `${totalInc - totalExp >= 0 ? "📈" : "📉"} Total: ${(totalInc - totalExp).toFixed(2)} ${mainSym}\n\n` +
          (catLines.length > 0 ? `*By category:*\n${catLines.join("\n")}` : "No expenses yet"),
      { parse_mode: "Markdown" }
    );
  });

  // Change category callback
  bot.callbackQuery(/^change_cat:(\d+)$/, async (ctx) => {
    const expenseId = parseInt(ctx.match![1]);
    await ctx.editMessageReplyMarkup({
      reply_markup: categoryKeyboard(expenseId),
    });
    await ctx.answerCallbackQuery();
  });

  // Set category callback
  bot.callbackQuery(/^set_cat:(\d+):(\w+)$/, async (ctx) => {
    const expenseId = parseInt(ctx.match![1]);
    const category = ctx.match![2];

    const expense = await prisma.expense.update({
      where: { id: expenseId },
      data: { category },
    });

    const sym = currencySymbol(expense.currency);
    await ctx.editMessageText(
      `${getCategoryEmoji(category)} Записал: *${expense.name}* — ${Number(expense.amount).toFixed(2)} ${sym} (${getCategoryName(category)})`,
      {
        parse_mode: "Markdown",
        reply_markup: expenseActionsKeyboard(expenseId),
      }
    );
    await ctx.answerCallbackQuery("Категория обновлена!");
  });

  // Delete expense callback
  bot.callbackQuery(/^delete_exp:(\d+)$/, async (ctx) => {
    const expenseId = parseInt(ctx.match![1]);
    await prisma.expense.delete({ where: { id: expenseId } });
    await ctx.editMessageText("🗑 Расход удалён");
    await ctx.answerCallbackQuery();
  });

  // Text message handler — auto-parse expenses (must be last)
  bot.on("message:text", async (ctx) => {
    // Skip if in a conversation flow
    if (ctx.session.step) return;

    const parsed = parseExpense(ctx.message.text);
    if (!parsed) return; // Not recognized as expense, ignore

    const expCurrency = parsed.currency || ctx.dbUser!.currency;

    const expense = await prisma.expense.create({
      data: {
        userId: ctx.dbUser!.id,
        name: parsed.name,
        amount: parsed.amount,
        currency: expCurrency,
        category: parsed.category,
        source: "bot",
      },
    });

    const sym = currencySymbol(expCurrency);
    await ctx.reply(
      `${getCategoryEmoji(parsed.category)} Записал: *${parsed.name}* — ${parsed.amount.toFixed(2)} ${sym} (${getCategoryName(parsed.category)})`,
      {
        parse_mode: "Markdown",
        reply_markup: expenseActionsKeyboard(expense.id),
      }
    );
  });
}
