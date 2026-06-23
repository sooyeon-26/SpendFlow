const DAY_MS = 24 * 60 * 60 * 1000;

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function daysAgo(days: number): string {
  return toDateKey(new Date(Date.now() - days * DAY_MS));
}

export function isSameMonth(dateKey: string, now = new Date()): boolean {
  const date = new Date(`${dateKey}T00:00:00`);
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export function isWithinDays(dateKey: string, days: number): boolean {
  const date = new Date(`${dateKey}T00:00:00`).getTime();
  const start = Date.now() - (days - 1) * DAY_MS;
  return date >= start;
}

export function shortKoreanDate(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00`);
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

export function weekdayLabel(dateKey: string): string {
  return new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(new Date(`${dateKey}T00:00:00`));
}
