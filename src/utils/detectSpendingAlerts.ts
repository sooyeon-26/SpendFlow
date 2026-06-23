import type { Expense, ExpenseCategory } from "../types/expense";
import { isSameMonth, toDateKey } from "./date";

export type SpendingAlertType =
  | "BUDGET_WARNING"
  | "BUDGET_OVER"
  | "CATEGORY_CONCENTRATION"
  | "WEEKLY_SPIKE"
  | "DAILY_SPIKE";

export type SpendingAlertSeverity = "info" | "warning" | "danger";

export type SpendingAlert = {
  id: string;
  type: SpendingAlertType;
  severity: SpendingAlertSeverity;
  title: string;
  message: string;
  value: number;
  createdAt: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function getDateTime(dateKey: string): number {
  return new Date(`${dateKey}T00:00:00`).getTime();
}

function sumExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function detectSpendingAlerts(transactions: Expense[], monthlyBudget: number, currentSpent: number): SpendingAlert[] {
  const today = new Date();
  const todayKey = toDateKey(today);
  const monthlyTransactions = transactions.filter((transaction) => isSameMonth(transaction.date, today));
  const alerts: SpendingAlert[] = [];
  const usageRate = monthlyBudget > 0 ? (currentSpent / monthlyBudget) * 100 : 0;

  if (usageRate > 100) {
    alerts.push({
      id: "alert-budget-over",
      type: "BUDGET_OVER",
      severity: "danger",
      title: "예산을 초과했어요",
      message: `이번 달 예산의 ${formatPercent(usageRate)}를 사용했어요.`,
      value: Math.round(usageRate),
      createdAt: todayKey
    });
  } else if (usageRate >= 80) {
    alerts.push({
      id: "alert-budget-warning",
      type: "BUDGET_WARNING",
      severity: "warning",
      title: "예산에 가까워지고 있어요",
      message: `이번 달 예산의 ${formatPercent(usageRate)}를 사용했어요.`,
      value: Math.round(usageRate),
      createdAt: todayKey
    });
  }

  if (currentSpent > 0) {
    const categoryTotals = monthlyTransactions.reduce<Partial<Record<ExpenseCategory, number>>>((totals, transaction) => {
      totals[transaction.category] = (totals[transaction.category] ?? 0) + transaction.amount;
      return totals;
    }, {});
    const concentratedCategory = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category: category as ExpenseCategory,
        amount,
        rate: (amount / currentSpent) * 100
      }))
      .sort((a, b) => b.rate - a.rate)[0];

    if (concentratedCategory && concentratedCategory.rate >= 40) {
      alerts.push({
        id: `alert-category-${concentratedCategory.category}`,
        type: "CATEGORY_CONCENTRATION",
        severity: "warning",
        title: `${concentratedCategory.category} 소비 비중이 높아요`,
        message: `전체 소비의 ${formatPercent(concentratedCategory.rate)}가 ${concentratedCategory.category}에 집중돼 있어요.`,
        value: Math.round(concentratedCategory.rate),
        createdAt: todayKey
      });
    }
  }

  const todayTime = getDateTime(todayKey);
  const recent7 = transactions.filter((transaction) => {
    const time = getDateTime(transaction.date);
    return time <= todayTime && time > todayTime - 7 * DAY_MS;
  });
  const previous7 = transactions.filter((transaction) => {
    const time = getDateTime(transaction.date);
    return time <= todayTime - 7 * DAY_MS && time > todayTime - 14 * DAY_MS;
  });
  const recent7Spent = sumExpenses(recent7);
  const previous7Spent = sumExpenses(previous7);

  if (previous7Spent > 0 && recent7Spent >= previous7Spent * 1.3) {
    const increaseRate = ((recent7Spent - previous7Spent) / previous7Spent) * 100;
    alerts.push({
      id: "alert-weekly-spike",
      type: "WEEKLY_SPIKE",
      severity: "warning",
      title: "최근 소비가 빠르게 늘었어요",
      message: `최근 7일 소비가 이전 7일보다 ${formatPercent(increaseRate)} 증가했어요.`,
      value: Math.round(increaseRate),
      createdAt: todayKey
    });
  }

  if (monthlyTransactions.length > 0) {
    const dailyTotals = monthlyTransactions.reduce<Record<string, number>>((totals, transaction) => {
      totals[transaction.date] = (totals[transaction.date] ?? 0) + transaction.amount;
      return totals;
    }, {});
    const elapsedDays = Math.max(1, today.getDate());
    const dailyAverage = currentSpent / elapsedDays;
    const spikeDay = Object.entries(dailyTotals)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => b.amount - a.amount)[0];

    if (spikeDay && dailyAverage > 0 && spikeDay.amount >= dailyAverage * 2) {
      alerts.push({
        id: `alert-daily-spike-${spikeDay.date}`,
        type: "DAILY_SPIKE",
        severity: "info",
        title: "하루 소비가 평소보다 컸어요",
        message: `${spikeDay.date} 소비가 일평균의 ${formatPercent((spikeDay.amount / dailyAverage) * 100)} 수준이에요.`,
        value: Math.round((spikeDay.amount / dailyAverage) * 100),
        createdAt: todayKey
      });
    }
  }

  return alerts;
}
