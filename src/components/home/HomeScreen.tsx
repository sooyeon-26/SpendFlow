import { useRef } from "react";
import { useExpenseStore } from "../../store/expenseStore";
import { generateWeeklyInsights, getBudgetUsage, getCategorySummary, getRecent7DaysData, getTodaySpent, getTopCategory, getTotalSpent, getWeeklySpent } from "../../utils/analytics";
import { detectSpendingAlerts } from "../../utils/detectSpendingAlerts";
import { generateSpendingInsight } from "../../utils/generateSpendingInsight";
import { AIInsightCard } from "../AIInsightCard";
import { SpendingAlertList } from "../SpendingAlertList";
import { BudgetLevelCard } from "./BudgetLevelCard";
import { MiniInsightCard } from "./MiniInsightCard";
import { SpendingFlowChart } from "./SpendingFlowChart";
import { TodaySummaryCard } from "./TodaySummaryCard";
import { HomeReportSection } from "./HomeReportSection";

export function HomeScreen() {
  const detailSectionRef = useRef<HTMLElement | null>(null);
  const expenses = useExpenseStore((state) => state.expenses);
  const budget = useExpenseStore((state) => state.budget);
  const total = getTotalSpent(expenses);
  const usage = getBudgetUsage(total, budget.monthlyBudget);
  const weekly = getWeeklySpent(expenses);
  const top = getTopCategory(expenses);
  const insights = generateWeeklyInsights(expenses, budget);
  const categorySummary = getCategorySummary(expenses);
  const spendingStatus = {
    monthlyBudget: budget.monthlyBudget,
    currentSpent: total,
    usageRate: usage
  };
  const alerts = detectSpendingAlerts(expenses, budget.monthlyBudget, total);
  const spendingInsight = generateSpendingInsight(spendingStatus, categorySummary, alerts, expenses);
  const scrollToDetails = () => {
    detailSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="home-screen">
      <section className="home-hero" aria-label="이번 달 소비 수위 중심 화면">
        <BudgetLevelCard spent={total} monthlyBudget={budget.monthlyBudget} usage={usage} />
      </section>
      <button type="button" className="home-scroll-handle" aria-label="자세한 소비 흐름 보기" onClick={scrollToDetails}>
        <span>자세한 소비 흐름 보기</span>
        <i />
      </button>
      <section ref={detailSectionRef} className="home-details" aria-label="상세 소비 흐름">
        <TodaySummaryCard today={getTodaySpent(expenses)} weekly={weekly} topCategory={top.category} />
        <HomeReportSection expenses={expenses} budget={budget} />
        <SpendingFlowChart data={getRecent7DaysData(expenses)} />
        <MiniInsightCard insight={insights[0]} />
        <AIInsightCard insight={spendingInsight} />
        <SpendingAlertList alerts={alerts} />
      </section>
    </div>
  );
}
