import { Trash2 } from "lucide-react";
import type { Expense } from "../../types/expense";
import { shortKoreanDate } from "../../utils/date";
import { formatPercent, formatWon } from "../../utils/format";
import { Badge } from "../ui/Badge";
import { GlassCard } from "../ui/GlassCard";

type ExpenseCardProps = {
  expense: Expense;
  onDelete: (id: string) => void;
};

export function ExpenseCard({ expense, onDelete }: ExpenseCardProps) {
  return (
    <GlassCard className="expense-card">
      <div>
        <div className="expense-topline">
          <strong>{expense.merchant}</strong>
          <span>{shortKoreanDate(expense.date)}</span>
        </div>
        <div className="expense-meta">
          <Badge tone="neutral" className={`category-badge category-${expense.category}`}>{expense.category}</Badge>
          <span>신뢰도 {formatPercent(expense.confidence * 100)}</span>
        </div>
      </div>
      <div className="expense-side">
        <strong>{formatWon(expense.amount)}</strong>
        <button aria-label={`${expense.merchant} 삭제`} onClick={() => onDelete(expense.id)}>
          <Trash2 size={17} />
        </button>
      </div>
    </GlassCard>
  );
}
