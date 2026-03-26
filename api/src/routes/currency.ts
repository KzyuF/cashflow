import type { FastifyInstance } from "fastify";
import { prisma } from "../server.js";
import { convert, getRatesDate, hasRates, getAllRates, fetchRates } from "../services/currency.service.js";

export async function currencyRoutes(app: FastifyInstance) {
  // GET /api/currency/rates — current rates
  app.get("/rates", async () => {
    if (!hasRates()) {
      await fetchRates(prisma);
    }
    return {
      date: getRatesDate(),
      rates: getAllRates(),
    };
  });

  // GET /api/currency/convert?amount=100&from=USD&to=EUR
  app.get("/convert", async (request) => {
    const query = request.query as {
      amount?: string;
      from?: string;
      to?: string;
    };

    if (!query.amount || !query.from || !query.to) {
      throw { statusCode: 400, message: "amount, from, to are required" };
    }

    if (!hasRates()) {
      await fetchRates(prisma);
    }

    const amount = parseFloat(query.amount);
    const result = convert(amount, query.from, query.to);

    return {
      from: query.from,
      to: query.to,
      amount,
      result,
      date: getRatesDate(),
    };
  });
}
