import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";
import { tgAuthMiddleware } from "./middleware/tg-auth.js";
import { accountRoutes } from "./routes/accounts.js";
import { expenseRoutes } from "./routes/expenses.js";
import { incomeRoutes } from "./routes/income.js";
import { subscriptionRoutes } from "./routes/subscriptions.js";
import { debtRoutes } from "./routes/debts.js";
import { peopleRoutes } from "./routes/people.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { currencyRoutes } from "./routes/currency.js";
import { userRoutes } from "./routes/user.js";
import { fetchRates } from "./services/currency.service.js";

export const prisma = new PrismaClient();

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: process.env.WEBAPP_URL || "*",
});

// Decorate request with user
app.decorateRequest("userId", 0);

// Auth hook for /api routes
app.addHook("onRequest", async (request, reply) => {
  if (request.url.startsWith("/api/")) {
    await tgAuthMiddleware(request, reply, prisma);
  }
});

// Routes
app.register(accountRoutes, { prefix: "/api/accounts" });
app.register(expenseRoutes, { prefix: "/api/expenses" });
app.register(incomeRoutes, { prefix: "/api/income" });
app.register(subscriptionRoutes, { prefix: "/api/subscriptions" });
app.register(debtRoutes, { prefix: "/api/debts" });
app.register(peopleRoutes, { prefix: "/api/people" });
app.register(dashboardRoutes, { prefix: "/api/dashboard" });
app.register(currencyRoutes, { prefix: "/api/currency" });
app.register(userRoutes, { prefix: "/api/user" });

// Health check
app.get("/health", async () => ({ status: "ok" }));

// Fetch currency rates on startup
fetchRates(prisma).catch((err) => console.error("Initial rate fetch failed:", err));

// Refresh rates every 6 hours
setInterval(() => {
  fetchRates(prisma).catch((err) => console.error("Rate fetch failed:", err));
}, 6 * 60 * 60 * 1000);

const port = parseInt(process.env.API_PORT || "3000");
const host = process.env.API_HOST || "0.0.0.0";

try {
  await app.listen({ port, host });
  console.log(`🚀 API server running on ${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
