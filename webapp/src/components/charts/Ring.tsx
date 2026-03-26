import React from "react";

interface Segment {
  value: number;
  color: string;
}

interface RingProps {
  segments: Segment[];
  size?: number;
  thickness?: number;
  children?: React.ReactNode;
}

export function Ring({
  segments,
  size = 140,
  thickness = 14,
  children,
}: RingProps) {
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let offset = 0;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={thickness}
        />
        {segments
          .filter((s) => s.value > 0)
          .map((seg, i) => {
            const p = total > 0 ? seg.value / total : 0;
            const dash = p * circ;
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                style={{
                  transition: "all 0.8s ease",
                  transitionDelay: `${i * 80}ms`,
                }}
              />
            );
            offset += dash;
            return el;
          })}
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
