import type { FastifyInstance } from "fastify";
import { prisma } from "../server.js";

export async function expenseRoutes(app: FastifyInstance) {
  // GET /api/expenses
  app.get("/", async (request) => {
    const query = request.query as { month?: string; category?: string };

    const where: Record<string, unknown> = { userId: request.userId };

    if (query.month) {
      const [year, month] = query.month.split("-").map(Number);
      where.date = {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      };
    }

    if (query.category) {
      where.category = query.category;
    }

    return prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
      include: { account: { select: { name: true } } },
    });
  });

  // POST /api/expenses
  app.post("/", async (request) => {
    const body = request.body as {
      name: string;
      amount: number;
      category: string;
      currency?: string;
      accountId?: number;
      date?: string;
      note?: string;
    };

    // Determine currency: explicit > account's > user's default
    let expCurrency = body.currency;
    if (!expCurrency && body.accountId) {
      const acc = await prisma.account.findUnique({ where: { id: body.accountId } });
      expCurrency = acc?.currency;
    }
    if (!expCurrency) {
      const user = await prisma.user.findUnique({ where: { id: request.userId } });
      expCurrency = user?.currency || "EUR";
    }

    const expense = await prisma.expense.create({
      data: {
        userId: request.userId,
        name: body.name,
        amount: body.amount,
        currency: expCurrency,
        category: body.category,
        accountId: body.accountId,
        date: body.date ? new Date(body.date) : new Date(),
        note: body.note,
        source: "webapp",
      },
    });

    // Deduct from account if specified
    if (body.accountId) {
      await prisma.account.update({
        where: { id: body.accountId },
        data: { balance: { decrement: body.amount } },
      });
    }

    return expense;
  });

  // DELETE /api/expenses/:id
  app.delete("/:id", async (request) => {
    const { id } = request.params as { id: string };

    const expense = await prisma.expense.findFirst({
      where: { id: parseInt(id), userId: request.userId },
    });
    if (!expense) throw { statusCode: 404, message: "Not found" };

    await prisma.expense.delete({ where: { id: parseInt(id) } });
    return { ok: true };
  });

  // GET /api/expenses/stats
  app.get("/stats", async (request) => {
    const query = request.query as { month?: string };

    const now = new Date();
    let start: Date;
    let end: Date;

    if (query.month) {
      const [year, month] = query.month.split("-").map(Number);
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 1);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    const expenses = await prisma.expense.findMany({
      where: {
        userId: request.userId,
        date: { gte: start, lt: end },
      },
    });

    const byCategory: Record<string, number> = {};
    let total = 0;
    for (const e of expenses) {
      const amt = Number(e.amount);
      total += amt;
      byCategory[e.category] = (byCategory[e.category] || 0) + amt;
    }

    return {
      total,
      byCategory,
      count: expenses.length,
    };
  });

  // GET /api/expenses/weekly
  app.get("/weekly", async (request) => {
    const now = new Date();
    const dayOfWeek = now.getDay() || 7; // 1=Mon ... 7=Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + 1);
    monday.setHours(0, 0, 0, 0);

    const expenses = await prisma.expense.findMany({
      where: {
        userId: request.userId,
        date: { gte: monday },
      },
    });

    const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
    const data = days.map((label, i) => {
      const dayExpenses = expenses.filter((e) => {
        const d = new Date(e.date);
        return (d.getDay() || 7) - 1 === i;
      });
      return {
        label,
        value: dayExpenses.reduce((s, e) => s + Number(e.amount), 0),
      };
    });

    return data;
  });
}
