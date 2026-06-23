import type { CSSProperties } from "react";
import { clamp } from "../../utils/format";

type WaveProgressProps = {
  percentage: number;
  driftX?: number;
  driftY?: number;
  active?: boolean;
};

export function WaveProgress({ percentage, driftX = 0, driftY = 0, active = false }: WaveProgressProps) {
  const level = clamp(percentage, 0, 110);
  const fill = clamp(level, 0, 100);
  const state = percentage >= 100 ? "danger" : percentage >= 80 ? "warning" : "calm";

  return (
    <div
      className={`wave-progress wave-${state} ${active ? "wave-active" : ""}`}
      aria-label={`예산 사용률 ${Math.round(percentage)}%`}
      style={{
        "--fill-offset": `${100 - fill}%`,
        "--wave-x": `${driftX}px`,
        "--wave-y": `${driftY}px`
      } as CSSProperties}
    >
      <div className="wave-fill">
        <div className="wave-surface" />
        <div className="wave-line wave-line-one" />
        <div className="wave-line wave-line-two" />
      </div>
      <div className="wave-sheen" />
    </div>
  );
}
