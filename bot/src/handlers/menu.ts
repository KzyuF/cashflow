import type { Bot } from "grammy";
import type { BotContext } from "../types.js";
import { openAppKeyboard } from "../keyboards/inline.js";
import { prisma } from "../bot.js";

export function setupMenuHandler(bot: Bot<BotContext>) {
  bot.command("app", async (ctx) => {
    const webappUrl = process.env.WEBAPP_URL || "https://cashflow.app";
    await ctx.reply("Открой Mini App для полной аналитики 👇", {
      reply_markup: openAppKeyboard(webappUrl),
    });
  });

  bot.command("subs", async (ctx) => {
    const subs = await prisma.subscription.findMany({
      where: { userId: ctx.dbUser!.id },
      orderBy: { nextDate: "asc" },
    });

    if (subs.length === 0) {
      await ctx.reply("У тебя пока нет подписок. Добавь их в Mini App! 📊");
      return;
    }

    const currency = ctx.dbUser!.currency;
    const active = subs.filter((s) => s.isActive);
    const paused = subs.filter((s) => !s.isActive);
    const totalMonthly = active.reduce((s, sub) => s + Number(sub.price), 0);

    let text = `📋 *Подписки* (${totalMonthly.toFixed(2)} ${currency}/мес)\n\n`;

    for (const sub of active) {
      const daysUntil = Math.ceil(
        (new Date(sub.nextDate).getTime() - Date.now()) / 864e5
      );
      text += `${sub.icon || "📦"} *${sub.name}* — ${Number(sub.price).toFixed(2)} ${currency}`;
      text += daysUntil > 0 ? ` (через ${daysUntil} дн.)\n` : " (сегодня!)\n";
    }

    if (paused.length > 0) {
      text += "\n⏸ *На паузе:*\n";
      for (const sub of paused) {
        text += `  ${sub.icon || "📦"} ${sub.name} — ${Number(sub.price).toFixed(2)} ${currency}\n`;
      }
    }

    await ctx.reply(text, { parse_mode: "Markdown" });
  });
}
