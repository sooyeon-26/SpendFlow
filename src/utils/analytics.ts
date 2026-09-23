import type { Budget, Expense, ExpenseCategory } from "../types/expense";
import { daysAgo, isSameMonth, isWithinDays, shortKoreanDate, toDateKey, weekdayLabel } from "./date";
import { EXPENSE_CATEGORIES } from "../constants/expenses";

const categories = EXPENSE_CATEGORIES;

export function getTotalSpent(expenses: Expense[]): number {
  return expenses.filter((expense) => isSameMonth(expense.date)).reduce((sum, expense) => sum + expense.amount, 0);
}

export function getMonthlySpent(expenses: Expense[]): number {
  return getTotalSpent(expenses);
}

export function getRemainingBudget(expenses: Expense[], monthlyBudget: number): number {
  return monthlyBudget - getMonthlySpent(expenses);
}

export function getTodaySpent(expenses: Expense[]): number {
  const today = toDateKey(new Date());
  return expenses.filter((expense) => expense.date === today).reduce((sum, expense) => sum + expense.amount, 0);
}

export function getWeeklySpent(expenses: Expense[]): number {
  return expenses.filter((expense) => isWithinDays(expense.date, 7)).reduce((sum, expense) => sum + expense.amount, 0);
}

export function getPreviousWeeklySpent(expenses: Expense[]): number {
  return expenses
    .filter((expense) => isWithinDays(expense.date, 14) && !isWithinDays(expense.date, 7))
    .reduce((sum, expense) => sum + expense.amount, 0);
}

export function getCategoryTotals(expenses: Expense[]): Record<ExpenseCategory, number> {
  const monthlyExpenses = expenses.filter((expense) => isSameMonth(expense.date));
  return categories.reduce<Record<ExpenseCategory, number>>((totals, category) => {
    totals[category] = monthlyExpenses.filter((expense) => expense.category === category).reduce((sum, expense) => sum + expense.amount, 0);
    return totals;
  }, {} as Record<ExpenseCategory, number>);
}

export function getWeeklyTopCategories(expenses: Expense[]) {
  const recent = expenses.filter((expense) => isWithinDays(expense.date, 7));
  const total = recent.reduce((sum, expense) => sum + expense.amount, 0);
  return categories.map((category) => {
    const amount = recent.filter((expense) => expense.category === category).reduce((sum, expense) => sum + expense.amount, 0);
    return { category, amount, percent: total ? amount / total * 100 : 0 };
  }).filter((row) => row.amount > 0).sort((a, b) => b.amount - a.amount).slice(0, 3);
}

export function getBudgetUsage(totalSpent: number, monthlyBudget: number): number {
  return monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
}

export function getBudgetStatusMessage(percentage: number): string {
  if (percentage >= 100) return "예산을 초과했어요";
  if (percentage >= 91) return "예산 초과 직전이에요";
  if (percentage >= 71) return "예산에 가까워지고 있어요";
  if (percentage >= 41) return "소비 수위가 조금씩 차오르고 있어요";
  return "아직 여유 있어요";
}

export function getTopCategory(expenses: Expense[]): { category: ExpenseCategory; amount: number } {
  const totals = getCategoryTotals(expenses);
  return categories
    .map((category) => ({ category, amount: totals[category] }))
    .sort((a, b) => b.amount - a.amount)[0];
}

export function getRecentExpenses(expenses: Expense[], limit = 5): Expense[] {
  return [...expenses]
    .sort((a, b) => {
      const dateDiff = new Date(`${b.date}T00:00:00`).getTime() - new Date(`${a.date}T00:00:00`).getTime();
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, limit);
}

export function getCategorySummary(expenses: Expense[]) {
  const totals = getCategoryTotals(expenses);
  return categories
    .map((category) => ({ category, amount: totals[category] }))
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

export function getDaySpent(expenses: Expense[], dateKey: string): number {
  return expenses.filter((expense) => expense.date === dateKey).reduce((sum, expense) => sum + expense.amount, 0);
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
