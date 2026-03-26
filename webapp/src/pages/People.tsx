import React, { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { Ring } from "../components/charts/Ring";
import { Pill } from "../components/ui/Pill";
import { fmtDate } from "../utils/format";
import { api } from "../api/client";
import { useAppStore } from "../store";

export function People() {
  const [people, setPeople] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const setModal = useAppStore((s) => s.setModal);

  useEffect(() => {
    api.getPeople().then(setPeople).catch(console.error);
  }, []);

  const active = people.filter((p) => !p.isSettled);
  const theyOweMe = active
    .filter((p) => p.direction === "they_owe")
    .reduce((s, p) => s + Number(p.amount), 0);
  const iOweThem = active
    .filter((p) => p.direction === "i_owe")
    .reduce((s, p) => s + Number(p.amount), 0);

  const filters = [
    { key: "all", label: "Все", color: "#00d2ff" },
    { key: "they_owe", label: "Мне должны", color: "#00ffcc" },
    { key: "i_owe", label: "Я должен", color: "#ff6b6b" },
    { key: "settled", label: "Закрытые", color: "#556" },
  ];

  const list =
    filter === "all"
      ? active
      : filter === "settled"
        ? people.filter((p) => p.isSettled)
        : active.filter((p) => p.direction === filter);

  const handleSettle = async (id: number) => {
    await api.settlePerson(id);
    setPeople((p) =>
      p.map((pp) =>
        pp.id === id ? { ...pp, isSettled: true } : pp
      )
    );
  };

  const handleDelete = async (id: number) => {
    await api.deletePerson(id);
    setPeople((p) => p.filter((pp) => pp.id !== id));
  };

  return (
    <>
      {/* Summary */}
      <div className="px-[18px]">
        <Card className="flex gap-2.5">
          <div className="flex-1 text-center">
            <Ring
              segments={[
                { value: theyOweMe, color: "#00ffcc" },
                { value: iOweThem, color: "#ff6b6b" },
              ]}
              size={100}
              thickness={9}
            >
              <div
                className="text-[15px] font-black font-mono"
                style={{
                  color:
                    theyOweMe - iOweThem >= 0 ? "#00ffcc" : "#ff6b6b",
                }}
              >
                {theyOweMe - iOweThem >= 0 ? "+" : ""}
                {(theyOweMe - iOweThem).toFixed(0)}
              </div>
              <div className="text-[8px] text-[#556]">баланс</div>
            </Ring>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-2">
            <div className="bg-accent-green/[0.06] rounded-[11px] py-[9px] px-3">
              <div className="text-[9px] text-accent-green font-semibold">
                Тебе должны
              </div>
              <div className="text-lg font-black font-mono text-accent-green">
                +{theyOweMe.toFixed(0)} €
              </div>
            </div>
            <div className="bg-accent-red/[0.06] rounded-[11px] py-[9px] px-3">
              <div className="text-[9px] text-accent-red font-semibold">
                Ты должен
              </div>
              <div className="text-lg font-black font-mono text-accent-red">
                −{iOweThem.toFixed(0)} €
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters + list */}
      <div className="px-[18px] mt-[18px]">
        <div className="flex gap-[5px] mb-3.5 overflow-x-auto pb-1">
          {filters.map((f) => (
            <Pill
              key={f.key}
              selected={filter === f.key}
              color={f.color}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Pill>
          ))}
        </div>

        <div className="flex justify-between items-center mb-2.5">
          <span className="text-xs font-bold text-[#556] tracking-wider uppercase">
            {filters.find((f) => f.key === filter)?.label}
          </span>
          <button
            onClick={() => setModal("person")}
            className="text-[11px] font-bold text-accent-primary px-[11px] py-[5px] rounded-[9px] border border-accent-primary/30 bg-transparent cursor-pointer"
          >
            + Записать
          </button>
        </div>

        {list.length === 0 && (
          <Card className="text-center py-9">
            <div className="text-4xl mb-2.5">✨</div>
            <div className="text-[13px] text-[#556]">Нет записей</div>
          </Card>
        )}

        {list.map((p) => (
          <Card
            key={p.id}
            style={{
              background: p.isSettled
                ? "rgba(255,255,255,0.02)"
                : p.direction === "they_owe"
                  ? "linear-gradient(145deg, rgba(0,255,204,0.04), transparent)"
                  : "linear-gradient(145deg, rgba(255,107,107,0.04), transparent)",
              border: `1px solid ${p.isSettled ? "rgba(255,255,255,0.04)" : p.direction === "they_owe" ? "rgba(0,255,204,0.1)" : "rgba(255,107,107,0.1)"}`,
              opacity: p.isSettled ? 0.5 : 1,
            }}
          >
            <div className="flex items-center gap-[11px]">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-[22px] shrink-0"
                style={{
                  background:
                    p.direction === "they_owe"
                      ? "rgba(0,255,204,0.1)"
                      : "rgba(255,107,107,0.1)",
                }}
              >
                {p.avatar || "🧑‍💻"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm">{p.personName}</span>
                  {p.isSettled && (
                    <span className="text-[9px] font-bold px-[7px] py-[2px] rounded-[7px] bg-[#55615] text-[#556]">
                      закрыто
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#556] mt-0.5">
                  {p.reason || "—"}
                </div>
                <div className="text-[10px] text-[#445] mt-0.5">
                  {fmtDate(p.date)}
                </div>
              </div>
              <div className="text-right">
                <div
                  className="text-lg font-black font-mono"
                  style={{
                    color: p.isSettled
                      ? "#556"
                      : p.direction === "they_owe"
                        ? "#00ffcc"
                        : "#ff6b6b",
                  }}
                >
                  {p.direction === "they_owe" ? "+" : "−"}
                  {Number(p.amount).toFixed(0)} €
                </div>
              </div>
            </div>
            {!p.isSettled && (
              <div className="flex gap-[7px] mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSettle(p.id);
                  }}
                  className="flex-[2] py-[11px] border-none rounded-[14px] font-extrabold text-xs cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${p.direction === "they_owe" ? "#00ffcc" : "#ff6b6b"}, ${p.direction === "they_owe" ? "#00ffcc" : "#ff6b6b"}aa)`,
                    color: p.direction === "they_owe" ? "#000" : "#fff",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  ✓ {p.direction === "they_owe" ? "Вернул" : "Отдал"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(p.id);
                  }}
                  className="flex-1 py-[11px] rounded-[14px] border border-white/[0.08] bg-transparent text-[#556] text-xs font-bold cursor-pointer"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  🗑
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
