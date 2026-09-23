import { useEffect, useRef, useState } from "react";
import { WaveProgress, type WaveProgressHandle } from "../ui/WaveProgress";
import { formatPercent, formatWon } from "../../utils/format";
import { getBudgetStatusMessage } from "../../utils/analytics";

type BudgetLevelCardProps = {
  spent: number;
  monthlyBudget: number;
  usage: number;
};

export function BudgetLevelCard({ spent, monthlyBudget, usage }: BudgetLevelCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const waveRef = useRef<WaveProgressHandle | null>(null);
  const lastMoveRef = useRef({ x: 0, y: 0, time: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const [isTouching, setIsTouching] = useState(false);
  const [showHint, setShowHint] = useState(() => window.sessionStorage.getItem("spendflow_wave_hint_seen") !== "true");
  const dismissHint = () => {
    setShowHint(false);
    window.sessionStorage.setItem("spendflow_wave_hint_seen", "true");
  };
  useEffect(() => {
    if (!showHint) return;
    const timer = window.setTimeout(dismissHint, 10000);
    return () => window.clearTimeout(timer);
  }, [showHint]);

  const getImpulsePoint = (clientX: number, clientY: number) => {
    const card = cardRef.current;
    if (!card) return { x: 0.5, y: 0.5 };
    const rect = card.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
    };
  };

  const settleWater = () => {
    setIsTouching(false);
    const point = getImpulsePoint(lastMoveRef.current.x, lastMoveRef.current.y);
    waveRef.current?.release({ ...point, vx: velocityRef.current.x, vy: velocityRef.current.y, force: 0.9 });
  };

  return (
    <section
      ref={cardRef}
      className={`budget-card ${isTouching ? "budget-card-touching" : ""} ${usage >= 100 ? "danger-ring" : usage >= 80 ? "warning-ring" : ""}`}
      onPointerDown={(event) => {
        dismissHint();
        event.preventDefault();
        lastMoveRef.current = { x: event.clientX, y: event.clientY, time: performance.now() };
        velocityRef.current = { x: 0, y: 0 };
        setIsTouching(true);
        event.currentTarget.setPointerCapture?.(event.pointerId);
        waveRef.current?.disturb({ ...getImpulsePoint(event.clientX, event.clientY), force: 1.35, mode: "press" });
      }}
      onPointerMove={(event) => {
        if (!isTouching) return;
        event.preventDefault();
        const now = performance.now();
        const elapsed = Math.max(16, now - lastMoveRef.current.time);
        const vx = (event.clientX - lastMoveRef.current.x) / elapsed;
        const vy = (event.clientY - lastMoveRef.current.y) / elapsed;
        const speed = Math.hypot(vx, vy);
        velocityRef.current = { x: vx, y: vy };
        lastMoveRef.current = { x: event.clientX, y: event.clientY, time: now };
        waveRef.current?.disturb({ ...getImpulsePoint(event.clientX, event.clientY), vx, vy, force: Math.min(1.8, 0.65 + speed * 1.9), mode: "drag" });
      }}
      onPointerUp={settleWater}
      onPointerCancel={settleWater}
      onPointerLeave={settleWater}
    >
      <WaveProgress ref={waveRef} percentage={usage} />
      {showHint && <p className="wave-hint">물결을 터치하거나 드래그해 보세요</p>}
      <div className="budget-content">
        <div className="budget-text-stack">
          <p className="budget-eyebrow">오늘의 소비 흐름</p>
          <p className="section-kicker">이번 달 소비 수위</p>
          <div className="budget-percent">{formatPercent(usage)}</div>
          <p className="budget-main-amount">{formatWon(spent)} 사용</p>
          <p className="budget-sub-amount">전체 예산 {formatWon(monthlyBudget)} 중</p>
          <p className="budget-status">{getBudgetStatusMessage(usage)}</p>
        </div>
      </div>
    </section>
  );
}
