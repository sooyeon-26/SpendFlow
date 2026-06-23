import type { Budget, Expense } from "../types/expense";
import { formatWon } from "./format";
import { getBudgetUsage, getDaySpent, getMonthlySpent, getRemainingBudget, getTopCategory } from "./analytics";

export type SpendAlertType = "BUDGET_WARNING" | "BUDGET_EXCEEDED" | "DAILY_SPEND_ALERT";

export type SpendAlertPayload = {
  type: SpendAlertType;
  percentage: number;
  monthlySpent: number;
  monthlyBudget: number;
  remainingBudget: number;
  topCategory: string;
  message: string;
  expenseId?: string;
  dailySpent?: number;
  createdAt: string;
};

export function createSpendAlertPayloads(expenses: Expense[], budget: Budget, latestExpense?: Expense): SpendAlertPayload[] {
  const monthlySpent = getMonthlySpent(expenses);
  const percentage = Math.round(getBudgetUsage(monthlySpent, budget.monthlyBudget));
  const remainingBudget = getRemainingBudget(expenses, budget.monthlyBudget);
  const topCategory = getTopCategory(expenses);
  const base = {
    percentage,
    monthlySpent,
    monthlyBudget: budget.monthlyBudget,
    remainingBudget,
    topCategory: topCategory.category,
    expenseId: latestExpense?.id,
    createdAt: new Date().toISOString()
  };

  const payloads: SpendAlertPayload[] = [];

  if (percentage >= 100) {
    payloads.push({
      ...base,
      type: "BUDGET_EXCEEDED",
      message: "이번 달 예산을 초과했어요. 소비 흐름을 잠시 잔잔하게 만들어볼까요?"
    });
  } else if (percentage >= 80) {
    payloads.push({
      ...base,
      type: "BUDGET_WARNING",
      message: "이번 달 예산의 80%를 사용했어요."
    });
  }

  if (latestExpense) {
    const dailySpent = getDaySpent(expenses, latestExpense.date);
    if (dailySpent >= 50000) {
      payloads.push({
        ...base,
        type: "DAILY_SPEND_ALERT",
        dailySpent,
        message: `${latestExpense.date} 하루 소비가 ${formatWon(dailySpent)}까지 차올랐어요.`
      });
    }
  }

  return payloads;
}

