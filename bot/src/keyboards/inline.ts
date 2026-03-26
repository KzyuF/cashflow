import { InlineKeyboard } from "grammy";
import { CATEGORY_NAMES, CATEGORY_EMOJIS } from "../parsers/expense-parser.js";

export function expenseActionsKeyboard(expenseId: number): InlineKeyboard {
  return new InlineKeyboard()
    .text("Изменить категорию", `change_cat:${expenseId}`)
    .text("🗑 Удалить", `delete_exp:${expenseId}`);
}

export function categoryKeyboard(expenseId: number): InlineKeyboard {
  const kb = new InlineKeyboard();
  const cats = Object.entries(CATEGORY_NAMES);
  for (let i = 0; i < cats.length; i++) {
    const [key, name] = cats[i];
    kb.text(`${CATEGORY_EMOJIS[key]} ${name}`, `set_cat:${expenseId}:${key}`);
    if (i % 2 === 1) kb.row();
  }
  return kb;
}

export function incomeAccountKeyboard(
  accounts: { id: number; name: string }[]
): InlineKeyboard {
  const kb = new InlineKeyboard();
  for (const acc of accounts) {
    kb.text(acc.name, `income_acc:${acc.id}`).row();
  }
  kb.text("Не указывать", "income_acc:skip");
  return kb;
}

export function debtDirectionKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("📥 Мне должны", "debt_dir:they_owe")
    .text("📤 Я должен", "debt_dir:i_owe");
}

export function personDebtActionsKeyboard(
  debtId: number,
  direction: string
): InlineKeyboard {
  return new InlineKeyboard()
    .text(
      direction === "they_owe" ? "✓ Вернул" : "✓ Отдал",
      `settle_debt:${debtId}`
    )
    .text("🗑 Удалить", `delete_person_debt:${debtId}`);
}

export function openAppKeyboard(url: string): InlineKeyboard {
  return new InlineKeyboard().webApp("📊 Открыть Cashflow", url);
}

export function languageKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("🇷🇺 Русский", "lang:ru")
    .text("🇬🇧 English", "lang:en");
}

export function currencyKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("EUR €", "currency:EUR")
    .text("USD $", "currency:USD")
    .text("GBP £", "currency:GBP")
    .text("RUB ₽", "currency:RUB")
    .row()
    .text("UAH ₴", "currency:UAH")
    .text("PLN zł", "currency:PLN")
    .text("TRY ₺", "currency:TRY")
    .text("KZT ₸", "currency:KZT");
}
