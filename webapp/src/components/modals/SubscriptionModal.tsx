import React, { useState } from "react";
import { Modal, ModalInput, ModalButton } from "../ui/Modal";
import { Pill } from "../ui/Pill";
import { api } from "../../api/client";

const ICONS = ["📺", "🎵", "🎮", "☁️", "🤖", "📝", "🎨", "💼", "📦", "🏋️", "📰", "🔐"];

interface Props {
  onClose: () => void;
}

export function SubscriptionModal({ onClose }: Props) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [icon, setIcon] = useState("📦");

  const handleSubmit = async () => {
    if (!name || !price) return;
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    await api.createSubscription({
      name,
      price: parseFloat(price),
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
        placeholder="Стоимость €/мес"
        type="number"
        inputMode="decimal"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
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
