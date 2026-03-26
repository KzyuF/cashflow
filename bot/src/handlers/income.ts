import type { Bot } from "grammy";
import type { BotContext } from "../types.js";
import { incomeAccountKeyboard } from "../keyboards/inline.js";
import { prisma } from "../bot.js";

export function setupIncomeHandler(bot: Bot<BotContext>) {
  bot.command("income", async (ctx) => {
    ctx.session.step = "income_waiting";
    await ctx.reply(
      "💰 Введите сумму и описание:\n" +
        'Пример: `3200 зарплата` или `450 фриланс проект`',
      { parse_mode: "Markdown" }
    );
  });

  // Parse income text
  bot.on("message:text", async (ctx, next) => {
    if (ctx.session.step !== "income_waiting") return next();

    const text = ctx.message.text;
    const match = text.match(/(\d[\d\s]*[.,]?\d*)\s*(.*)/);
    if (!match) {
      await ctx.reply("Не могу разобрать. Введите сумму и описание, например: `450 фриланс`", {
        parse_mode: "Markdown",
      });
      return;
    }

    const amount = parseFloat(match[1].replace(/\s/g, "").replace(",", "."));
    let name = match[2].trim() || "Поступление";
    name = name.charAt(0).toUpperCase() + name.slice(1);

    // Detect type from keywords
    let type = "other";
    const lower = text.toLowerCase();
    if (/зарплат|salary/.test(lower)) type = "salary";
    else if (/фриланс|freelance|проект/.test(lower)) type = "freelance";
    else if (/процент|interest/.test(lower)) type = "interest";
    else if (/подарок|gift/.test(lower)) type = "gift";
    else if (/возврат|refund|кэшбэк|cashback/.test(lower)) type = "refund";

    // Store temp data
    ctx.session.data = { amount, name, type };
    ctx.session.step = "income_account";

    const accounts = await prisma.account.findMany({
      where: { userId: ctx.dbUser!.id, isArchived: false },
    });

    const currency = ctx.dbUser!.currency;
    if (accounts.length > 0) {
      await ctx.reply(
        `💰 *${name}* — +${amount.toFixed(2)} ${currency}\n\nНа какой счёт?`,
        {
          parse_mode: "Markdown",
          reply_markup: incomeAccountKeyboard(accounts),
        }
      );
    } else {
      // No accounts, save directly
      await prisma.income.create({
        data: {
          userId: ctx.dbUser!.id,
          name,
          amount,
          type,
          source: "bot",
        },
      });
      ctx.session.step = null;
      ctx.session.data = {};
      await ctx.reply(
        `💰 Записал поступление: *${name}* — +${amount.toFixed(2)} ${currency}`,
        { parse_mode: "Markdown" }
      );
    }
  });

  // Account selection for income
  bot.callbackQuery(/^income_acc:(.+)$/, async (ctx) => {
    const accountVal = ctx.match![1];
    const data = ctx.session.data as {
      amount: number;
      name: string;
      type: string;
    };
    const accountId = accountVal === "skip" ? null : parseInt(accountVal);

    await prisma.income.create({
      data: {
        userId: ctx.dbUser!.id,
        name: data.name,
        amount: data.amount,
        type: data.type,
        accountId,
        source: "bot",
      },
    });

    if (accountId) {
      await prisma.account.update({
        where: { id: accountId },
        data: { balance: { increment: data.amount } },
      });
    }

    const currency = ctx.dbUser!.currency;
    ctx.session.step = null;
    ctx.session.data = {};

    await ctx.editMessageText(
      `💰 Записал поступление: *${data.name}* — +${data.amount.toFixed(2)} ${currency}`,
      { parse_mode: "Markdown" }
    );
    await ctx.answerCallbackQuery("Записано!");
  });
}
