import type { FastifyInstance } from "fastify";
import { prisma } from "../server.js";

export async function subscriptionRoutes(app: FastifyInstance) {
  app.get("/", async (request) => {
    return prisma.subscription.findMany({
      where: { userId: request.userId },
      orderBy: { nextDate: "asc" },
    });
  });

  app.post("/", async (request) => {
    const body = request.body as {
      name: string;
      price: number;
      currency?: string;
      cycle?: string;
      icon?: string;
      color?: string;
      nextDate: string;
      note?: string;
    };

    return prisma.subscription.create({
      data: {
        userId: request.userId,
        name: body.name,
        price: body.price,
        currency: body.currency || "EUR",
        cycle: body.cycle || "monthly",
        icon: body.icon,
        color: body.color,
        nextDate: new Date(body.nextDate),
        note: body.note,
      },
    });
  });

  app.patch("/:id", async (request) => {
    const { id } = request.params as { id: string };
    const body = request.body as { isActive?: boolean; price?: number; name?: string };

    const sub = await prisma.subscription.findFirst({
      where: { id: parseInt(id), userId: request.userId },
    });
    if (!sub) throw { statusCode: 404, message: "Not found" };

    const data: Record<string, unknown> = {};
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.price !== undefined) data.price = body.price;
    if (body.name !== undefined) data.name = body.name;

    return prisma.subscription.update({
      where: { id: parseInt(id) },
      data,
    });
  });

  app.delete("/:id", async (request) => {
    const { id } = request.params as { id: string };

    const sub = await prisma.subscription.findFirst({
      where: { id: parseInt(id), userId: request.userId },
    });
    if (!sub) throw { statusCode: 404, message: "Not found" };

    await prisma.subscription.delete({ where: { id: parseInt(id) } });
    return { ok: true };
  });
}
