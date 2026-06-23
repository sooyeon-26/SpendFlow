import { useExpenseStore } from "../../store/expenseStore";
import { generateWeeklyInsights, getBudgetUsage, getRecent7DaysData, getTodaySpent, getTopCategory, getTotalSpent, getWeeklySpent } from "../../utils/analytics";
import { BudgetLevelCard } from "./BudgetLevelCard";
import { MiniInsightCard } from "./MiniInsightCard";
import { SpendingFlowChart } from "./SpendingFlowChart";
import { TodaySummaryCard } from "./TodaySummaryCard";

export function HomeScreen() {
  const expenses = useExpenseStore((state) => state.expenses);
  const budget = useExpenseStore((state) => state.budget);
  const total = getTotalSpent(expenses);
  const usage = getBudgetUsage(total, budget.monthlyBudget);
  const weekly = getWeeklySpent(expenses);
  const top = getTopCategory(expenses);
  const insights = generateWeeklyInsights(expenses, budget);

  return (
    <div className="home-screen">
      <section className="home-hero" aria-label="이번 달 소비 수위 중심 화면">
        <BudgetLevelCard spent={total} monthlyBudget={budget.monthlyBudget} usage={usage} />
      </section>
      <div className="home-details">
        <TodaySummaryCard today={getTodaySpent(expenses)} weekly={weekly} topCategory={top.category} />
        <SpendingFlowChart data={getRecent7DaysData(expenses)} />
        <MiniInsightCard insight={insights[0]} />
      </div>
    </div>
  );
}
