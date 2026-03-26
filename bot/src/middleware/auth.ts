import type { PrismaClient } from "@prisma/client";
import type { MiddlewareFn } from "grammy";
import type { BotContext } from "../types.js";

export function authMiddleware(prisma: PrismaClient): MiddlewareFn<BotContext> {
  return async (ctx, next) => {
    const from = ctx.from;
    if (!from) return;

    let user = await prisma.user.findUnique({
      where: { telegramId: BigInt(from.id) },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId: BigInt(from.id),
          firstName: from.first_name,
          lastName: from.last_name ?? null,
          username: from.username ?? null,
        },
      });
    }

    ctx.dbUser = {
      id: user.id,
      telegramId: user.telegramId,
      currency: user.currency,
      onboardingDone: user.onboardingDone,
    };

    await next();
  };
}
