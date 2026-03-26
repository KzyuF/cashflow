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

export function setupExpenseHandler(bot: Bot<BotContext>) {
  // /add command — interactive expense
  bot.command("add", async (ctx) => {
    await ctx.reply(
      "💸 Введите расход:\n" +
        'Например: `кофе 4.50` или `rimi 43.80`',
      { parse_mode: "Markdown" }
    );
  });

  // /balance command
  bot.command("balance", async (ctx) => {
    const accounts = await prisma.account.findMany({
      where: { userId: ctx.dbUser!.id, isArchived: false },
      orderBy: { balance: "desc" },
    });

    if (accounts.length === 0) {
      await ctx.reply(
        "У тебя пока нет счетов. Добавь их в Mini App! 📊"
      );
      return;
    }

    const currency = ctx.dbUser!.currency;
    let total = 0;
    const lines = accounts.map((a) => {
      const bal = Number(a.balance);
      total += bal;
      return `  ${a.name}: *${bal.toFixed(2)} ${currency}*`;
    });

    await ctx.reply(
      `💰 *Баланс счетов:*\n\n${lines.join("\n")}\n\n` +
        `📊 Итого: *${total.toFixed(2)} ${currency}*`,
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
    const currency = ctx.dbUser!.currency;

    // Group expenses by category
    const byCat: Record<string, number> = {};
    for (const e of expenses) {
      byCat[e.category] = (byCat[e.category] || 0) + Number(e.amount);
    }

    const catLines = Object.entries(byCat)
      .sort((a, b) => b[1] - a[1])
      .map(
        ([cat, amount]) =>
          `${getCategoryEmoji(cat)} ${getCategoryName(cat)}: ${amount.toFixed(2)} ${currency}`
      );

    const monthName = now.toLocaleDateString("ru-RU", { month: "long" });
    await ctx.reply(
      `📊 *Статистика за ${monthName}*\n\n` +
        `💰 Доходы: +${totalInc.toFixed(2)} ${currency}\n` +
        `💸 Расходы: −${totalExp.toFixed(2)} ${currency}\n` +
        `${totalInc - totalExp >= 0 ? "📈" : "📉"} Итого: ${(totalInc - totalExp).toFixed(2)} ${currency}\n\n` +
        (catLines.length > 0
          ? `*По категориям:*\n${catLines.join("\n")}`
          : "Расходов пока нет"),
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

    const currency = ctx.dbUser!.currency;
    await ctx.editMessageText(
      `${getCategoryEmoji(category)} Записал: *${expense.name}* — ${Number(expense.amount).toFixed(2)} ${currency} (${getCategoryName(category)})`,
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

    const expense = await prisma.expense.create({
      data: {
        userId: ctx.dbUser!.id,
        name: parsed.name,
        amount: parsed.amount,
        category: parsed.category,
        source: "bot",
      },
    });

    const currency = ctx.dbUser!.currency;
    await ctx.reply(
      `${getCategoryEmoji(parsed.category)} Записал: *${parsed.name}* — ${parsed.amount.toFixed(2)} ${currency} (${getCategoryName(parsed.category)})`,
      {
        parse_mode: "Markdown",
        reply_markup: expenseActionsKeyboard(expense.id),
      }
    );
  });
}
