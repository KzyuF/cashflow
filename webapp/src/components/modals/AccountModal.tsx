import React, { useState } from "react";
import { Modal, ModalInput, ModalButton } from "../ui/Modal";
import { Pill } from "../ui/Pill";
import { ACCOUNT_TYPES, CURRENCY_CODES, CURRENCIES, currencySymbol } from "../../utils/constants";
import { api } from "../../api/client";
import { useAppStore } from "../../store";

interface Props {
  onClose: () => void;
}

export function AccountModal({ onClose }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState("bank");
  const [balance, setBalance] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [maturityDate, setMaturityDate] = useState("");
  const userCurrency = useAppStore((s) => s.userCurrency);
  const [currency, setCurrency] = useState(userCurrency);

  const isDeposit = type === "deposit" || type === "savings";

  const handleSubmit = async () => {
    if (!name || !balance) return;
    await api.createAccount({
      name,
      type,
      currency,
      balance: parseFloat(balance),
      ...(isDeposit && interestRate
        ? {
            interestRate: parseFloat(interestRate),
            maturityDate: maturityDate || undefined,
          }
        : {}),
    });
    onClose();
  };

  return (
    <Modal title="Новый счёт" onClose={onClose}>
      <div className="text-xs text-[#556] mb-1.5 font-semibold">Тип</div>
      <div className="flex gap-[5px] flex-wrap mb-3">
        {Object.entries(ACCOUNT_TYPES).map(([k, t]) => (
          <Pill
            key={k}
            selected={type === k}
            color={t.color}
            onClick={() => setType(k)}
          >
            {t.icon} {t.name}
          </Pill>
        ))}
      </div>
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
        placeholder="Название (напр. Swedbank)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <ModalInput
        placeholder={`Текущий баланс ${currencySymbol(currency)}`}
        type="number"
        inputMode="decimal"
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
      />
      {isDeposit && (
        <>
          <ModalInput
            placeholder="Процентная ставка %"
            type="number"
            inputMode="decimal"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
          />
          <ModalInput
            placeholder="Дата окончания вклада"
            type="date"
            value={maturityDate}
            onChange={(e) => setMaturityDate(e.target.value)}
          />
        </>
      )}
      <ModalButton color="#6c5ce7" onClick={handleSubmit}>
        Добавить счёт
      </ModalButton>
    </Modal>
  );
}
