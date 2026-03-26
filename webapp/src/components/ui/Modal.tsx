import React from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center animate-fade-in"
      style={{
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] max-h-[88vh] overflow-y-auto"
        style={{
          background: "#0e0e1a",
          borderRadius: "22px 22px 0 0",
          padding: "22px 18px 36px",
          border: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[17px] font-black mb-[18px] text-center">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

export function ModalInput({
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-[15px] py-[13px] rounded-[13px] text-[15px] mb-2 text-[#e8e6e1]"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    />
  );
}

export function ModalButton({
  color = "#00d2ff",
  children,
  onClick,
}: {
  color?: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  const isDark = ["#fdcb6e", "#ffd700", "#feca57", "#00ffcc"].includes(color);
  return (
    <button
      onClick={onClick}
      className="w-full py-[15px] border-none rounded-[14px] font-extrabold text-[15px] cursor-pointer"
      style={{
        background: `linear-gradient(135deg, ${color}, ${color}aa)`,
        color: isDark ? "#000" : "#fff",
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: `0 4px 16px ${color}33`,
      }}
    >
      {children}
    </button>
  );
}
