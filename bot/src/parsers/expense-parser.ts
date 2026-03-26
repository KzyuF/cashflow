export interface ParsedExpense {
  name: string;
  amount: number;
  category: string;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  food: [
    "кофе", "coffee", "обед", "ужин", "завтрак", "ресторан", "доставка",
    "rimi", "maxima", "wolt", "bolt food", "glovo", "яндекс еда",
    "пицца", "суши", "бургер", "макдональдс", "kfc", "subway",
    "продукты", "магазин", "супермаркет", "lidl", "aldi", "selver",
    "coop", "prisma", "еда", "перекус", "снэк", "бар",
  ],
  transport: [
    "такси", "taxi", "bolt", "uber", "бензин", "метро", "автобус",
    "трамвай", "парковка", "каршеринг", "самокат", "поезд", "билет",
    "проезд", "электричка", "топливо",
  ],
  shopping: [
    "zara", "h&m", "nike", "adidas", "одежда", "обувь", "куртка",
    "штаны", "футболка", "кроссовки", "сумка", "amazon", "aliexpress",
    "wildberries", "ozon", "покупка",
  ],
  health: [
    "аптека", "врач", "стоматолог", "анализы", "больница", "клиника",
    "лекарство", "витамины", "линзы", "очки", "медицина", "терапевт",
  ],
  entertainment: [
    "кино", "кинотеатр", "клуб", "концерт", "игра", "steam",
    "playstation", "xbox", "билет", "театр", "музей", "парк",
    "боулинг", "караоке", "развлечение",
  ],
  home: [
    "аренда", "электричество", "вода", "интернет", "уборка", "мебель",
    "ремонт", "квартира", "газ", "отопление", "коммуналка", "стирка",
    "посуда", "бытовая",
  ],
};

const CATEGORY_EMOJIS: Record<string, string> = {
  food: "🍕",
  transport: "🚕",
  shopping: "🛍",
  health: "💊",
  entertainment: "🎮",
  home: "🏠",
  other: "📦",
};

const CATEGORY_NAMES: Record<string, string> = {
  food: "Еда",
  transport: "Транспорт",
  shopping: "Покупки",
  health: "Здоровье",
  entertainment: "Развлечения",
  home: "Дом",
  other: "Другое",
};

export function parseExpense(text: string): ParsedExpense | null {
  // Match numbers: 4.50, 4,50, 4.5, 450, 1 234.50
  const amountMatch = text.match(
    /(\d[\d\s]*[.,]\d{1,2}|\d[\d\s]*)/
  );

  if (!amountMatch) return null;

  const amountStr = amountMatch[1]
    .replace(/\s/g, "")
    .replace(",", ".");
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) return null;

  // Everything except the number is the name
  let name = text
    .replace(amountMatch[0], "")
    .replace(/[€$₽£]/g, "")
    .trim();

  if (!name) name = "Расход";

  // Capitalize first letter
  name = name.charAt(0).toUpperCase() + name.slice(1);

  // Detect category
  const category = detectCategory(text.toLowerCase());

  return { name, amount, category };
}

function detectCategory(text: string): string {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return category;
      }
    }
  }
  return "other";
}

export function getCategoryEmoji(category: string): string {
  return CATEGORY_EMOJIS[category] || "📦";
}

export function getCategoryName(category: string): string {
  return CATEGORY_NAMES[category] || "Другое";
}

export { CATEGORY_NAMES, CATEGORY_EMOJIS };
