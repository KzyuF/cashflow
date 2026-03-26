import React, { useState } from "react";
import { Modal, ModalInput, ModalButton } from "../ui/Modal";
import { Pill } from "../ui/Pill";
import { INCOME_TYPES, CURRENCY_CODES, CURRENCIES, currencySymbol } from "../../utils/constants";
import { api } from "../../api/client";
import { useAppStore } from "../../store";

interface Props {
  onClose: () => void;
  accounts: any[];
}

export function IncomeModal({ onClose, accounts }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("salary");
  const [accountId, setAccountId] = useState("");
  const userCurrency = useAppStore((s) => s.userCurrency);
  const [currency, setCurrency] = useState(userCurrency);

  const handleSubmit = async () => {
    if (!name || !amount) return;
    await api.createIncome({
      name,
      amount: parseFloat(amount),
      type,
      currency,
      accountId: accountId ? parseInt(accountId) : undefined,
    });
    onClose();
  };

  return (
    <Modal title="Поступление" onClose={onClose}>
      <ModalInput
        placeholder="Название"
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
      <div className="text-xs text-[#556] mb-1.5 font-semibold">Тип</div>
      <div className="flex gap-[5px] flex-wrap mb-3">
        {Object.entries(INCOME_TYPES).map(([k, t]) => (
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
      {accounts.length > 0 && (
        <>
          <div className="text-xs text-[#556] mb-1.5 font-semibold">
            На счёт
          </div>
          <div className="flex gap-[5px] flex-wrap mb-3.5">
            {accounts.map((a) => (
              <Pill
                key={a.id}
                selected={accountId === String(a.id)}
                color="#6c5ce7"
                onClick={() => setAccountId(String(a.id))}
              >
                {a.name}
              </Pill>
            ))}
          </div>
        </>
      )}
      <ModalButton color="#00ffcc" onClick={handleSubmit}>
        Записать поступление
      </ModalButton>
    </Modal>
  );
}
