import type { Budget, Expense } from "../../types/expense";
import { getBudgetUsage, getCategorySummary, getMonthlySpent, getRecentExpenses, getRemainingBudget, getTopCategory } from "../../utils/analytics";
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
  const categoryRows = getCategorySummary(expenses);
  const topCategory = getTopCategory(expenses);
  const recent = getRecentExpenses(expenses, 5);
  const usage = getBudgetUsage(monthlySpent, budget.monthlyBudget);
  const maxCategoryAmount = Math.max(1, ...categoryRows.map((row) => row.amount));

  return (
    <GlassCard className="home-report-card">
      <div className="card-heading">
        <h2>소비 흐름 리포트</h2>
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
          <strong>카테고리별 소비</strong>
          <span>최다 {topCategory.amount > 0 ? topCategory.category : "아직 없음"}</span>
        </div>
        <div className="home-category-bars">
          {categoryRows.length > 0 ? categoryRows.map((row) => (
            <div key={row.category} className="home-category-row">
              <span>{row.category}</span>
              <i><b style={{ width: `${Math.max(8, (row.amount / maxCategoryAmount) * 100)}%` }} /></i>
              <strong>{formatWon(row.amount)}</strong>
            </div>
          )) : <p className="empty-state compact">아직 저장된 소비가 없어요.</p>}
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

