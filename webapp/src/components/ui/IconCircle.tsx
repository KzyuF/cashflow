import React from "react";

interface IconCircleProps {
  color: string;
  children: React.ReactNode;
  size?: number;
}

export function IconCircle({ color, children, size = 38 }: IconCircleProps) {
  return (
    <div
      className="flex items-center justify-center rounded-[11px] shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.45,
        background: `${color}15`,
      }}
    >
      {children}
    </div>
  );
}
