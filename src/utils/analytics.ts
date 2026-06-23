import type { Budget, Expense, ExpenseCategory } from "../types/expense";
import { daysAgo, isSameMonth, isWithinDays, shortKoreanDate, toDateKey, weekdayLabel } from "./date";

const categories: ExpenseCategory[] = ["식비", "카페", "교통", "쇼핑", "구독", "생활", "기타"];

export function getTotalSpent(expenses: Expense[]): number {
  return expenses.filter((expense) => isSameMonth(expense.date)).reduce((sum, expense) => sum + expense.amount, 0);
}

export function getTodaySpent(expenses: Expense[]): number {
  const today = toDateKey(new Date());
  return expenses.filter((expense) => expense.date === today).reduce((sum, expense) => sum + expense.amount, 0);
}

export function getWeeklySpent(expenses: Expense[]): number {
  return expenses.filter((expense) => isWithinDays(expense.date, 7)).reduce((sum, expense) => sum + expense.amount, 0);
}

export function getPreviousWeeklySpent(expenses: Expense[]): number {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  return expenses
    .filter((expense) => {
      const time = new Date(`${expense.date}T00:00:00`).getTime();
      return time < now - 6 * day && time >= now - 13 * day;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);
}

export function getCategoryTotals(expenses: Expense[]): Record<ExpenseCategory, number> {
  return categories.reduce<Record<ExpenseCategory, number>>((totals, category) => {
    totals[category] = expenses.filter((expense) => expense.category === category).reduce((sum, expense) => sum + expense.amount, 0);
    return totals;
  }, {} as Record<ExpenseCategory, number>);
}

export function getBudgetUsage(totalSpent: number, monthlyBudget: number): number {
  return monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
}

export function getTopCategory(expenses: Expense[]): { category: ExpenseCategory; amount: number } {
  const totals = getCategoryTotals(expenses);
  return categories
    .map((category) => ({ category, amount: totals[category] }))
    .sort((a, b) => b.amount - a.amount)[0];
}

export function getRecent7DaysData(expenses: Expense[]) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = daysAgo(6 - index);
    const amount = expenses.filter((expense) => expense.date === date).reduce((sum, expense) => sum + expense.amount, 0);
    return {
      date,
      label: weekdayLabel(date),
      shortDate: shortKoreanDate(date),
      amount
    };
  });
}

export function getRiskCategories(expenses: Expense[], budget: Budget) {
  const totals = getCategoryTotals(expenses.filter((expense) => isSameMonth(expense.date)));
  return categories
    .map((category) => {
      const spent = totals[category];
      const limit = budget.categoryBudgets[category];
      return { category, spent, limit, usage: limit > 0 ? (spent / limit) * 100 : 0 };
    })
    .filter((row) => row.usage >= 80)
    .sort((a, b) => b.usage - a.usage);
}

export function detectRepeatedSpending(expenses: Expense[]) {
  const recent7 = expenses.filter((expense) => isWithinDays(expense.date, 7));
  const recent30 = expenses.filter((expense) => isWithinDays(expense.date, 30));
  const categoryCounts = categories
    .map((category) => ({ type: "category" as const, label: category, count: recent7.filter((expense) => expense.category === category).length }))
    .filter((item) => item.count >= 3);
  const merchants = Array.from(new Set(recent30.map((expense) => expense.merchant)));
  const merchantCounts = merchants
    .map((merchant) => ({ type: "merchant" as const, label: merchant, count: recent30.filter((expense) => expense.merchant === merchant).length }))
    .filter((item) => item.count >= 2);
  return [...categoryCounts, ...merchantCounts];
}

export function generateWeeklyInsights(expenses: Expense[], budget: Budget): string[] {
  const risks = getRiskCategories(expenses, budget);
  const repeats = detectRepeatedSpending(expenses);
  const weekly = getWeeklySpent(expenses);
  const previous = getPreviousWeeklySpent(expenses);
  const insights: string[] = [];

  if (previous > 0 && weekly > previous * 1.1) insights.push("이번 주 소비 흐름은 지난주보다 조금 가팔라졌어요.");
  if (repeats.some((repeat) => repeat.type === "category")) insights.push(`${repeats[0].label} 지출 파동이 ${repeats[0].count}회 감지됐어요.`);
  if (risks[0]) insights.push(`${risks[0].category} 수위가 예산의 ${Math.round(risks[0].usage)}%까지 차올랐어요.`);
  if (insights.length === 0) insights.push("이번 주는 전체적으로 잔잔한 소비 흐름을 유지했어요.");

  return insights.slice(0, 4);
}
