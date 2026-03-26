import type { FastifyInstance } from "fastify";
import { prisma } from "../server.js";

export async function peopleRoutes(app: FastifyInstance) {
  app.get("/", async (request) => {
    const query = request.query as { filter?: string };

    const where: Record<string, unknown> = { userId: request.userId };
    if (query.filter === "active") where.isSettled = false;
    else if (query.filter === "settled") where.isSettled = true;

    return prisma.personDebt.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  });

  app.post("/", async (request) => {
    const body = request.body as {
      personName: string;
      avatar?: string;
      direction: string;
      amount: number;
      reason?: string;
      date?: string;
      note?: string;
    };

    return prisma.personDebt.create({
      data: {
        userId: request.userId,
        personName: body.personName,
        avatar: body.avatar,
        direction: body.direction,
        amount: body.amount,
        reason: body.reason,
        date: body.date ? new Date(body.date) : new Date(),
        note: body.note,
      },
    });
  });

  app.patch("/:id/settle", async (request) => {
    const { id } = request.params as { id: string };

    const debt = await prisma.personDebt.findFirst({
      where: { id: parseInt(id), userId: request.userId },
    });
    if (!debt) throw { statusCode: 404, message: "Not found" };

    return prisma.personDebt.update({
      where: { id: parseInt(id) },
      data: { isSettled: true, settledAt: new Date() },
    });
  });

  app.delete("/:id", async (request) => {
    const { id } = request.params as { id: string };

    const debt = await prisma.personDebt.findFirst({
      where: { id: parseInt(id), userId: request.userId },
    });
    if (!debt) throw { statusCode: 404, message: "Not found" };

    await prisma.personDebt.delete({ where: { id: parseInt(id) } });
    return { ok: true };
  });
}
