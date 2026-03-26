import type { Bot } from "grammy";
import type { BotContext } from "../types.js";
import { openAppKeyboard, currencyKeyboard } from "../keyboards/inline.js";
import { prisma } from "../bot.js";

export function setupStartHandler(bot: Bot<BotContext>) {
  bot.command("start", async (ctx) => {
    const user = ctx.dbUser!;
    const webappUrl = process.env.WEBAPP_URL || "https://cashflow.app";

    if (!user.onboardingDone) {
      await ctx.reply(
        "👋 Привет! Я *Cashflow* — твой финансовый помощник в Telegram.\n\n" +
          "Я помогу управлять счетами, расходами, доходами, подписками, кредитами и долгами.\n\n" +
          "Давай настроим. Какая у тебя основная валюта?",
        {
          parse_mode: "Markdown",
          reply_markup: currencyKeyboard(),
        }
      );
      return;
    }

    await ctx.reply(
      `👋 С возвращением, *${ctx.from?.first_name}*!\n\n` +
        "Просто пиши расходы — я запишу:\n" +
        '`кофе 4.50` или `такси 12`\n\n' +
        "Команды:\n" +
        "/balance — баланс счетов\n" +
        "/add — добавить расход\n" +
        "/income — записать доход\n" +
        "/debt — записать долг\n" +
        "/subs — подписки\n" +
        "/stats — статистика\n" +
        "/help — справка",
      {
        parse_mode: "Markdown",
        reply_markup: openAppKeyboard(webappUrl),
      }
    );
  });

  // Currency selection callback (onboarding step 1)
  bot.callbackQuery(/^currency:(.+)$/, async (ctx) => {
    const currency = ctx.match![1];
    await prisma.user.update({
      where: { id: ctx.dbUser!.id },
      data: { currency, onboardingDone: true },
    });
    ctx.dbUser!.currency = currency;

    const webappUrl = process.env.WEBAPP_URL || "https://cashflow.app";
    await ctx.editMessageText(
      `✅ Валюта установлена: *${currency}*\n\n` +
        "Готово! Теперь просто пиши расходы:\n" +
        "`кофе 4.50` — и я запишу.\n\n" +
        "Добавить счета, подписки и кредиты можно в Mini App 👇",
      {
        parse_mode: "Markdown",
        reply_markup: openAppKeyboard(webappUrl),
      }
    );
    await ctx.answerCallbackQuery();
  });

  bot.command("help", async (ctx) => {
    const webappUrl = process.env.WEBAPP_URL || "https://cashflow.app";
    await ctx.reply(
      "📖 *Cashflow — Справка*\n\n" +
        "*Быстрый ввод расходов:*\n" +
        "Просто напиши текст с суммой:\n" +
        "`кофе 4.50` → ☕ Кофе — 4.50 €\n" +
        "`такси 12` → 🚕 Такси — 12.00 €\n\n" +
        "*Команды:*\n" +
        "/balance — баланс всех счетов\n" +
        "/add — добавить расход интерактивно\n" +
        "/income — записать поступление\n" +
        "/debt — записать личный долг\n" +
        "/subs — показать подписки\n" +
        "/stats — статистика за месяц\n" +
        "/app — открыть Mini App\n\n" +
        "Аналитика, управление счетами и подписками — в Mini App 👇",
      {
        parse_mode: "Markdown",
        reply_markup: openAppKeyboard(webappUrl),
      }
    );
  });
}
