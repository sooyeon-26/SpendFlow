import type { Expense } from "../types/expense";
import { DEFAULT_PAYMENT_METHOD } from "../constants/expenses";
import { daysAgo } from "../utils/date";

function expense(days: number, merchant: string, amount: number, category: Expense["category"], confidence = 0.92): Expense {
  const date = daysAgo(days);
  return {
    id: `${date}-${merchant}-${amount}`.replace(/\s/g, "-"),
    date,
    merchant,
    amount,
    category,
    paymentMethod: DEFAULT_PAYMENT_METHOD,
    source: "mock-ai",
    confidence,
    needsReview: confidence < 0.8,
    memo: merchant,
    createdAt: `${date}T09:30:00.000Z`
  };
}

// 테스트 케이스 메모
// safe: defaultBudget.monthlyBudget 기준 총 소비를 30% 이하로 낮추면 위험 알림 없이 긍정 인사이트를 확인할 수 있어요.
// warning: currentSpent가 monthlyBudget의 80% 이상 100% 이하가 되도록 amount를 올리면 BUDGET_WARNING이 표시돼요.
// over: currentSpent가 monthlyBudget을 초과하도록 amount를 올리면 BUDGET_OVER가 표시돼요.
// category concentration: 한 카테고리 amount 합계가 전체 소비의 40% 이상이면 CATEGORY_CONCENTRATION이 표시돼요.
// weekly spike: days 0~6 소비 합계가 days 7~13 소비 합계보다 30% 이상 크면 WEEKLY_SPIKE가 표시돼요.
// daily report safe: 위험 조건 없는 일반 데일리 브리핑은 safe 상태의 데이터로 확인할 수 있어요.
// daily report warning: 예산 80% 이상 사용한 데일리 브리핑은 warning 상태의 데이터로 확인할 수 있어요.
// daily report over: 예산 초과 데일리 브리핑은 over 상태의 데이터로 확인할 수 있어요.
// daily report category concentration: 특정 카테고리 집중 소비가 포함된 데일리 브리핑은 category concentration 상태로 확인할 수 있어요.
// daily report zero today: 오늘 소비 금액이 0원인 브리핑은 days 0 항목을 제거하거나 날짜를 이전 날짜로 바꿔 확인할 수 있어요.
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
