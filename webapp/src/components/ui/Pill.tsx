import React from "react";

interface PillProps {
  selected?: boolean;
  color: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Pill({ selected, color, children, onClick }: PillProps) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-[18px] text-xs whitespace-nowrap transition-all"
      style={{
        background: selected ? `${color}20` : "rgba(255,255,255,0.03)",
        border: `1px solid ${selected ? color : "rgba(255,255,255,0.06)"}`,
        color: selected ? color : "#667",
        fontWeight: selected ? 700 : 400,
      }}
    >
      {children}
    </button>
  );
}
