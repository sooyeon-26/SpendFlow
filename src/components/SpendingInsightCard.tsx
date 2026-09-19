import type { SpendingInsight } from "../utils/generateSpendingInsight";
import { Badge } from "./ui/Badge";
import { GlassCard } from "./ui/GlassCard";

const toneLabel: Record<SpendingInsight["tone"], string> = {
  positive: "안정",
  info: "안내",
  warning: "주의",
  danger: "위험"
};

const badgeTone: Record<SpendingInsight["tone"], "aqua" | "warning" | "danger" | "neutral"> = {
  positive: "aqua",
  info: "neutral",
  warning: "warning",
  danger: "danger"
};

export function SpendingInsightCard({ insight }: { insight: SpendingInsight }) {
  return (
    <GlassCard className="report-card">
      <div className="card-heading">
        <h2>소비 흐름 요약</h2>
        <Badge tone={badgeTone[insight.tone]}>{toneLabel[insight.tone]}</Badge>
      </div>
      <div className="ai-copy">
        <p>{insight.summary}</p>
        <p>{insight.mainIssue}</p>
        <p>{insight.suggestion}</p>
      </div>
    </GlassCard>
  );
}
