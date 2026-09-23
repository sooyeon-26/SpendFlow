import type { Expense, ExpenseCategory } from "../types/expense";
import { toDateKey } from "../utils/date";

const samples: [number, string, number, ExpenseCategory][] = [
  [0, "점심 식사", 12000, "식비"],
  [0, "오후 커피", 5500, "카페"],
  [1, "지하철 충전", 20000, "교통"],
  [2, "저녁 식사", 18000, "식비"],
  [2, "동네 카페", 6500, "카페"],
  [3, "영화 관람", 15000, "문화"],
  [4, "생활용품", 14000, "생활"],
  [4, "음악 구독", 9000, "구독"],
  [5, "주말 점심", 16000, "식비"],
  [6, "서점 구매", 14000, "쇼핑"],
];

// Keep every seed expense in the current month, including visits on its first day.
export function createDemoExpenses(now = new Date()): Expense[] {
  return samples.map(([days, merchant, amount, category], index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - days), 12, index);
    return {
      id: `demo-${index}`, date: toDateKey(date), merchant, amount, category,
      paymentMethod: "카드", source: "manual", confidence: 1, needsReview: false,
      memo: merchant, createdAt: date.toISOString(),
    };
  });
}
