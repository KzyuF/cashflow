import React, { useState } from "react";
import { Modal, ModalInput, ModalButton } from "../ui/Modal";
import { Pill } from "../ui/Pill";
import { DEBT_TYPES } from "../../utils/constants";
import { api } from "../../api/client";

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
        placeholder="Общая сумма €"
        type="number"
        inputMode="decimal"
        value={totalAmount}
        onChange={(e) => setTotalAmount(e.target.value)}
      />
      <ModalInput
        placeholder="Платёж €/мес"
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
