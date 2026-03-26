import "dotenv/config";
import { Bot, session } from "grammy";
import { PrismaClient } from "@prisma/client";
import { setupStartHandler } from "./handlers/start.js";
import { setupExpenseHandler } from "./handlers/expense.js";
import { setupIncomeHandler } from "./handlers/income.js";
import { setupDebtHandler } from "./handlers/debt.js";
import { setupMenuHandler } from "./handlers/menu.js";
import { authMiddleware } from "./middleware/auth.js";
import type { BotContext, SessionData } from "./types.js";

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error("BOT_TOKEN is not set in environment variables");
}

export const prisma = new PrismaClient();
const bot = new Bot<BotContext>(token);

// Session for conversation state
bot.use(
  session({
    initial: (): SessionData => ({
      step: null,
      data: {},
    }),
  })
);

// Auth middleware — ensures user exists in DB
bot.use(authMiddleware(prisma));

// Register handlers
setupStartHandler(bot);
setupMenuHandler(bot);
setupIncomeHandler(bot);
setupDebtHandler(bot);
setupExpenseHandler(bot);

// Error handling
bot.catch((err) => {
  console.error("Bot error:", err);
});

// Start
bot.start({
  onStart: () => {
    console.log("🚀 Cashflow bot is running!");
  },
});
