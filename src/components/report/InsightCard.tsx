import { Bot, Repeat2 } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

export function InsightCard({ insights, repeats }: { insights: string[]; repeats: { label: string; count: number }[] }) {
  return (
    <GlassCard className="report-card">
      <div className="card-heading">
        <h2>소비 패턴 코멘트</h2>
        <Bot size={18} />
      </div>
      <div className="ai-copy">
        {insights.map((insight) => (
          <p key={insight}>{insight}</p>
        ))}
      </div>
      {repeats.length ? (
        <div className="repeat-box">
          <Repeat2 size={17} />
          <span>{repeats[0].label} 소비가 반복 파동으로 감지됐어요.</span>
        </div>
      ) : null}
    </GlassCard>
  );
}
