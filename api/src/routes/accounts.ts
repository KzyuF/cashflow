import type { FastifyInstance } from "fastify";
import { prisma } from "../server.js";

export async function accountRoutes(app: FastifyInstance) {
  // GET /api/accounts
  app.get("/", async (request) => {
    return prisma.account.findMany({
      where: { userId: request.userId, isArchived: false },
      orderBy: { createdAt: "asc" },
    });
  });

  // POST /api/accounts
  app.post("/", async (request) => {
    const body = request.body as {
      name: string;
      type: string;
      balance: number;
      currency?: string;
      icon?: string;
      color?: string;
      interestRate?: number;
      maturityDate?: string;
      nextInterestAt?: string;
      interestAmount?: number;
    };

    return prisma.account.create({
      data: {
        userId: request.userId,
        name: body.name,
        type: body.type,
        balance: body.balance,
        currency: body.currency || "EUR",
        icon: body.icon,
        color: body.color,
        interestRate: body.interestRate,
        maturityDate: body.maturityDate ? new Date(body.maturityDate) : null,
        nextInterestAt: body.nextInterestAt
          ? new Date(body.nextInterestAt)
          : null,
        interestAmount: body.interestAmount,
      },
    });
  });

  // PATCH /api/accounts/:id
  app.patch("/:id", async (request) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;

    const account = await prisma.account.findFirst({
      where: { id: parseInt(id), userId: request.userId },
    });
    if (!account) throw { statusCode: 404, message: "Not found" };

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.balance !== undefined) data.balance = body.balance;
    if (body.type !== undefined) data.type = body.type;
    if (body.icon !== undefined) data.icon = body.icon;
    if (body.color !== undefined) data.color = body.color;
    if (body.interestRate !== undefined) data.interestRate = body.interestRate;

    return prisma.account.update({
      where: { id: parseInt(id) },
      data,
    });
  });

  // DELETE /api/accounts/:id
  app.delete("/:id", async (request) => {
    const { id } = request.params as { id: string };

    const account = await prisma.account.findFirst({
      where: { id: parseInt(id), userId: request.userId },
    });
    if (!account) throw { statusCode: 404, message: "Not found" };

    return prisma.account.update({
      where: { id: parseInt(id) },
      data: { isArchived: true },
    });
  });
}
