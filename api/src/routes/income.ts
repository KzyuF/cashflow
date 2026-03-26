import type { FastifyInstance } from "fastify";
import { prisma } from "../server.js";

export async function incomeRoutes(app: FastifyInstance) {
  app.get("/", async (request) => {
    return prisma.income.findMany({
      where: { userId: request.userId },
      orderBy: { date: "desc" },
      include: { account: { select: { name: true } } },
    });
  });

  app.post("/", async (request) => {
    const body = request.body as {
      name: string;
      amount: number;
      type: string;
      accountId?: number;
      date?: string;
      note?: string;
      isRecurring?: boolean;
      recurDay?: number;
    };

    const income = await prisma.income.create({
      data: {
        userId: request.userId,
        name: body.name,
        amount: body.amount,
        type: body.type,
        accountId: body.accountId,
        date: body.date ? new Date(body.date) : new Date(),
        note: body.note,
        isRecurring: body.isRecurring || false,
        recurDay: body.recurDay,
        source: "webapp",
      },
    });

    if (body.accountId) {
      await prisma.account.update({
        where: { id: body.accountId },
        data: { balance: { increment: body.amount } },
      });
    }

    return income;
  });

  app.delete("/:id", async (request) => {
    const { id } = request.params as { id: string };

    const income = await prisma.income.findFirst({
      where: { id: parseInt(id), userId: request.userId },
    });
    if (!income) throw { statusCode: 404, message: "Not found" };

    await prisma.income.delete({ where: { id: parseInt(id) } });
    return { ok: true };
  });
}
