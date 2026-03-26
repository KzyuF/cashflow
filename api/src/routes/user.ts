import type { FastifyInstance } from "fastify";
import { prisma } from "../server.js";

export async function userRoutes(app: FastifyInstance) {
  // GET /api/user — get current user
  app.get("/", async (request) => {
    return prisma.user.findUnique({
      where: { id: request.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        language: true,
        currency: true,
        onboardingDone: true,
      },
    });
  });

  // PATCH /api/user — update user settings
  app.patch("/", async (request) => {
    const body = request.body as {
      currency?: string;
      language?: string;
    };

    const data: Record<string, unknown> = {};
    if (body.currency) data.currency = body.currency;
    if (body.language) data.language = body.language;

    return prisma.user.update({
      where: { id: request.userId },
      data,
      select: {
        id: true,
        firstName: true,
        language: true,
        currency: true,
      },
    });
  });
}
