import React, { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { Ring } from "../components/charts/Ring";
import { IconCircle } from "../components/ui/IconCircle";
import { Pill } from "../components/ui/Pill";
import { ACCOUNT_TYPES, INCOME_TYPES, CURRENCIES, CURRENCY_CODES, currencySymbol } from "../utils/constants";
import { fmtK, fmtDate, daysUntil } from "../utils/format";
import { api } from "../api/client";
import { useAppStore } from "../store";

export function Accounts() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [income, setIncome] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const setModal = useAppStore((s) => s.setModal);
  const userCurrency = useAppStore((s) => s.userCurrency);
  const setUserCurrency = useAppStore((s) => s.setUserCurrency);

  useEffect(() => {
    api.getAccounts().then(setAccounts).catch(console.error);
    api.getIncome().then(setIncome).catch(console.error);
  }, []);

  const total = accounts.reduce((s, a) => s + Number(a.balance), 0);
  const sym = currencySymbol(userCurrency);

  const segments = accounts.map((a) => ({
    value: Number(a.balance),
    color: (ACCOUNT_TYPES[a.type] || ACCOUNT_TYPES.other).color,
  }));

  const byType: Record<string, number> = {};
  accounts.forEach((a) => {
    byType[a.type] = (byType[a.type] || 0) + Number(a.balance);
  });

  const handleCurrencyChange = async (code: string) => {
    await api.updateUser({ currency: code });
    setUserCurrency(code);
    setShowSettings(false);
  };

  return (
    <>
      {/* Ring chart */}
      <div className="px-[18px]">
        <Card className="flex items-center gap-[18px]">
          <Ring segments={segments} size={130} thickness={13}>
            <div className="text-lg font-black font-mono">
              {fmtK(total)}
            </div>
            <div className="text-[9px] text-[#556]">{userCurrency}</div>
          </Ring>
          <div className="flex-1">
            <div className="text-xs text-[#556] mb-1.5">Распределение</div>
            {Object.entries(byType).map(([type, sum]) => {
              const meta = ACCOUNT_TYPES[type] || ACCOUNT_TYPES.other;
              return (
                <div
                  key={type}
                  className="flex items-center gap-1.5 mb-1.5"
                >
                  <div
                    className="w-[7px] h-[7px] rounded-sm"
                    style={{ background: meta.color }}
                  />
                  <span className="text-[11px] text-[#889] flex-1">
                    {meta.name}
                  </span>
                  <span className="text-[11px] font-bold font-mono">
                    {fmtK(sum)} {sym}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Currency settings */}
      <div className="px-[18px] mt-[18px]">
        <div
          className="flex justify-between items-center mb-2.5 cursor-pointer"
          onClick={() => setShowSettings(!showSettings)}
        >
          <span className="text-xs font-bold text-[#556] tracking-wider uppercase">
            Основная валюта: {userCurrency} {sym}
          </span>
          <button
            className="text-[11px] font-bold text-accent-primary px-[11px] py-[5px] rounded-[9px] border border-accent-primary/30 bg-transparent cursor-pointer"
          >
            {showSettings ? "Скрыть" : "Сменить"}
          </button>
        </div>
        {showSettings && (
          <Card className="animate-slide-up">
            <div className="flex gap-[5px] flex-wrap">
              {CURRENCY_CODES.map((code) => (
                <Pill
                  key={code}
                  selected={userCurrency === code}
                  color="#00d2ff"
                  onClick={() => handleCurrencyChange(code)}
                >
                  {CURRENCIES[code].symbol} {code}
                </Pill>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* All accounts */}
      <div className="px-[18px] mt-[18px]">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-xs font-bold text-[#556] tracking-wider uppercase">
            Все счета
          </span>
          <button
            onClick={() => setModal("account")}
            className="text-[11px] font-bold text-accent-primary px-[11px] py-[5px] rounded-[9px] border border-accent-primary/30 bg-transparent cursor-pointer"
          >
            + Счёт
          </button>
        </div>
        {accounts.map((a) => {
          const meta = ACCOUNT_TYPES[a.type] || ACCOUNT_TYPES.other;
          const isDeposit = a.interestRate && Number(a.interestRate) > 0;
          const exp = expandedId === a.id;
          const accSym = currencySymbol(a.currency);
          return (
            <Card
              key={a.id}
              onClick={() => setExpandedId(exp ? null : a.id)}
              style={
                exp
                  ? { borderColor: `${meta.color}33` }
                  : undefined
              }
            >
              <div className="flex items-center gap-3">
                <IconCircle color={meta.color} size={44}>
                  {meta.icon}
                </IconCircle>
                <div className="flex-1">
                  <div className="font-bold text-sm">{a.name}</div>
                  <div className="flex gap-1.5 items-center mt-0.5">
                    <span
                      className="text-[9px] font-bold px-[7px] py-[2px] rounded-[7px]"
                      style={{
                        background: `${meta.color}15`,
                        color: meta.color,
                      }}
                    >
                      {meta.name}
                    </span>
                    <span className="text-[9px] font-bold px-[7px] py-[2px] rounded-[7px] bg-white/[0.05] text-[#889]">
                      {a.currency}
                    </span>
                    {isDeposit && (
                      <span
                        className="text-[9px] font-bold px-[7px] py-[2px] rounded-[7px]"
                        style={{
                          background: "#00ffcc15",
                          color: "#00ffcc",
                        }}
                      >
                        {Number(a.interestRate)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="text-xl font-black font-mono"
                    style={{ color: meta.color }}
                  >
                    {fmtK(Number(a.balance))} {accSym}
                  </div>
                  {a.currency !== userCurrency && a.balanceInMain != null && (
                    <div className="text-[10px] text-[#556] font-mono">
                      ≈ {fmtK(a.balanceInMain)} {sym}
                    </div>
                  )}
                </div>
              </div>
              {exp && isDeposit && (
                <div className="mt-3.5 pt-3.5 border-t border-white/[0.06] animate-slide-up grid grid-cols-2 gap-2">
                  {[
                    {
                      label: "Ставка",
                      value: `${Number(a.interestRate)}%`,
                    },
                    {
                      label: "След. проценты",
                      value: a.interestAmount
                        ? `+${Number(a.interestAmount)} ${accSym}`
                        : "—",
                      color: "#00ffcc",
                    },
                    {
                      label: "Срок вклада",
                      value: a.maturityDate
                        ? new Date(a.maturityDate).toLocaleDateString("ru")
                        : "—",
                    },
                    {
                      label: "Начисление",
                      value: a.nextInterestAt
                        ? `через ${daysUntil(a.nextInterestAt)} дн.`
                        : "—",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="p-2 bg-white/[0.02] rounded-[10px]"
                    >
                      <div className="text-[10px] text-[#556] mb-0.5">
                        {item.label}
                      </div>
                      <div
                        className="text-sm font-bold font-mono"
                        style={{ color: item.color }}
                      >
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

      {/* Income */}
      <div className="px-[18px] mt-[18px] mb-4">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-xs font-bold text-[#556] tracking-wider uppercase">
            Поступления
          </span>
          <button
            onClick={() => setModal("income")}
            className="text-[11px] font-bold text-accent-green px-[11px] py-[5px] rounded-[9px] border border-accent-green/30 bg-transparent cursor-pointer"
          >
            + Доход
          </button>
        </div>
        {income.map((inc) => {
          const meta = INCOME_TYPES[inc.type] || INCOME_TYPES.other;
          const incSym = currencySymbol(inc.currency || userCurrency);
          return (
            <div
              key={inc.id}
              className="flex items-center gap-[11px] py-[11px] border-b border-white/[0.04]"
            >
              <IconCircle color={meta.color}>{meta.icon}</IconCircle>
              <div className="flex-1">
                <div className="font-semibold text-sm">{inc.name}</div>
                <div className="flex gap-1.5 items-center mt-0.5">
                  <span className="text-[11px] text-[#556]">
                    {fmtDate(inc.date)}
                  </span>
                  <span
                    className="text-[9px] font-bold px-[7px] py-[2px] rounded-[7px]"
                    style={{
                      background: `${meta.color}15`,
                      color: meta.color,
                    }}
                  >
                    {meta.name}
                  </span>
                </div>
              </div>
              <div className="font-extrabold text-[15px] font-mono text-accent-green">
                +{Number(inc.amount).toFixed(2)} {incSym}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
