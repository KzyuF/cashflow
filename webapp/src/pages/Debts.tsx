import React, { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { Ring } from "../components/charts/Ring";
import { ProgressBar } from "../components/ui/ProgressBar";
import { DEBT_TYPES, currencySymbol } from "../utils/constants";
import { fmtK, pct } from "../utils/format";
import { api } from "../api/client";
import { useAppStore } from "../store";

export function Debts() {
  const [debts, setDebts] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const setModal = useAppStore((s) => s.setModal);
  const userCurrency = useAppStore((s) => s.userCurrency);
  const sym = currencySymbol(userCurrency);

  useEffect(() => {
    api.getDebts().then(setDebts).catch(console.error);
  }, []);

  const totalRemaining = debts.reduce(
    (s, d) => s + Number(d.remainingAmount),
    0
  );
  const totalMonthly = debts.reduce(
    (s, d) => s + Number(d.monthlyPayment),
    0
  );
  const totalPaid = debts.reduce(
    (s, d) => s + Number(d.totalAmount) - Number(d.remainingAmount),
    0
  );
  const totalAll = debts.reduce((s, d) => s + Number(d.totalAmount), 0);

  const byType: Record<string, any[]> = { mortgage: [], credit: [], installment: [] };
  debts.forEach((d) => {
    if (byType[d.type]) byType[d.type].push(d);
  });

  const ringSegments = Object.entries(byType).map(([t, arr]) => ({
    value: arr.reduce((s, d) => s + Number(d.remainingAmount), 0),
    color: DEBT_TYPES[t]?.color || "#636e72",
  }));

  return (
    <>
      {/* Summary */}
      <div className="px-[18px]">
        <Card className="flex items-center gap-4">
          <Ring segments={ringSegments} size={110} thickness={11}>
            <div className="text-base font-black font-mono">
              {fmtK(totalRemaining)}
            </div>
            <div className="text-[8px] text-[#556]">{userCurrency}</div>
          </Ring>
          <div className="flex-1">
            <div className="text-[11px] text-[#556] mb-1.5">Ежемесячно</div>
            <div className="text-2xl font-black font-mono text-accent-purple">
              {totalMonthly}
              <span className="text-[13px] text-[#556]"> {sym}</span>
            </div>
            <ProgressBar
              percent={pct(totalPaid, totalAll)}
              color="#00ffcc"
              height={4}
            />
          </div>
        </Card>
      </div>

      <div className="px-[18px] mt-[18px]">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-xs font-bold text-[#556] tracking-wider uppercase">
            Обязательства
          </span>
          <button
            onClick={() => setModal("debt")}
            className="text-[11px] font-bold text-accent-purple px-[11px] py-[5px] rounded-[9px] border border-accent-purple/30 bg-transparent cursor-pointer"
          >
            + Добавить
          </button>
        </div>
      </div>

      {Object.entries(byType)
        .filter(([, arr]) => arr.length > 0)
        .map(([type, items]) => {
          const meta = DEBT_TYPES[type];
          return (
            <div key={type} className="px-[18px]">
              <div className="flex items-center gap-[7px] mb-2">
                <span className="text-[15px]">{meta.icon}</span>
                <span
                  className="text-xs font-bold tracking-wider uppercase"
                  style={{ color: meta.color }}
                >
                  {meta.name}
                </span>
              </div>
              {items.map((debt) => {
                const paid = pct(
                  Number(debt.totalAmount) - Number(debt.remainingAmount),
                  Number(debt.totalAmount)
                );
                const exp = expandedId === debt.id;
                return (
                  <Card
                    key={debt.id}
                    onClick={() =>
                      setExpandedId(exp ? null : debt.id)
                    }
                  >
                    <div className="flex items-center gap-3">
                      {/* Mini ring */}
                      <svg
                        width={50}
                        height={50}
                        style={{
                          transform: "rotate(-90deg)",
                          flexShrink: 0,
                        }}
                      >
                        <circle
                          cx={25}
                          cy={25}
                          r={20}
                          fill="none"
                          stroke="rgba(255,255,255,0.06)"
                          strokeWidth={5}
                        />
                        <circle
                          cx={25}
                          cy={25}
                          r={20}
                          fill="none"
                          stroke={meta.color}
                          strokeWidth={5}
                          strokeDasharray={`${(paid / 100) * 2 * Math.PI * 20} ${2 * Math.PI * 20}`}
                          strokeLinecap="round"
                          style={{ transition: "all 1s ease" }}
                        />
                      </svg>
                      <div className="flex-1">
                        <div className="font-bold text-[13px]">
                          {debt.name}
                        </div>
                        <div className="text-[10px] text-[#556]">
                          {debt.bank} · {Number(debt.interestRate)}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-[15px] font-mono">
                          {Number(debt.monthlyPayment)} {sym}
                        </div>
                        <div className="text-[9px] text-[#556]">/мес</div>
                      </div>
                    </div>
                    {exp && (
                      <div className="mt-3.5 pt-3.5 border-t border-white/[0.06] animate-slide-up grid grid-cols-2 gap-2">
                        {[
                          {
                            label: "Всего",
                            value: `${fmtK(Number(debt.totalAmount))} ${sym}`,
                          },
                          {
                            label: "Остаток",
                            value: `${fmtK(Number(debt.remainingAmount))} ${sym}`,
                          },
                          {
                            label: "Выплачено",
                            value: `${paid.toFixed(0)}%`,
                          },
                          {
                            label: "Платежей осталось",
                            value: `${debt.totalMonths - debt.paidMonths}`,
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="p-[7px_9px] bg-white/[0.02] rounded-[9px]"
                          >
                            <div className="text-[9px] text-[#556] mb-0.5">
                              {item.label}
                            </div>
                            <div className="text-[13px] font-bold font-mono">
                              {item.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          );
        })}
    </>
  );
}
