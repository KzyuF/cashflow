import { MONTHS } from "./constants";

export function fmtK(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "k";
  return n.toFixed(0);
}

export function fmt(n: number): string {
  return n.toFixed(2);
}

export function fmtDate(d: string | Date): string {
  const dt = new Date(d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dtDay = new Date(dt);
  dtDay.setHours(0, 0, 0, 0);

  const diff = (today.getTime() - dtDay.getTime()) / 864e5;
  if (diff === 0) return "Сегодня";
  if (diff === 1) return "Вчера";
  return `${dt.getDate()} ${MONTHS[dt.getMonth()]}`;
}

export function daysUntil(d: string | Date): number {
  return Math.ceil(
    (new Date(d).getTime() - Date.now()) / 864e5
  );
}

export function pct(a: number, b: number): number {
  return b > 0 ? Math.min(100, (a / b) * 100) : 0;
}
