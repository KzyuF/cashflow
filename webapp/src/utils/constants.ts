export const CURRENCIES: Record<
  string,
  { symbol: string; name: string; nameEn: string }
> = {
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

export const CATEGORIES: Record<
  string,
  { name: string; icon: string; color: string }
> = {
  food: { name: "Еда", icon: "🍕", color: "#ff6b6b" },
  transport: { name: "Транспорт", icon: "🚕", color: "#feca57" },
  shopping: { name: "Покупки", icon: "🛍", color: "#ff9ff3" },
  entertainment: { name: "Развлечения", icon: "🎮", color: "#54a0ff" },
  health: { name: "Здоровье", icon: "💊", color: "#5f27cd" },
  home: { name: "Дом", icon: "🏠", color: "#01a3a4" },
  other: { name: "Другое", icon: "📦", color: "#576574" },
};

export const ACCOUNT_TYPES: Record<
  string,
  { name: string; icon: string; color: string }
> = {
  bank: { name: "Банк. счёт", icon: "🏦", color: "#6c5ce7" },
  cash: { name: "Наличные", icon: "💵", color: "#00b894" },
  crypto: { name: "Крипто", icon: "₿", color: "#f7931a" },
  deposit: { name: "Вклад", icon: "📈", color: "#00d2ff" },
  savings: { name: "Накопительный", icon: "🐷", color: "#fd79a8" },
  card: { name: "Карта", icon: "💳", color: "#a29bfe" },
  other: { name: "Другое", icon: "💰", color: "#636e72" },
};

export const DEBT_TYPES: Record<
  string,
  { name: string; icon: string; color: string }
> = {
  mortgage: { name: "Ипотека", icon: "🏠", color: "#00b894" },
  credit: { name: "Кредит", icon: "🏦", color: "#6c5ce7" },
  installment: { name: "Рассрочка", icon: "📱", color: "#fdcb6e" },
};

export const INCOME_TYPES: Record<
  string,
  { name: string; icon: string; color: string }
> = {
  salary: { name: "Зарплата", icon: "💼", color: "#00b894" },
  freelance: { name: "Фриланс", icon: "💻", color: "#6c5ce7" },
  interest: { name: "Проценты", icon: "📈", color: "#00d2ff" },
  gift: { name: "Подарок", icon: "🎁", color: "#fd79a8" },
  refund: { name: "Возврат", icon: "↩️", color: "#fdcb6e" },
  found: { name: "Находка", icon: "🍀", color: "#00cec9" },
  other: { name: "Другое", icon: "💰", color: "#636e72" },
};

export const AVATARS = [
  "🧑‍💻",
  "👩‍🎨",
  "🧔",
  "👨‍🔧",
  "👩‍🏫",
  "🧑‍🎤",
  "👩‍⚕️",
  "👨‍🍳",
  "👩‍🔬",
  "🧑‍🚀",
  "👨‍🎓",
  "👩‍💼",
];

export const MONTHS = [
  "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
  "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек",
];
