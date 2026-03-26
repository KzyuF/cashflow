import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { Bars } from "../components/charts/Bars";
import { IconCircle } from "../components/ui/IconCircle";
import { ACCOUNT_TYPES } from "../utils/constants";
import { fmtK, daysUntil } from "../utils/format";
import { api } from "../api/client";
import { useAppStore } from "../store";

interface DashboardData {
  totalCapital: number;
  netWorth: number;
  totalDebtRemaining: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySubs: number;
  monthlyDebtPayments: number;
  upcomingPayments: any[];
  upcomingInterest: any[];
  peopleBalance: { theyOweMe: number; iOweThem: number; net: number };
  accounts: any[];
}

export function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const setTab = useAppStore((s) => s.setActiveTab);
  const setModal = useAppStore((s) => s.setModal);

  useEffect(() => {
    api.getDashboard().then(setData).catch(console.error);
  }, []);

  const weekData = useMemo(
    () =>
      ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((label, i) => ({
        label,
        value: 20 + Math.random() * 80 + (i === 3 ? 50 : 0),
        active: i <= new Date().getDay() - 1,
      })),
    []
  );

  if (!data) {
    return (
      <div className="px-[18px] mt-8 text-center text-[#556]">
        Загрузка...
      </div>
    );
  }

  const totalFlow =
    data.monthlyIncome -
    data.monthlyExpenses -
    data.monthlySubs -
    data.monthlyDebtPayments;

  return (
    <>
      {/* Capital Card */}
      <div className="px-[18px]">
        <Card
          className="animate-glow"
          style={{
            background:
              "linear-gradient(145deg, rgba(0,210,255,0.08), rgba(0,255,204,0.03))",
            border: "1px solid rgba(0,210,255,0.12)",
          }}
        >
          <div className="text-[11px] text-accent-primary font-semibold mb-1.5">
            Общий капитал
          </div>
          <div className="text-[38px] font-black font-mono tracking-tight leading-none">
            {fmtK(data.totalCapital)}
            <span className="text-lg text-[#556]"> €</span>
          </div>
          <div className="flex gap-4 mt-2.5 text-xs">
            <span className="text-accent-green">
              Чистый: {fmtK(data.netWorth)} €
            </span>
            <span className="text-accent-red">
              Долги: {fmtK(data.totalDebtRemaining)} €
            </span>
          </div>
        </Card>
      </div>

      {/* Accounts strip */}
      <div className="px-[18px] mt-[18px]">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-xs font-bold text-[#556] tracking-wider uppercase">
            Счета
          </span>
          <button
            onClick={() => setTab("accounts")}
            className="text-[10px] font-bold text-accent-primary px-2 py-0.5 rounded border border-accent-primary/30 bg-transparent cursor-pointer"
          >
            Все →
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1.5">
          {data.accounts.map((a: any) => {
            const meta = ACCOUNT_TYPES[a.type] || ACCOUNT_TYPES.other;
            return (
              <div
                key={a.id}
                className="min-w-[130px] p-3 rounded-[14px] shrink-0"
                style={{
                  background: `${meta.color}0a`,
                  border: `1px solid ${meta.color}18`,
                }}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-sm">{meta.icon}</span>
                  <span className="text-[10px] text-[#667] font-semibold truncate">
                    {a.name}
                  </span>
                </div>
                <div
                  className="text-[17px] font-black font-mono"
                  style={{ color: meta.color }}
                >
                  {fmtK(Number(a.balance))} €
                </div>
              </div>
            );
          })}
          <div
            onClick={() => setModal("account")}
            className="min-w-[60px] flex items-center justify-center rounded-[14px] border border-dashed border-white/10 cursor-pointer text-xl text-[#334] shrink-0"
          >
            +
          </div>
        </div>
      </div>

      {/* Monthly flow */}
      <div className="px-[18px] mt-[18px]">
        <span className="text-xs font-bold text-[#556] tracking-wider uppercase block mb-2.5">
          Поток за месяц
        </span>
        <Card className="flex gap-2.5">
          <div className="flex-1 rounded-[13px] p-3 text-center bg-accent-green/[0.06]">
            <div className="text-[10px] text-accent-green font-semibold mb-0.5">
              Доход
            </div>
            <div className="text-xl font-black font-mono text-accent-green">
              +{fmtK(data.monthlyIncome)}
            </div>
          </div>
          <div className="flex-1 rounded-[13px] p-3 text-center bg-accent-red/[0.06]">
            <div className="text-[10px] text-accent-red font-semibold mb-0.5">
              Расход
            </div>
            <div className="text-xl font-black font-mono text-accent-red">
              −
              {fmtK(
                data.monthlyExpenses +
                  data.monthlySubs +
                  data.monthlyDebtPayments
              )}
            </div>
          </div>
          <div
            className="flex-1 rounded-[13px] p-3 text-center"
            style={{
              background: `rgba(${totalFlow >= 0 ? "0,210,255" : "255,107,107"}, 0.06)`,
            }}
          >
            <div className="text-[10px] text-[#556] font-semibold mb-0.5">
              Итого
            </div>
            <div
              className="text-xl font-black font-mono"
              style={{
                color: totalFlow >= 0 ? "#00d2ff" : "#ff6b6b",
              }}
            >
              {totalFlow >= 0 ? "+" : ""}
              {fmtK(totalFlow)}
            </div>
          </div>
        </Card>
      </div>

      {/* Expected interest */}
      {data.upcomingInterest.length > 0 && (
        <div className="px-[18px] mt-[18px]">
          <span className="text-xs font-bold text-[#556] tracking-wider uppercase block mb-2.5">
            Ожидаемые поступления
          </span>
          {data.upcomingInterest.map((item: any, i: number) => (
            <Card
              key={i}
              style={{ borderLeft: "3px solid #00d2ff" }}
            >
              <div className="flex items-center gap-2.5">
                <IconCircle color="#00d2ff">📈</IconCircle>
                <div className="flex-1">
                  <div className="font-bold text-[13px]">{item.name}</div>
                  <div className="text-[11px] text-[#556]">
                    {item.rate}% · через {daysUntil(item.date)} дн.
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-[15px] font-mono text-accent-green">
                    +{item.amount} €
                  </div>
                  <div className="text-[10px] text-[#556]">проценты</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* People debts quick */}
      {data.peopleBalance.theyOweMe + data.peopleBalance.iOweThem > 0 && (
        <div className="px-[18px] mt-[18px]">
          <span className="text-xs font-bold text-[#556] tracking-wider uppercase block mb-2.5">
            Личные долги
          </span>
          <Card className="flex gap-2.5">
            <div className="flex-1 bg-accent-green/[0.06] rounded-[13px] p-[11px] text-center">
              <div className="text-[10px] text-accent-green font-semibold">
                Тебе
              </div>
              <div className="text-lg font-black font-mono text-accent-green">
                +{data.peopleBalance.theyOweMe.toFixed(0)} €
              </div>
            </div>
            <div className="flex-1 bg-accent-red/[0.06] rounded-[13px] p-[11px] text-center">
              <div className="text-[10px] text-accent-red font-semibold">
                Ты
              </div>
              <div className="text-lg font-black font-mono text-accent-red">
                −{data.peopleBalance.iOweThem.toFixed(0)} €
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Weekly chart */}
      <div className="px-[18px] mt-[18px]">
        <span className="text-xs font-bold text-[#556] tracking-wider uppercase block mb-2.5">
          Неделя
        </span>
        <Card>
          <Bars data={weekData} />
        </Card>
      </div>

      {/* Upcoming payments */}
      {data.upcomingPayments.length > 0 && (
        <div className="px-[18px] mt-[18px] mb-4">
          <span className="text-xs font-bold text-[#556] tracking-wider uppercase block mb-2.5">
            Ближайшие платежи
          </span>
          {data.upcomingPayments.slice(0, 5).map((p: any, i: number) => (
            <div
              key={i}
              className="flex items-center gap-3 py-2.5 border-b border-white/[0.04]"
            >
              <span className="text-base">
                {p.icon || (p.type === "subscription" ? "📦" : "🏦")}
              </span>
              <span className="flex-1 text-[13px] font-semibold">
                {p.name}
              </span>
              <span className="text-[13px] font-extrabold font-mono">
                {p.amount.toFixed(2)} €
              </span>
              <span className="text-[10px] text-[#556]">
                через {daysUntil(p.date)} дн.
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
