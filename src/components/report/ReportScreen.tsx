import { useExpenseStore } from "../../store/expenseStore";
import { detectRepeatedSpending, generateWeeklyInsights, getPreviousWeeklySpent, getRiskCategories, getWeeklySpent, getWeeklyTopCategories, getRecent7DaysData } from "../../utils/analytics";
import { SpendingFlowChart } from "../home/SpendingFlowChart";
import { InsightCard } from "./InsightCard";
import { RiskCategoryCard } from "./RiskCategoryCard";
import { TopCategoryCard } from "./TopCategoryCard";
import { WeeklySummaryCard } from "./WeeklySummaryCard";
import { NextActionCard } from "./NextActionCard";
import { PwaInstallCard } from "./PwaInstallCard";

export function ReportScreen() {
  const expenses = useExpenseStore((state) => state.expenses);
  const budget = useExpenseStore((state) => state.budget);
  const weekly = getWeeklySpent(expenses);
  const topRows = getWeeklyTopCategories(expenses);

  return (
    <div className="screen-stack">
      <WeeklySummaryCard weekly={weekly} previous={getPreviousWeeklySpent(expenses)} />
      <SpendingFlowChart data={getRecent7DaysData(expenses)} />
      <TopCategoryCard rows={topRows} />
      <RiskCategoryCard risks={getRiskCategories(expenses, budget)} />
      <InsightCard insights={generateWeeklyInsights(expenses, budget)} repeats={detectRepeatedSpending(expenses)} />
      <NextActionCard expenses={expenses} budget={budget} />
      <PwaInstallCard />
    </div>
  );
}
