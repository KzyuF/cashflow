export const CURRENCIES: Record<string, { symbol: string; name: string; nameEn: string }> = {
  RUB: { symbol: "₽", name: "Российский рубль", nameEn: "Russian Ruble" },
  EUR: { symbol: "€", name: "Евро", nameEn: "Euro" },
  USD: { symbol: "$", name: "Доллар США", nameEn: "US Dollar" },
  GBP: { symbol: "£", name: "Фунт стерлингов", nameEn: "British Pound" },
  UAH: { symbol: "₴", name: "Гривна", nameEn: "Ukrainian Hryvnia" },
  PLN: { symbol: "zł", name: "Злотый", nameEn: "Polish Zloty" },
  TRY: { symbol: "₺", name: "Турецкая лира", nameEn: "Turkish Lira" },
  KZT: { symbol: "₸", name: "Тенге", nameEn: "Kazakhstani Tenge" },
  BYN: { symbol: "Br", name: "Белорусский рубль", nameEn: "Belarusian Ruble" },
  GEL: { symbol: "₾", name: "Лари", nameEn: "Georgian Lari" },
  AED: { symbol: "د.إ", name: "Дирхам ОАЭ", nameEn: "UAE Dirham" },
  THB: { symbol: "฿", name: "Тайский бат", nameEn: "Thai Baht" },
  CNY: { symbol: "¥", name: "Юань", nameEn: "Chinese Yuan" },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES);

export function currencySymbol(code: string): string {
  return CURRENCIES[code]?.symbol || code;
}

export function formatMoney(amount: number, currencyCode: string): string {
  return `${amount.toFixed(2)} ${currencySymbol(currencyCode)}`;
}

// Maps symbols/aliases in text to currency codes for parser
const CURRENCY_TEXT_MAP: Record<string, string> = {
  "€": "EUR", "eur": "EUR", "евро": "EUR",
  "$": "USD", "usd": "USD", "долл": "USD", "бакс": "USD",
  "£": "GBP", "gbp": "GBP", "фунт": "GBP",
  "₽": "RUB", "rub": "RUB", "руб": "RUB",
  "₴": "UAH", "uah": "UAH", "грн": "UAH", "гривн": "UAH",
  "zł": "PLN", "pln": "PLN", "злот": "PLN",
  "₺": "TRY", "try": "TRY", "лир": "TRY",
  "₸": "KZT", "kzt": "KZT", "тенге": "KZT",
  "br": "BYN", "byn": "BYN",
  "₾": "GEL", "gel": "GEL", "лари": "GEL",
  "د.إ": "AED", "aed": "AED", "дирхам": "AED",
  "฿": "THB", "thb": "THB", "бат": "THB",
  "¥": "CNY", "cny": "CNY", "юан": "CNY",
};

/**
 * Detect currency from text, return [cleaned text, currency code | null]
 */
export function detectCurrencyInText(text: string): { cleanText: string; currency: string | null } {
  // Check for symbol at end/start: "кофе 4.50$", "$4.50 кофе"
  for (const [sym, code] of Object.entries(CURRENCY_TEXT_MAP)) {
    if (sym.length <= 2) {
      // Symbol-based: look for it adjacent to numbers
      const regex = new RegExp(`(\\d)\\s*${escapeRegex(sym)}(?:\\s|$)`, "i");
      if (regex.test(text)) {
        return { cleanText: text.replace(new RegExp(escapeRegex(sym), "gi"), "").trim(), currency: code };
      }
      const regex2 = new RegExp(`(?:^|\\s)${escapeRegex(sym)}\\s*(\\d)`, "i");
      if (regex2.test(text)) {
        return { cleanText: text.replace(new RegExp(escapeRegex(sym), "gi"), "").trim(), currency: code };
      }
    }
  }

  // Check for word-based: "кофе 4.50 usd", "кофе 4.50 долларов"
  const words = text.toLowerCase().split(/\s+/);
  for (const word of words) {
    // Try exact match first
    if (CURRENCY_TEXT_MAP[word]) {
      return {
        cleanText: text.replace(new RegExp(`\\b${escapeRegex(word)}\\b`, "gi"), "").trim(),
        currency: CURRENCY_TEXT_MAP[word],
      };
    }
    // Try prefix match (руб, рубл, рублей, долларов, etc.)
    for (const [key, code] of Object.entries(CURRENCY_TEXT_MAP)) {
      if (key.length >= 3 && word.startsWith(key)) {
        return {
          cleanText: text.replace(new RegExp(`\\b${escapeRegex(word)}\\b`, "gi"), "").trim(),
          currency: code,
        };
      }
    }
  }

  return { cleanText: text, currency: null };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
