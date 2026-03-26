import React, { useEffect, useState } from "react";
import { Modal, ModalInput, ModalButton } from "../ui/Modal";
import { Pill } from "../ui/Pill";
import { CATEGORIES } from "../../utils/constants";
import { api } from "../../api/client";

interface Props {
  onClose: () => void;
  accounts: any[];
}

export function ExpenseModal({ onClose, accounts }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [accountId, setAccountId] = useState("");

  const handleSubmit = async () => {
    if (!name || !amount) return;
    await api.createExpense({
      name,
      amount: parseFloat(amount),
      category,
      accountId: accountId ? parseInt(accountId) : undefined,
    });
    onClose();
  };

  return (
    <Modal title="Новый расход" onClose={onClose}>
      <ModalInput
        placeholder="Название"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <ModalInput
        placeholder="Сумма €"
        type="number"
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <div className="text-xs text-[#556] mb-1.5 font-semibold">
        Категория
      </div>
      <div className="flex gap-[5px] flex-wrap mb-3">
        {Object.entries(CATEGORIES).map(([k, c]) => (
          <Pill
            key={k}
            selected={category === k}
            color={c.color}
            onClick={() => setCategory(k)}
          >
            {c.icon} {c.name}
          </Pill>
        ))}
      </div>
      {accounts.length > 0 && (
        <>
          <div className="text-xs text-[#556] mb-1.5 font-semibold">
            Со счёта
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
      <ModalButton onClick={handleSubmit}>Добавить</ModalButton>
    </Modal>
  );
}
