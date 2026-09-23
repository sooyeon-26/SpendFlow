import { useRef } from "react";
import { useExpenseStore } from "../../store/expenseStore";
import { getBudgetUsage, getTodaySpent, getTopCategory, getTotalSpent, getWeeklySpent } from "../../utils/analytics";
import { BudgetLevelCard } from "./BudgetLevelCard";
import { TodaySummaryCard } from "./TodaySummaryCard";
import { HomeReportSection } from "./HomeReportSection";

export function HomeScreen() {
  const detailSectionRef = useRef<HTMLElement | null>(null);
  const expenses = useExpenseStore((state) => state.expenses);
  const budget = useExpenseStore((state) => state.budget);
  const setActiveTab = useExpenseStore((state) => state.setActiveTab);
  const total = getTotalSpent(expenses);
  const usage = getBudgetUsage(total, budget.monthlyBudget);
  const weekly = getWeeklySpent(expenses);
  const top = getTopCategory(expenses);
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
        <TodaySummaryCard today={getTodaySpent(expenses)} weekly={weekly} topCategory={top.amount > 0 ? top.category : "아직 없음"} />
        <HomeReportSection expenses={expenses} budget={budget} />
        <button className="report-link" onClick={() => setActiveTab("report")}>소비 추세와 다음 행동 보기 →</button>
      </section>
    </div>
  );
}
