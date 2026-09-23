import { AlertTriangle } from "lucide-react";
import type { ExpenseCategory } from "../../types/expense";
import { formatPercent, formatWon } from "../../utils/format";
import { Badge } from "../ui/Badge";
import { GlassCard } from "../ui/GlassCard";

type RiskRow = {
  category: ExpenseCategory;
  spent: number;
  limit: number;
  usage: number;
};

export function RiskCategoryCard({ risks }: { risks: RiskRow[] }) {
  return (
    <GlassCard className="report-card">
      <div className="card-heading">
        <h2>이번 달 예산 주의</h2>
        <AlertTriangle size={18} />
      </div>
      {risks.length ? (
        <div className="risk-list">
          {risks.map((risk) => (
            <div key={risk.category}>
              <Badge tone={risk.usage >= 100 ? "danger" : "warning"}>{risk.category}</Badge>
              <p>{risk.category} 카테고리가 위험 수위에 가까워졌어요.</p>
              <strong>{formatWon(risk.spent)}</strong>
              <span className="risk-budget-line">예산 {formatWon(risk.limit)} 대비 {formatPercent(risk.usage)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="calm-copy">예산 위험 수위에 닿은 카테고리가 없어요.</p>
      )}
    </GlassCard>
  );
}
