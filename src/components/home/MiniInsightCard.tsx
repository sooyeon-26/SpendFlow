import { Sparkles } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

export function MiniInsightCard({ insight }: { insight: string }) {
  return (
    <GlassCard className="insight-card">
      <Sparkles size={19} />
      <p>{insight}</p>
    </GlassCard>
  );
}
