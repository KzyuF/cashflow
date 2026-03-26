import type { Bot } from "grammy";
import type { BotContext } from "../types.js";
import {
  debtDirectionKeyboard,
  personDebtActionsKeyboard,
} from "../keyboards/inline.js";
import { prisma } from "../bot.js";
import { currencySymbol } from "../../../shared/currencies.js";

export function setupDebtHandler(bot: Bot<BotContext>) {
  bot.command("debt", async (ctx) => {
    const isRu = ctx.dbUser!.language === "ru";
    ctx.session.step = "debt_direction";
    await ctx.reply(isRu ? "Выберите тип:" : "Choose type:", {
      reply_markup: debtDirectionKeyboard(),
    });
  });

  // Direction chosen
  bot.callbackQuery(/^debt_dir:(.+)$/, async (ctx) => {
    const direction = ctx.match![1]; // they_owe | i_owe
    ctx.session.data = { direction };
    ctx.session.step = "debt_waiting";
    const isRu = ctx.dbUser!.language === "ru";

    await ctx.editMessageText(
      direction === "they_owe"
        ? isRu
          ? "📥 Кто должен и сколько?\nПример: `Андрей 150 билеты на концерт`"
          : "📥 Who owes you and how much?\nExample: `John 150 concert tickets`"
        : isRu
          ? "📤 Кому и сколько?\nПример: `Марина 45 обед в ресторане`"
          : "📤 Whom and how much?\nExample: `Jane 45 lunch at restaurant`",
      { parse_mode: "Markdown" }
    );
    await ctx.answerCallbackQuery();
  });

  // Parse debt text
  bot.on("message:text", async (ctx, next) => {
    if (ctx.session.step !== "debt_waiting") return next();

    const text = ctx.message.text;
    const isRu = ctx.dbUser!.language === "ru";
    const match = text.match(/^(\S+)\s+(\d[\d.,]*)\s*(.*)?$/);
    if (!match) {
      await ctx.reply(
        isRu
          ? "Не могу разобрать. Формат: `Имя сумма причина`\nПример: `Андрей 150 билеты`"
          : "Can't parse. Format: `Name amount reason`\nExample: `John 150 tickets`",
        { parse_mode: "Markdown" }
      );
      return;
    }

    const personName =
      match[1].charAt(0).toUpperCase() + match[1].slice(1);
    const amount = parseFloat(match[2].replace(",", "."));
    const reason = match[3]?.trim() || undefined;
    const direction = ctx.session.data.direction as string;

    const debt = await prisma.personDebt.create({
      data: {
        userId: ctx.dbUser!.id,
        personName,
        amount,
        direction,
        reason,
      },
    });

    const sym = currencySymbol(ctx.dbUser!.currency);
    ctx.session.step = null;
    ctx.session.data = {};

    const emoji = direction === "they_owe" ? "📥" : "📤";
    const text2 =
      direction === "they_owe"
        ? isRu ? `${personName} должен тебе` : `${personName} owes you`
        : isRu ? `Ты должен ${personName}` : `You owe ${personName}`;

    await ctx.reply(
      `${emoji} ${isRu ? "Записал" : "Recorded"}: ${text2} *${amount.toFixed(2)} ${sym}*` +
        (reason ? `\n${isRu ? "Причина" : "Reason"}: ${reason}` : ""),
      {
        parse_mode: "Markdown",
        reply_markup: personDebtActionsKeyboard(debt.id, direction),
      }
    );
  });

  // Settle debt
  bot.callbackQuery(/^settle_debt:(\d+)$/, async (ctx) => {
    const debtId = parseInt(ctx.match![1]);
    await prisma.personDebt.update({
      where: { id: debtId },
      data: { isSettled: true, settledAt: new Date() },
    });
    const isRu = ctx.dbUser!.language === "ru";
    await ctx.editMessageText(isRu ? "✅ Долг закрыт!" : "✅ Debt settled!");
    await ctx.answerCallbackQuery(isRu ? "Закрыто!" : "Done!");
  });

  // Delete person debt
  bot.callbackQuery(/^delete_person_debt:(\d+)$/, async (ctx) => {
    const debtId = parseInt(ctx.match![1]);
    await prisma.personDebt.delete({ where: { id: debtId } });
    const isRu = ctx.dbUser!.language === "ru";
    await ctx.editMessageText(isRu ? "🗑 Запись удалена" : "🗑 Entry deleted");
    await ctx.answerCallbackQuery();
  });
}
