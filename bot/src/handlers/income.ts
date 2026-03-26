import type { Bot } from "grammy";
import type { BotContext } from "../types.js";
import { incomeAccountKeyboard } from "../keyboards/inline.js";
import { prisma } from "../bot.js";
import { currencySymbol, detectCurrencyInText } from "../../../shared/currencies.js";

export function setupIncomeHandler(bot: Bot<BotContext>) {
  bot.command("income", async (ctx) => {
    ctx.session.step = "income_waiting";
    const isRu = ctx.dbUser!.language === "ru";
    await ctx.reply(
      isRu
        ? "💰 Введите сумму и описание:\n" +
          "Пример: `3200 зарплата` или `450 фриланс проект`\n" +
          "С валютой: `100 usd подарок`"
        : "💰 Enter amount and description:\n" +
          "Example: `3200 salary` or `450 freelance project`\n" +
          "With currency: `100 usd gift`",
      { parse_mode: "Markdown" }
    );
  });

  // Parse income text
  bot.on("message:text", async (ctx, next) => {
    if (ctx.session.step !== "income_waiting") return next();

    const text = ctx.message.text;
    const isRu = ctx.dbUser!.language === "ru";

    // Detect currency
    const { cleanText, currency: detectedCurrency } = detectCurrencyInText(text);
    const incCurrency = detectedCurrency || ctx.dbUser!.currency;

    const match = cleanText.match(/(\d[\d\s]*[.,]?\d*)\s*(.*)/);
    if (!match) {
      await ctx.reply(
        isRu
          ? "Не могу разобрать. Введите сумму и описание, например: `450 фриланс`"
          : "Can't parse. Enter amount and description, e.g.: `450 freelance`",
        { parse_mode: "Markdown" }
      );
      return;
    }

    const amount = parseFloat(match[1].replace(/\s/g, "").replace(",", "."));
    let name = match[2].trim() || (isRu ? "Поступление" : "Income");
    name = name.charAt(0).toUpperCase() + name.slice(1);

    // Detect type from keywords
    let type = "other";
    const lower = text.toLowerCase();
    if (/зарплат|salary/.test(lower)) type = "salary";
    else if (/фриланс|freelance|проект|project/.test(lower)) type = "freelance";
    else if (/процент|interest/.test(lower)) type = "interest";
    else if (/подарок|gift/.test(lower)) type = "gift";
    else if (/возврат|refund|кэшбэк|cashback/.test(lower)) type = "refund";

    // Store temp data
    ctx.session.data = { amount, name, type, currency: incCurrency };
    ctx.session.step = "income_account";

    const accounts = await prisma.account.findMany({
      where: { userId: ctx.dbUser!.id, isArchived: false },
    });

    const sym = currencySymbol(incCurrency);
    if (accounts.length > 0) {
      await ctx.reply(
        isRu
          ? `💰 *${name}* — +${amount.toFixed(2)} ${sym}\n\nНа какой счёт?`
          : `💰 *${name}* — +${amount.toFixed(2)} ${sym}\n\nTo which account?`,
        {
          parse_mode: "Markdown",
          reply_markup: incomeAccountKeyboard(accounts),
        }
      );
    } else {
      await prisma.income.create({
        data: {
          userId: ctx.dbUser!.id,
          name,
          amount,
          currency: incCurrency,
          type,
          source: "bot",
        },
      });
      ctx.session.step = null;
      ctx.session.data = {};
      await ctx.reply(
        isRu
          ? `💰 Записал поступление: *${name}* — +${amount.toFixed(2)} ${sym}`
          : `💰 Recorded income: *${name}* — +${amount.toFixed(2)} ${sym}`,
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
      currency: string;
    };
    const accountId = accountVal === "skip" ? null : parseInt(accountVal);

    await prisma.income.create({
      data: {
        userId: ctx.dbUser!.id,
        name: data.name,
        amount: data.amount,
        currency: data.currency,
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

    const sym = currencySymbol(data.currency);
    ctx.session.step = null;
    ctx.session.data = {};

    const isRu = ctx.dbUser!.language === "ru";
    await ctx.editMessageText(
      isRu
        ? `💰 Записал поступление: *${data.name}* — +${data.amount.toFixed(2)} ${sym}`
        : `💰 Recorded income: *${data.name}* — +${data.amount.toFixed(2)} ${sym}`,
      { parse_mode: "Markdown" }
    );
    await ctx.answerCallbackQuery(isRu ? "Записано!" : "Recorded!");
  });
}
