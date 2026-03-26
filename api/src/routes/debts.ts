import type { FastifyInstance } from "fastify";
import { prisma } from "../server.js";

export async function debtRoutes(app: FastifyInstance) {
  app.get("/", async (request) => {
    return prisma.debt.findMany({
      where: { userId: request.userId },
      orderBy: { nextPayment: "asc" },
    });
  });

  app.post("/", async (request) => {
    const body = request.body as {
      type: string;
      name: string;
      bank?: string;
      totalAmount: number;
      remainingAmount?: number;
      monthlyPayment: number;
      interestRate?: number;
      startDate: string;
      endDate: string;
      totalMonths: number;
      paidMonths?: number;
      nextPayment: string;
      note?: string;
    };

    return prisma.debt.create({
      data: {
        userId: request.userId,
        type: body.type,
        name: body.name,
        bank: body.bank,
        totalAmount: body.totalAmount,
        remainingAmount: body.remainingAmount ?? body.totalAmount,
        monthlyPayment: body.monthlyPayment,
        interestRate: body.interestRate ?? 0,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        totalMonths: body.totalMonths,
        paidMonths: body.paidMonths ?? 0,
        nextPayment: new Date(body.nextPayment),
        note: body.note,
      },
    });
  });

  app.patch("/:id", async (request) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;

    const debt = await prisma.debt.findFirst({
      where: { id: parseInt(id), userId: request.userId },
    });
    if (!debt) throw { statusCode: 404, message: "Not found" };

    return prisma.debt.update({
      where: { id: parseInt(id) },
      data: body,
    });
  });

  app.delete("/:id", async (request) => {
    const { id } = request.params as { id: string };

    const debt = await prisma.debt.findFirst({
      where: { id: parseInt(id), userId: request.userId },
    });
    if (!debt) throw { statusCode: 404, message: "Not found" };

    await prisma.debt.delete({ where: { id: parseInt(id) } });
    return { ok: true };
  });
}
