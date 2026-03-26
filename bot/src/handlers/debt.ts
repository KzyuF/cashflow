import type { Bot } from "grammy";
import type { BotContext } from "../types.js";
import {
  debtDirectionKeyboard,
  personDebtActionsKeyboard,
} from "../keyboards/inline.js";
import { prisma } from "../bot.js";

export function setupDebtHandler(bot: Bot<BotContext>) {
  bot.command("debt", async (ctx) => {
    ctx.session.step = "debt_direction";
    await ctx.reply("Выберите тип:", {
      reply_markup: debtDirectionKeyboard(),
    });
  });

  // Direction chosen
  bot.callbackQuery(/^debt_dir:(.+)$/, async (ctx) => {
    const direction = ctx.match![1]; // they_owe | i_owe
    ctx.session.data = { direction };
    ctx.session.step = "debt_waiting";

    await ctx.editMessageText(
      direction === "they_owe"
        ? "📥 Кто должен и сколько?\nПример: `Андрей 150 билеты на концерт`"
        : "📤 Кому и сколько?\nПример: `Марина 45 обед в ресторане`",
      { parse_mode: "Markdown" }
    );
    await ctx.answerCallbackQuery();
  });

  // Parse debt text
  bot.on("message:text", async (ctx, next) => {
    if (ctx.session.step !== "debt_waiting") return next();

    const text = ctx.message.text;
    // Parse: "Имя сумма причина"
    const match = text.match(/^(\S+)\s+(\d[\d.,]*)\s*(.*)?$/);
    if (!match) {
      await ctx.reply(
        "Не могу разобрать. Формат: `Имя сумма причина`\nПример: `Андрей 150 билеты`",
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

    const currency = ctx.dbUser!.currency;
    ctx.session.step = null;
    ctx.session.data = {};

    const emoji = direction === "they_owe" ? "📥" : "📤";
    const text2 =
      direction === "they_owe"
        ? `${personName} должен тебе`
        : `Ты должен ${personName}`;

    await ctx.reply(
      `${emoji} Записал: ${text2} *${amount.toFixed(2)} ${currency}*` +
        (reason ? `\nПричина: ${reason}` : ""),
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
    await ctx.editMessageText("✅ Долг закрыт!");
    await ctx.answerCallbackQuery("Закрыто!");
  });

  // Delete person debt
  bot.callbackQuery(/^delete_person_debt:(\d+)$/, async (ctx) => {
    const debtId = parseInt(ctx.match![1]);
    await prisma.personDebt.delete({ where: { id: debtId } });
    await ctx.editMessageText("🗑 Запись удалена");
    await ctx.answerCallbackQuery();
  });
}
