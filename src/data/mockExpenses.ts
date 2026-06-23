import type { Expense } from "../types/expense";
import { daysAgo } from "../utils/date";

function expense(days: number, merchant: string, amount: number, category: Expense["category"], confidence = 0.92): Expense {
  const date = daysAgo(days);
  return {
    id: `${date}-${merchant}-${amount}`.replace(/\s/g, "-"),
    date,
    merchant,
    amount,
    category,
    source: "mock-ai",
    confidence,
    needsReview: confidence < 0.8,
    createdAt: `${date}T09:30:00.000Z`
  };
}

export const mockExpenses: Expense[] = [
  expense(0, "스타벅스", 6800, "카페", 0.96),
  expense(0, "지하철", 1550, "교통", 0.95),
  expense(0, "김밥", 4500, "식비", 0.9),
  expense(1, "올리브영", 28900, "쇼핑", 0.94),
  expense(1, "메가커피", 4200, "카페", 0.97),
  expense(2, "쿠팡", 43000, "쇼핑", 0.93),
  expense(2, "편의점", 7200, "식비", 0.89),
  expense(3, "스타벅스", 7200, "카페", 0.96),
  expense(3, "버스", 1500, "교통", 0.95),
  expense(4, "무신사", 36500, "쇼핑", 0.91),
  expense(5, "넷플릭스", 17000, "구독", 0.98),
  expense(5, "다이소", 12000, "생활", 0.86),
  expense(6, "투썸플레이스", 6100, "카페", 0.95),
  expense(7, "마트", 38400, "식비", 0.91),
  expense(9, "네이버페이", 45900, "쇼핑", 0.82),
  expense(11, "식당", 18700, "식비", 0.88),
  expense(13, "택시", 12800, "교통", 0.92),
  expense(15, "생활용품", 16500, "생활", 0.79),
  expense(17, "유튜브", 14900, "구독", 0.97),
  expense(19, "카페", 5400, "카페", 0.84)
];
