import React, { useState } from "react";
import { Modal, ModalInput, ModalButton } from "../ui/Modal";
import { Pill } from "../ui/Pill";
import { AVATARS, CURRENCY_CODES, CURRENCIES, currencySymbol } from "../../utils/constants";
import { api } from "../../api/client";
import { useAppStore } from "../../store";

interface Props {
  onClose: () => void;
}

export function PersonModal({ onClose }: Props) {
  const [direction, setDirection] = useState("they_owe");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [avatar, setAvatar] = useState("🧑‍💻");
  const userCurrency = useAppStore((s) => s.userCurrency);
  const [currency, setCurrency] = useState(userCurrency);

  const handleSubmit = async () => {
    if (!name || !amount) return;
    await api.createPerson({
      personName: name,
      direction,
      amount: parseFloat(amount),
      currency,
      reason: reason || undefined,
      avatar,
    });
    onClose();
  };

  const dirs = [
    { d: "they_owe", icon: "📥", label: "Мне должны", color: "#00ffcc" },
    { d: "i_owe", icon: "📤", label: "Я должен", color: "#ff6b6b" },
  ];

  return (
    <Modal title="Записать долг" onClose={onClose}>
      <div className="flex gap-2 mb-3.5">
        {dirs.map((o) => (
          <div
            key={o.d}
            onClick={() => setDirection(o.d)}
            className="flex-1 p-3 rounded-[14px] text-center cursor-pointer transition-all"
            style={{
              background:
                direction === o.d
                  ? `${o.color}12`
                  : "rgba(255,255,255,0.03)",
              border: `2px solid ${direction === o.d ? o.color : "rgba(255,255,255,0.06)"}`,
            }}
          >
            <div className="text-[22px] mb-0.5">{o.icon}</div>
            <div
              className="text-xs font-bold"
              style={{
                color: direction === o.d ? o.color : "#556",
              }}
            >
              {o.label}
            </div>
          </div>
        ))}
      </div>
      <ModalInput
        placeholder="Имя человека"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <ModalInput
        placeholder={`Сумма ${currencySymbol(currency)}`}
        type="number"
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
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
      <ModalInput
        placeholder="За что? (необязательно)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <div className="text-[11px] text-[#556] mb-1.5 font-semibold">
        Аватар
      </div>
      <div className="flex gap-[5px] flex-wrap mb-3.5">
        {AVATARS.map((av) => (
          <div
            key={av}
            onClick={() => setAvatar(av)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl cursor-pointer transition-all"
            style={{
              background:
                avatar === av
                  ? "rgba(0,210,255,0.15)"
                  : "rgba(255,255,255,0.03)",
              border: `2px solid ${avatar === av ? "#00d2ff" : "transparent"}`,
            }}
          >
            {av}
          </div>
        ))}
      </div>
      <ModalButton
        color={direction === "they_owe" ? "#00ffcc" : "#ff6b6b"}
        onClick={handleSubmit}
      >
        Записать
      </ModalButton>
    </Modal>
  );
}
