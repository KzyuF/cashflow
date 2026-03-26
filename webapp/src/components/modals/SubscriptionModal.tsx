import React, { useState } from "react";
import { Modal, ModalInput, ModalButton } from "../ui/Modal";
import { Pill } from "../ui/Pill";
import { CURRENCY_CODES, CURRENCIES, currencySymbol } from "../../utils/constants";
import { api } from "../../api/client";
import { useAppStore } from "../../store";

const ICONS = ["📺", "🎵", "🎮", "☁️", "🤖", "📝", "🎨", "💼", "📦", "🏋️", "📰", "🔐"];

interface Props {
  onClose: () => void;
}

export function SubscriptionModal({ onClose }: Props) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [icon, setIcon] = useState("📦");
  const userCurrency = useAppStore((s) => s.userCurrency);
  const [currency, setCurrency] = useState(userCurrency);

  const handleSubmit = async () => {
    if (!name || !price) return;
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    await api.createSubscription({
      name,
      price: parseFloat(price),
      currency,
      icon,
      nextDate: nextDate.toISOString(),
    });
    onClose();
  };

  return (
    <Modal title="Новая подписка" onClose={onClose}>
      <ModalInput
        placeholder="Название"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <ModalInput
        placeholder={`Стоимость ${currencySymbol(currency)}/мес`}
        type="number"
        inputMode="decimal"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <div className="text-xs text-[#556] mb-1.5 font-semibold">Валюта</div>
      <div className="flex gap-[5px] flex-wrap mb-3">
        {CURRENCY_CODES.map((code) => (
          <Pill
            key={code}
            selected={currency === code}
            color="#00d2ff"
            onClick={() => setCurrency(code)}
          >
            {CURRENCIES[code].symbol} {code}
          </Pill>
        ))}
      </div>
      <div className="flex gap-[5px] flex-wrap mb-3.5">
        {ICONS.map((ic) => (
          <Pill
            key={ic}
            selected={icon === ic}
            color="#00d2ff"
            onClick={() => setIcon(ic)}
          >
            {ic}
          </Pill>
        ))}
      </div>
      <ModalButton color="#f368e0" onClick={handleSubmit}>
        Добавить
      </ModalButton>
    </Modal>
  );
}
