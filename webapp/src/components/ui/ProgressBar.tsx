import React from "react";

interface ProgressBarProps {
  percent: number;
  color?: string;
  height?: number;
}

export function ProgressBar({
  percent,
  color = "#00d2ff",
  height = 5,
}: ProgressBarProps) {
  return (
    <div
      className="rounded-full overflow-hidden"
      style={{ height, background: "rgba(255,255,255,0.06)" }}
    >
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${Math.min(100, percent)}%`,
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
        }}
      />
    </div>
  );
}
