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
