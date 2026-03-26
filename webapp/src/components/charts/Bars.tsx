import React from "react";

interface BarData {
  label: string;
  value: number;
  color?: string;
  active?: boolean;
}

interface BarsProps {
  data: BarData[];
}

export function Bars({ data }: BarsProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-[3px] h-14">
      {data.map((d, i) => (
        <div
          key={i}
          className="flex flex-col items-center flex-1"
        >
          <div
            className="w-full rounded-t"
            style={{
              height: Math.max(3, (d.value / max) * 44),
              background:
                d.active !== false
                  ? `linear-gradient(180deg, ${d.color || "#00d2ff"}, ${d.color || "#00d2ff"}66)`
                  : "rgba(255,255,255,0.04)",
              transition: "height 0.5s cubic-bezier(0.34,1.56,0.64,1)",
              transitionDelay: `${i * 50}ms`,
            }}
          />
          <span className="text-[8px] text-[#445] mt-[3px]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
