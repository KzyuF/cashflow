import type { Bot } from "grammy";
import type { BotContext } from "../types.js";
import { openAppKeyboard } from "../keyboards/inline.js";
import { prisma } from "../bot.js";
import { currencySymbol } from "../../../shared/currencies.js";

export function setupMenuHandler(bot: Bot<BotContext>) {
  bot.command("app", async (ctx) => {
    const webappUrl = process.env.WEBAPP_URL || "https://cashflow.app";
    const isRu = ctx.dbUser!.language === "ru";
    await ctx.reply(
      isRu
        ? "Открой Mini App для полной аналитики 👇"
        : "Open Mini App for full analytics 👇",
      { reply_markup: openAppKeyboard(webappUrl) }
    );
  });

  bot.command("subs", async (ctx) => {
    const subs = await prisma.subscription.findMany({
      where: { userId: ctx.dbUser!.id },
      orderBy: { nextDate: "asc" },
    });

    const isRu = ctx.dbUser!.language === "ru";

    if (subs.length === 0) {
      await ctx.reply(
        isRu
          ? "У тебя пока нет подписок. Добавь их в Mini App! 📊"
          : "No subscriptions yet. Add them in Mini App! 📊"
      );
      return;
    }

    const active = subs.filter((s) => s.isActive);
    const paused = subs.filter((s) => !s.isActive);
    const totalMonthly = active.reduce((s, sub) => s + Number(sub.price), 0);
    const mainSym = currencySymbol(ctx.dbUser!.currency);

    let text = isRu
      ? `📋 *Подписки* (${totalMonthly.toFixed(2)} ${mainSym}/мес)\n\n`
      : `📋 *Subscriptions* (${totalMonthly.toFixed(2)} ${mainSym}/mo)\n\n`;

    for (const sub of active) {
      const sym = currencySymbol(sub.currency);
      const daysUntil = Math.ceil(
        (new Date(sub.nextDate).getTime() - Date.now()) / 864e5
      );
      text += `${sub.icon || "📦"} *${sub.name}* — ${Number(sub.price).toFixed(2)} ${sym}`;
      text += daysUntil > 0
        ? isRu ? ` (через ${daysUntil} дн.)\n` : ` (in ${daysUntil} days)\n`
        : isRu ? " (сегодня!)\n" : " (today!)\n";
    }

    if (paused.length > 0) {
      text += isRu ? "\n⏸ *На паузе:*\n" : "\n⏸ *Paused:*\n";
      for (const sub of paused) {
        const sym = currencySymbol(sub.currency);
        text += `  ${sub.icon || "📦"} ${sub.name} — ${Number(sub.price).toFixed(2)} ${sym}\n`;
      }
    }

    await ctx.reply(text, { parse_mode: "Markdown" });
  });
}
