import { TrendingUp } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { formatWon } from "../../utils/format";

export function WeeklySummaryCard({ weekly, previous }: { weekly: number; previous: number }) {
  const change = previous > 0 ? ((weekly - previous) / previous) * 100 : 0;
  const signedChange = `${change >= 0 ? "+" : "-"}${Math.abs(Math.round(change))}%`;
  const flowCopy = change >= 10
    ? "소비 흐름이 조금 가팔라졌어요"
    : change <= -10
      ? "소비 흐름이 한결 잔잔해졌어요"
      : "지난주와 비슷한 흐름이에요";

  return (
    <GlassCard className="weekly-card">
      <div>
        <span>최근 7일 총 소비</span>
        <strong>{formatWon(weekly)}</strong>
        {previous > 0 ? (
          <>
            <p className="weekly-change">이전 7일 대비 {signedChange}</p>
            <p>{flowCopy}</p>
          </>
        ) : (
          <p>이번 주 흐름을 기록 중이에요</p>
        )}
      </div>
      <div className="weekly-icon">
        <TrendingUp size={26} />
      </div>
    </GlassCard>
  );
}
