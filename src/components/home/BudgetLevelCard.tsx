import { useRef, useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { WaveProgress } from "../ui/WaveProgress";
import { formatPercent, formatWon } from "../../utils/format";

type BudgetLevelCardProps = {
  spent: number;
  monthlyBudget: number;
  usage: number;
};

type Ripple = {
  id: number;
  x: number;
  y: number;
};

function statusText(usage: number): string {
  if (usage >= 100) return "예산 수위를 넘었어요";
  if (usage >= 80) return "위험 수위에 가까워졌어요";
  if (usage >= 60) return "소비 수위가 조금씩 차오르고 있어요";
  return "잔잔한 소비 흐름을 유지하고 있어요";
}

export function BudgetLevelCard({ spent, monthlyBudget, usage }: BudgetLevelCardProps) {
  const originRef = useRef({ x: 0, y: 0 });
  const [isTouching, setIsTouching] = useState(false);
  const [drift, setDrift] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const addRipple = (clientX: number, clientY: number, target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return;
    const card = target.closest(".budget-card");
    if (!(card instanceof HTMLElement)) return;
    const rect = card.getBoundingClientRect();
    const ripple = { id: Date.now(), x: clientX - rect.left, y: clientY - rect.top };
    setRipples((items) => [...items.slice(-2), ripple]);
    window.setTimeout(() => {
      setRipples((items) => items.filter((item) => item.id !== ripple.id));
    }, 780);
  };

  const settleWater = () => {
    setIsTouching(false);
    setDrift({ x: 0, y: 0 });
  };

  return (
    <GlassCard
      className={`budget-card ${isTouching ? "budget-card-touching" : ""} ${usage >= 100 ? "danger-ring" : usage >= 80 ? "warning-ring" : ""}`}
      onPointerDown={(event) => {
        originRef.current = { x: event.clientX, y: event.clientY };
        setIsTouching(true);
        addRipple(event.clientX, event.clientY, event.currentTarget);
      }}
      onPointerMove={(event) => {
        if (!isTouching || event.pointerType === "mouse") return;
        const dx = event.clientX - originRef.current.x;
        const dy = event.clientY - originRef.current.y;
        setDrift({
          x: Math.max(-12, Math.min(12, dx * 0.08)),
          y: Math.max(-7, Math.min(7, dy * 0.05))
        });
      }}
      onPointerUp={settleWater}
      onPointerCancel={settleWater}
      onPointerLeave={settleWater}
    >
      <WaveProgress percentage={usage} driftX={drift.x} driftY={drift.y} active={isTouching} />
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="budget-ripple"
          style={{ left: ripple.x, top: ripple.y }}
          aria-hidden="true"
        />
      ))}
      <div className="budget-content">
        <p className="section-kicker">이번 달 소비 수위</p>
        <div className="budget-percent">{formatPercent(usage)}</div>
        <p className="budget-main-amount">{formatWon(spent)} 사용</p>
        <p className="budget-sub-amount">전체 예산 {formatWon(monthlyBudget)} 중</p>
        <p className="budget-status">{statusText(usage)}</p>
      </div>
    </GlassCard>
  );
}
