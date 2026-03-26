import { PrismaClient } from "@prisma/client";

// CBR daily JSON API
const CBR_URL = "https://www.cbr-xml-daily.ru/daily_json.js";

// Cache in memory
let lastFetchDate: string | null = null;
let ratesCache: Record<string, number> = {}; // { "USD": rate_to_1_RUB, ... }
let ratesDate: string | null = null;

/**
 * Fetch rates from CBR API. All rates are relative to RUB.
 * CBR gives: 1 USD = X RUB, so we store rate as X.
 */
export async function fetchRates(prisma: PrismaClient): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  if (lastFetchDate === today && Object.keys(ratesCache).length > 0) {
    return; // Already fetched today
  }

  try {
    const res = await fetch(CBR_URL);
    if (!res.ok) throw new Error(`CBR API returned ${res.status}`);
    const data = await res.json();

    const date = new Date(data.Date);
    const dateStr = date.toISOString().slice(0, 10);
    const newRates: Record<string, number> = { RUB: 1 };

    for (const [, val] of Object.entries(data.Valute) as [string, any][]) {
      const code = val.CharCode as string;
      const nominal = val.Nominal as number;
      const value = val.Value as number;
      // Rate = how many RUB for 1 unit of this currency
      newRates[code] = value / nominal;
    }

    // Save to DB
    const upserts = Object.entries(newRates)
      .filter(([code]) => code !== "RUB")
      .map(([code, rate]) =>
        prisma.currencyRate.upsert({
          where: {
            base_currency_date: { base: "RUB", currency: code, date },
          },
          update: { rate },
          create: { base: "RUB", currency: code, rate, date },
        })
      );
    await Promise.all(upserts);

    ratesCache = newRates;
    ratesDate = dateStr;
    lastFetchDate = today;
  } catch (err) {
    console.error("Failed to fetch CBR rates, using cached:", err);
    // Fallback: load from DB
    if (Object.keys(ratesCache).length === 0) {
      await loadCachedRates(prisma);
    }
  }
}

async function loadCachedRates(prisma: PrismaClient): Promise<void> {
  // Get latest rates from DB
  const latest = await prisma.currencyRate.findMany({
    orderBy: { date: "desc" },
    distinct: ["currency"],
    take: 50,
  });

  if (latest.length > 0) {
    ratesCache = { RUB: 1 };
    ratesDate = latest[0].date.toISOString().slice(0, 10);
    for (const r of latest) {
      ratesCache[r.currency] = Number(r.rate);
    }
  }
}

/**
 * Convert amount from one currency to another.
 * Uses RUB as intermediary (CBR rates are all vs RUB).
 */
export function convert(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) return amount;

  const fromRate = ratesCache[fromCurrency]; // 1 FROM = X RUB
  const toRate = ratesCache[toCurrency]; // 1 TO = Y RUB

  if (!fromRate || !toRate) {
    // Unknown currency pair, return as-is
    console.warn(`No rate for ${fromCurrency}->${toCurrency}`);
    return amount;
  }

  // amount FROM * (X RUB / 1 FROM) / (Y RUB / 1 TO) = amount in TO
  return (amount * fromRate) / toRate;
}

export function getRatesDate(): string | null {
  return ratesDate;
}

export function hasRates(): boolean {
  return Object.keys(ratesCache).length > 1;
}

export function getAllRates(): Record<string, number> {
  return { ...ratesCache };
}
