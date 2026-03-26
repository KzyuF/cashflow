import React, { useState } from "react";
import { Modal, ModalInput, ModalButton } from "../ui/Modal";
import { Pill } from "../ui/Pill";
import { DEBT_TYPES, CURRENCY_CODES, CURRENCIES, currencySymbol } from "../../utils/constants";
import { api } from "../../api/client";
import { useAppStore } from "../../store";

interface Props {
  onClose: () => void;
}

export function DebtModal({ onClose }: Props) {
  const [type, setType] = useState("credit");
  const [name, setName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [totalMonths, setTotalMonths] = useState("");
  const userCurrency = useAppStore((s) => s.userCurrency);
  const [currency, setCurrency] = useState(userCurrency);

  const handleSubmit = async () => {
    if (!name || !totalAmount || !monthlyPayment) return;
    const total = parseFloat(totalAmount);
    const monthly = parseFloat(monthlyPayment);
    const now = new Date();
    const months = parseInt(totalMonths) || Math.ceil(total / monthly);
    const end = new Date(now);
    end.setMonth(end.getMonth() + months);
    const nextPay = new Date(now);
    nextPay.setMonth(nextPay.getMonth() + 1);

    await api.createDebt({
      type,
      name,
      currency,
      totalAmount: total,
      remainingAmount: total,
      monthlyPayment: monthly,
      interestRate: parseFloat(interestRate) || 0,
      startDate: now.toISOString(),
      endDate: end.toISOString(),
      totalMonths: months,
      nextPayment: nextPay.toISOString(),
    });
    onClose();
  };

  return (
    <Modal title="Новое обязательство" onClose={onClose}>
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
      <div className="flex gap-[7px] mb-3">
        {Object.entries(DEBT_TYPES).map(([k, dt]) => (
          <Pill
            key={k}
            selected={type === k}
            color={dt.color}
            onClick={() => setType(k)}
          >
            {dt.icon} {dt.name}
          </Pill>
        ))}
      </div>
      <ModalInput
        placeholder="Название"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <ModalInput
        placeholder={`Общая сумма ${currencySymbol(currency)}`}
        type="number"
        inputMode="decimal"
        value={totalAmount}
        onChange={(e) => setTotalAmount(e.target.value)}
      />
      <ModalInput
        placeholder={`Платёж ${currencySymbol(currency)}/мес`}
        type="number"
        inputMode="decimal"
        value={monthlyPayment}
        onChange={(e) => setMonthlyPayment(e.target.value)}
      />
      <div className="flex gap-[9px]">
        <ModalInput
          placeholder="Ставка %"
          type="number"
          inputMode="decimal"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
        />
        <ModalInput
          placeholder="Срок мес"
          type="number"
          value={totalMonths}
          onChange={(e) => setTotalMonths(e.target.value)}
        />
      </div>
      <ModalButton color="#6c5ce7" onClick={handleSubmit}>
        Добавить
      </ModalButton>
    </Modal>
  );
}
