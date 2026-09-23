import type { Budget, Expense } from "../../types/expense";
import { getBudgetUsage, getMonthlySpent, getRecentExpenses, getRemainingBudget } from "../../utils/analytics";
import { shortKoreanDate } from "../../utils/date";
import { formatPercent, formatWon } from "../../utils/format";
import { GlassCard } from "../ui/GlassCard";

type HomeReportSectionProps = {
  expenses: Expense[];
  budget: Budget;
};

export function HomeReportSection({ expenses, budget }: HomeReportSectionProps) {
  const monthlySpent = getMonthlySpent(expenses);
  const remainingBudget = getRemainingBudget(expenses, budget.monthlyBudget);
  const recent = getRecentExpenses(expenses, 5);
  const usage = getBudgetUsage(monthlySpent, budget.monthlyBudget);

  return (
    <GlassCard className="home-report-card">
      <div className="card-heading">
        <h2>이번 달 한눈에</h2>
        <span>{formatPercent(usage)}</span>
      </div>
      <div className="report-metric-grid">
        <div>
          <span>이번 달 총 소비액</span>
          <strong>{formatWon(monthlySpent)}</strong>
        </div>
        <div>
          <span>남은 예산</span>
          <strong>{formatWon(Math.max(0, remainingBudget))}</strong>
        </div>
      </div>
      <div className="home-report-section">
        <div className="report-section-title">
          <strong>최근 소비 5개</strong>
        </div>
        <div className="home-recent-list">
          {recent.length > 0 ? recent.map((expense) => (
            <div key={expense.id}>
              <span>{expense.memo || expense.merchant}</span>
              <small>{shortKoreanDate(expense.date)} · {expense.category} · {expense.paymentMethod}</small>
              <strong>{formatWon(expense.amount)}</strong>
            </div>
          )) : <p className="empty-state compact">입력 탭에서 첫 소비 흐름을 추가해보세요.</p>}
        </div>
      </div>
    </GlassCard>
  );
}

