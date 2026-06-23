import type { ExpenseCategory } from "../../types/expense";
import { formatWon } from "../../utils/format";
import { GlassCard } from "../ui/GlassCard";

export function TopCategoryCard({ rows }: { rows: { category: ExpenseCategory; amount: number; percent: number }[] }) {
  return (
    <GlassCard className="report-card">
      <div className="card-heading">
        <h2>Top 3 카테고리</h2>
        <span>비율</span>
      </div>
      <div className="top-list">
        {rows.map((row) => (
          <div key={row.category}>
            <span>{row.category}</span>
            <div className="top-bar"><i style={{ width: `${Math.max(12, row.percent)}%` }} /></div>
            <strong>{formatWon(row.amount)}</strong>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
