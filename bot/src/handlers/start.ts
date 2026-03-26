import type { Bot } from "grammy";
import type { BotContext } from "../types.js";
import { openAppKeyboard, languageKeyboard, currencyKeyboard } from "../keyboards/inline.js";
import { prisma } from "../bot.js";
import { currencySymbol } from "../../../shared/currencies.js";

export function setupStartHandler(bot: Bot<BotContext>) {
  bot.command("start", async (ctx) => {
    const user = ctx.dbUser!;
    const webappUrl = process.env.WEBAPP_URL || "https://cashflow.app";

    if (!user.onboardingDone) {
      await ctx.reply(
        "👋 Hi! I'm *Cashflow* — your financial assistant in Telegram.\n\n" +
          "🇷🇺 Привет! Я *Cashflow* — твой финансовый помощник.\n\n" +
          "Choose your language / Выбери язык:",
        {
          parse_mode: "Markdown",
          reply_markup: languageKeyboard(),
        }
      );
      return;
    }

    const sym = currencySymbol(user.currency);
    const isRu = user.language === "ru";
    await ctx.reply(
      isRu
        ? `👋 С возвращением, *${ctx.from?.first_name}*!\n\n` +
          "Просто пиши расходы — я запишу:\n" +
          `\`кофе 4.50\` или \`такси 12\`\n` +
          `Валюта по умолчанию: *${user.currency} ${sym}*\n` +
          `Можно указать другую: \`кофе 4.50 usd\`\n\n` +
          "Команды:\n" +
          "/balance — баланс счетов\n" +
          "/add — добавить расход\n" +
          "/income — записать доход\n" +
          "/debt — записать долг\n" +
          "/subs — подписки\n" +
          "/stats — статистика\n" +
          "/help — справка"
        : `👋 Welcome back, *${ctx.from?.first_name}*!\n\n` +
          "Just type expenses — I'll record them:\n" +
          `\`coffee 4.50\` or \`taxi 12\`\n` +
          `Default currency: *${user.currency} ${sym}*\n` +
          `You can specify another: \`coffee 4.50 usd\`\n\n` +
          "Commands:\n" +
          "/balance — account balances\n" +
          "/add — add expense\n" +
          "/income — record income\n" +
          "/debt — record debt\n" +
          "/subs — subscriptions\n" +
          "/stats — statistics\n" +
          "/help — help",
      {
        parse_mode: "Markdown",
        reply_markup: openAppKeyboard(webappUrl),
      }
    );
  });

  // Language selection (onboarding step 1)
  bot.callbackQuery(/^lang:(.+)$/, async (ctx) => {
    const language = ctx.match![1];
    await prisma.user.update({
      where: { id: ctx.dbUser!.id },
      data: { language },
    });
    ctx.dbUser!.language = language;

    const isRu = language === "ru";
    await ctx.editMessageText(
      isRu
        ? "🇷🇺 Отлично! Язык: *Русский*\n\nТеперь выбери основную валюту:"
        : "🇬🇧 Great! Language: *English*\n\nNow choose your main currency:",
      {
        parse_mode: "Markdown",
        reply_markup: currencyKeyboard(),
      }
    );
    await ctx.answerCallbackQuery();
  });

  // Currency selection (onboarding step 2)
  bot.callbackQuery(/^currency:(.+)$/, async (ctx) => {
    const currency = ctx.match![1];
    await prisma.user.update({
      where: { id: ctx.dbUser!.id },
      data: { currency, onboardingDone: true },
    });
    ctx.dbUser!.currency = currency;

    const sym = currencySymbol(currency);
    const isRu = ctx.dbUser!.language === "ru";
    const webappUrl = process.env.WEBAPP_URL || "https://cashflow.app";

    await ctx.editMessageText(
      isRu
        ? `✅ Валюта: *${currency} ${sym}*\n\n` +
          "Готово! Теперь просто пиши расходы:\n" +
          `\`кофе 4.50\` — и я запишу.\n` +
          `Можно указать другую валюту: \`кофе 4.50 usd\`\n\n` +
          "Добавить счета, подписки и кредиты можно в Mini App 👇"
        : `✅ Currency: *${currency} ${sym}*\n\n` +
          "Done! Now just type expenses:\n" +
          `\`coffee 4.50\` — and I'll record it.\n` +
          `You can specify another currency: \`coffee 4.50 usd\`\n\n` +
          "Add accounts, subscriptions and credits in Mini App 👇",
      {
        parse_mode: "Markdown",
        reply_markup: openAppKeyboard(webappUrl),
      }
    );
    await ctx.answerCallbackQuery();
  });

  bot.command("help", async (ctx) => {
    const webappUrl = process.env.WEBAPP_URL || "https://cashflow.app";
    const sym = currencySymbol(ctx.dbUser!.currency);
    const isRu = ctx.dbUser!.language === "ru";

    await ctx.reply(
      isRu
        ? "📖 *Cashflow — Справка*\n\n" +
          "*Быстрый ввод расходов:*\n" +
          "Просто напиши текст с суммой:\n" +
          `\`кофе 4.50\` → ☕ Кофе — 4.50 ${sym}\n` +
          `\`такси 12\` → 🚕 Такси — 12.00 ${sym}\n` +
          `\`кофе 4.50 usd\` → ☕ Кофе — 4.50 $\n\n` +
          "*Команды:*\n" +
          "/balance — баланс всех счетов\n" +
          "/add — добавить расход интерактивно\n" +
          "/income — записать поступление\n" +
          "/debt — записать личный долг\n" +
          "/subs — показать подписки\n" +
          "/stats — статистика за месяц\n" +
          "/app — открыть Mini App\n\n" +
          "Аналитика и управление — в Mini App 👇"
        : "📖 *Cashflow — Help*\n\n" +
          "*Quick expense entry:*\n" +
          "Just type text with an amount:\n" +
          `\`coffee 4.50\` → ☕ Coffee — 4.50 ${sym}\n` +
          `\`taxi 12\` → 🚕 Taxi — 12.00 ${sym}\n` +
          `\`coffee 4.50 usd\` → ☕ Coffee — 4.50 $\n\n` +
          "*Commands:*\n" +
          "/balance — all account balances\n" +
          "/add — add expense interactively\n" +
          "/income — record income\n" +
          "/debt — record personal debt\n" +
          "/subs — show subscriptions\n" +
          "/stats — monthly statistics\n" +
          "/app — open Mini App\n\n" +
          "Analytics and management — in Mini App 👇",
      {
        parse_mode: "Markdown",
        reply_markup: openAppKeyboard(webappUrl),
      }
    );
  });
}
