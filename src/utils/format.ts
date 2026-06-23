export function formatWon(amount: number): string {
  return `${Math.round(amount).toLocaleString("ko-KR")}원`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
