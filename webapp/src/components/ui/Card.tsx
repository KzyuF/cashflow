import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Card({ children, className = "", style, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-[18px] p-[18px] mb-2.5 animate-slide-up border border-white/[0.06] ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
