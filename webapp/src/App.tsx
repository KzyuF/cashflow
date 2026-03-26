import React, { useEffect, useState } from "react";
import { useAppStore } from "./store";
import { Home } from "./pages/Home";
import { Accounts } from "./pages/Accounts";
import { Expenses } from "./pages/Expenses";
import { Debts } from "./pages/Debts";
import { People } from "./pages/People";
import { ExpenseModal } from "./components/modals/ExpenseModal";
import { IncomeModal } from "./components/modals/IncomeModal";
import { AccountModal } from "./components/modals/AccountModal";
import { SubscriptionModal } from "./components/modals/SubscriptionModal";
import { DebtModal } from "./components/modals/DebtModal";
import { PersonModal } from "./components/modals/PersonModal";
import { api } from "./api/client";

const TABS = [
  { key: "home", label: "Главная", icon: "◉" },
  { key: "accounts", label: "Счета", icon: "◈" },
  { key: "expenses", label: "Расходы", icon: "◎" },
  { key: "debts", label: "Долги", icon: "⧫" },
  { key: "people", label: "Люди", icon: "⊕" },
];

export default function App() {
  const { activeTab, setActiveTab, modal, setModal, setUserCurrency, setUserLanguage } = useAppStore();
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    api.getUser().then((u) => {
      if (u.currency) setUserCurrency(u.currency);
      if (u.language) setUserLanguage(u.language);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    api.getAccounts().then(setAccounts).catch(() => {});
  }, [modal]);

  const fabAction = () => {
    const map: Record<string, string> = {
      home: "expense",
      accounts: "income",
      expenses: "expense",
      debts: "debt",
      people: "person",
    };
    setModal(map[activeTab] || "expense");
  };

  const closeModal = () => {
    setModal(null);
    // Trigger re-render of active tab
    window.dispatchEvent(new Event("cashflow:refresh"));
  };

  return (
    <div className="font-sans min-h-screen max-w-[480px] mx-auto relative">
      {/* Background effects */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <div
        className="fixed z-0 pointer-events-none rounded-full"
        style={{
          top: -200,
          right: -200,
          width: 500,
          height: 500,
          background:
            "radial-gradient(circle, rgba(0,210,255,0.05), transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-[1] pb-[86px]">
        {/* Header */}
        <div className="flex justify-between items-center px-[18px] pt-[18px]">
          <div
            className="text-[19px] font-black tracking-tight"
            style={{
              background: "linear-gradient(135deg, #00d2ff, #00ffcc)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            cashflow
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setModal("income")}
              className="text-[11px] font-bold text-accent-green px-[11px] py-[5px] rounded-[9px] border border-accent-green/30 bg-transparent cursor-pointer flex items-center gap-1"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              📥 Доход
            </button>
            <div className="text-[9px] font-bold px-[9px] py-1 rounded-[18px] tracking-wider uppercase cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #ffd700, #ffaa00)",
                color: "#000",
              }}
            >
              ⚡ PRO
            </div>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === "home" && <Home />}
        {activeTab === "accounts" && <Accounts />}
        {activeTab === "expenses" && <Expenses />}
        {activeTab === "debts" && <Debts />}
        {activeTab === "people" && <People />}
      </div>

      {/* FAB */}
      <button
        onClick={fabAction}
        className="fixed z-20 flex items-center justify-center border-none text-[26px] text-black cursor-pointer font-light"
        style={{
          bottom: 90,
          right: 18,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #00d2ff, #00ffcc)",
          boxShadow: "0 4px 16px rgba(0,210,255,0.3)",
        }}
      >
        +
      </button>

      {/* Tab Bar */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] flex z-[15] border-t border-white/[0.06]"
        style={{
          background: "rgba(6,6,14,0.95)",
          backdropFilter: "blur(20px)",
          padding: "5px 0 20px",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="flex-1 flex flex-col items-center gap-[1px] bg-transparent border-none text-[9px] cursor-pointer py-[7px] transition-colors"
            style={{
              color: activeTab === t.key ? "#00d2ff" : "#334",
              fontWeight: activeTab === t.key ? 700 : 500,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <span
              className="text-[17px] leading-none"
              style={{
                filter:
                  activeTab === t.key
                    ? "drop-shadow(0 0 5px rgba(0,210,255,0.5))"
                    : "none",
              }}
            >
              {t.icon}
            </span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Modals */}
      {modal === "expense" && (
        <ExpenseModal onClose={closeModal} accounts={accounts} />
      )}
      {modal === "income" && (
        <IncomeModal onClose={closeModal} accounts={accounts} />
      )}
      {modal === "account" && <AccountModal onClose={closeModal} />}
      {modal === "subscription" && (
        <SubscriptionModal onClose={closeModal} />
      )}
      {modal === "debt" && <DebtModal onClose={closeModal} />}
      {modal === "person" && <PersonModal onClose={closeModal} />}
    </div>
  );
}
