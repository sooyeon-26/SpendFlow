export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toDateKey(date);
}

export function isSameMonth(dateKey: string, now = new Date()): boolean {
  const date = new Date(`${dateKey}T00:00:00`);
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export function isWithinDays(dateKey: string, days: number): boolean {
  const date = new Date(`${dateKey}T00:00:00`).getTime();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return date >= start.getTime() && date <= end.getTime();
}

export function shortKoreanDate(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00`);
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

export function weekdayLabel(dateKey: string): string {
  return new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(new Date(`${dateKey}T00:00:00`));
}
