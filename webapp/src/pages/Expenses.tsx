import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { IconCircle } from "../components/ui/IconCircle";
import { ProgressBar } from "../components/ui/ProgressBar";
import { CATEGORIES } from "../utils/constants";
import { fmtDate, pct, daysUntil } from "../utils/format";
import { api } from "../api/client";
import { useAppStore } from "../store";

export function Expenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const setModal = useAppStore((s) => s.setModal);

  useEffect(() => {
    api.getExpenses().then(setExpenses).catch(console.error);
    api.getSubscriptions().then(setSubs).catch(console.error);
  }, []);

  const totalExp = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const activeSubs = subs.filter((s) => s.isActive);
  const totalSubs = activeSubs.reduce((s, sub) => s + Number(sub.price), 0);

  const expByCat = useMemo(() => {
    const m: Record<string, number> = {};
    expenses.forEach((e) => {
      m[e.category] = (m[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(m)
      .map(([cat, value]) => ({
        cat,
        ...(CATEGORIES[cat] || CATEGORIES.other),
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const toggleSub = async (id: number, isActive: boolean) => {
    await api.updateSubscription(id, { isActive: !isActive });
    setSubs((p) =>
      p.map((s) => (s.id === id ? { ...s, isActive: !isActive } : s))
    );
  };

  return (
    <>
      {/* Summary */}
      <div className="px-[18px]">
        <Card className="flex gap-2.5">
          <div className="flex-1 text-center">
            <div className="text-[11px] text-accent-red mb-0.5">Расходы</div>
            <div className="text-[26px] font-black font-mono text-accent-red leading-none">
              {totalExp.toFixed(0)}
              <span className="text-sm text-[#556]"> €</span>
            </div>
          </div>
          <div className="w-px bg-white/[0.06]" />
          <div className="flex-1 text-center">
            <div className="text-[11px] text-accent-pink mb-0.5">
              Подписки
            </div>
            <div className="text-[26px] font-black font-mono text-accent-pink leading-none">
              {totalSubs.toFixed(0)}
              <span className="text-sm text-[#556]"> €</span>
            </div>
          </div>
        </Card>
      </div>

      {/* By category */}
      <div className="px-[18px] mt-[18px]">
        <span className="text-xs font-bold text-[#556] tracking-wider uppercase block mb-2.5">
          По категориям
        </span>
        {expByCat.map((c) => (
          <div
            key={c.cat}
            className="flex items-center gap-[11px] py-[11px] border-b border-white/[0.04]"
          >
            <IconCircle color={c.color}>{c.icon}</IconCircle>
            <div className="flex-1">
              <div className="font-semibold text-[13px]">{c.name}</div>
              <ProgressBar
                percent={pct(c.value, totalExp)}
                color={c.color}
              />
            </div>
            <div className="font-extrabold text-[13px] font-mono min-w-[60px] text-right">
              {c.value.toFixed(0)} €
            </div>
          </div>
        ))}
      </div>

      {/* Subscriptions */}
      <div className="px-[18px] mt-[18px]">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-xs font-bold text-[#556] tracking-wider uppercase">
            Подписки
          </span>
          <button
            onClick={() => setModal("subscription")}
            className="text-[11px] font-bold text-accent-pink px-[11px] py-[5px] rounded-[9px] border border-accent-pink/30 bg-transparent cursor-pointer"
          >
            + Добавить
          </button>
        </div>
        {subs.map((sub) => (
          <div
            key={sub.id}
            onClick={() => toggleSub(sub.id, sub.isActive)}
            className="flex items-center gap-[11px] p-3 rounded-[14px] mb-[7px] cursor-pointer transition-all"
            style={{
              background: sub.isActive
                ? `${sub.color || "#00d2ff"}0a`
                : "rgba(255,255,255,0.02)",
              border: `1px solid ${sub.isActive ? (sub.color || "#00d2ff") + "18" : "rgba(255,255,255,0.04)"}`,
              opacity: sub.isActive ? 1 : 0.45,
            }}
          >
            <IconCircle color={sub.color || "#00d2ff"}>
              {sub.icon || "📦"}
            </IconCircle>
            <div className="flex-1">
              <div className="font-bold text-[13px]">{sub.name}</div>
              <div className="text-[10px] text-[#556]">
                {sub.isActive
                  ? `через ${daysUntil(sub.nextDate)} дн.`
                  : "Пауза"}
              </div>
            </div>
            <div className="font-extrabold text-sm font-mono">
              {Number(sub.price).toFixed(2)} €
            </div>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div className="px-[18px] mt-[18px] mb-4">
        <span className="text-xs font-bold text-[#556] tracking-wider uppercase block mb-2.5">
          Транзакции
        </span>
        {expenses.map((exp) => {
          const cat = CATEGORIES[exp.category] || CATEGORIES.other;
          return (
            <div
              key={exp.id}
              className="flex items-center gap-[11px] py-[11px] border-b border-white/[0.04]"
            >
              <IconCircle color={cat.color}>{cat.icon}</IconCircle>
              <div className="flex-1">
                <div className="font-semibold text-[13px]">{exp.name}</div>
                <div className="flex gap-1.5 items-center mt-0.5">
                  <span className="text-[10px] text-[#556]">
                    {fmtDate(exp.date)}
                  </span>
                  <span
                    className="text-[9px] font-bold px-[7px] py-[2px] rounded-[7px]"
                    style={{
                      background: `${cat.color}15`,
                      color: cat.color,
                    }}
                  >
                    {cat.name}
                  </span>
                </div>
              </div>
              <div className="font-extrabold text-sm font-mono text-accent-red">
                −{Number(exp.amount).toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
