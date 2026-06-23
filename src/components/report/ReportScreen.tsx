import { useExpenseStore } from "../../store/expenseStore";
import { detectRepeatedSpending, generateWeeklyInsights, getCategoryTotals, getPreviousWeeklySpent, getRiskCategories, getTotalSpent, getWeeklySpent } from "../../utils/analytics";
import type { ExpenseCategory } from "../../types/expense";
import { InsightCard } from "./InsightCard";
import { RiskCategoryCard } from "./RiskCategoryCard";
import { TopCategoryCard } from "./TopCategoryCard";
import { WeeklySummaryCard } from "./WeeklySummaryCard";
import { NextActionCard } from "./NextActionCard";
import { PwaInstallCard } from "./PwaInstallCard";

const categories: ExpenseCategory[] = ["식비", "카페", "교통", "쇼핑", "구독", "생활", "기타"];

export function ReportScreen() {
  const expenses = useExpenseStore((state) => state.expenses);
  const budget = useExpenseStore((state) => state.budget);
  const weekly = getWeeklySpent(expenses);
  const monthly = getTotalSpent(expenses);
  const totals = getCategoryTotals(expenses);
  const topRows = categories
    .map((category) => ({ category, amount: totals[category], percent: monthly ? (totals[category] / monthly) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  return (
    <div className="screen-stack">
      <WeeklySummaryCard weekly={weekly} previous={getPreviousWeeklySpent(expenses)} />
      <TopCategoryCard rows={topRows} />
      <RiskCategoryCard risks={getRiskCategories(expenses, budget)} />
      <InsightCard insights={generateWeeklyInsights(expenses, budget)} repeats={detectRepeatedSpending(expenses)} />
      <NextActionCard expenses={expenses} budget={budget} />
      <PwaInstallCard />
    </div>
  );
}
