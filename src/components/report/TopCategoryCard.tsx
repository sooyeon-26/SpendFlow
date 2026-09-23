import type { ExpenseCategory } from "../../types/expense";
import { formatWon } from "../../utils/format";
import { GlassCard } from "../ui/GlassCard";

export function TopCategoryCard({ rows }: { rows: { category: ExpenseCategory; amount: number; percent: number }[] }) {
  return (
    <GlassCard className="report-card">
      <div className="card-heading">
        <h2>최근 7일 소비 Top 3</h2>
        <span>소비 비중</span>
      </div>
      <div className="top-list">
        {rows.map((row) => (
          <div key={row.category}>
            <span>{row.category}</span>
            <div className="top-bar"><i style={{ width: `${row.percent}%` }} /></div>
            <strong>{formatWon(row.amount)}</strong>
          </div>
        ))}
        {!rows.length && <p className="empty-state compact">최근 7일에 기록한 소비가 없어요.</p>}
      </div>
    </GlassCard>
  );
}
