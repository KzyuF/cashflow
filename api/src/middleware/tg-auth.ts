import { createHmac } from "crypto";
import type { FastifyRequest, FastifyReply } from "fastify";
import type { PrismaClient } from "@prisma/client";

/**
 * Validates Telegram WebApp initData using HMAC-SHA256.
 * Header format: Authorization: tma <initData>
 */
export async function tgAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  prisma: PrismaClient
) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("tma ")) {
    return reply.code(401).send({ error: "Missing authorization" });
  }

  const initData = authHeader.slice(4);

  // In development, allow mock auth with telegramId directly
  if (process.env.NODE_ENV === "development" && initData.startsWith("dev:")) {
    const telegramId = BigInt(initData.slice(4));
    const user = await prisma.user.findUnique({ where: { telegramId } });
    if (!user) {
      return reply.code(401).send({ error: "User not found" });
    }
    request.userId = user.id;
    return;
  }

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) {
      return reply.code(401).send({ error: "Invalid initData: no hash" });
    }

    params.delete("hash");
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");

    const botToken = process.env.BOT_TOKEN!;
    const secretKey = createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();
    const computedHash = createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (computedHash !== hash) {
      return reply.code(401).send({ error: "Invalid initData signature" });
    }

    // Extract user from initData
    const userParam = params.get("user");
    if (!userParam) {
      return reply.code(401).send({ error: "No user in initData" });
    }

    const tgUser = JSON.parse(userParam);
    const telegramId = BigInt(tgUser.id);

    // Find or create user
    let user = await prisma.user.findUnique({ where: { telegramId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          username: tgUser.username,
        },
      });
    }

    request.userId = user.id;
  } catch {
    return reply.code(401).send({ error: "Auth failed" });
  }
}

// Extend Fastify types
declare module "fastify" {
  interface FastifyRequest {
    userId: number;
  }
}
