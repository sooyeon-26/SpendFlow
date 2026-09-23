import { GlassCard } from "../ui/GlassCard";
import { formatWon } from "../../utils/format";

type SpendingFlowChartProps = {
  data: { date: string; label: string; shortDate: string; amount: number }[];
};

export function SpendingFlowChart({ data }: SpendingFlowChartProps) {
  const width = 312;
  const height = 126;
  const max = Math.max(...data.map((item) => item.amount), 1);
  const points = data.map((item, index) => {
    const x = 18 + index * ((width - 36) / Math.max(1, data.length - 1));
    const y = 18 + (1 - item.amount / max) * 70;
    return { ...item, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${path} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`;

  return (
    <GlassCard className="chart-card">
      <div className="card-heading">
        <h2>최근 7일 소비 흐름</h2>
        <span>일별 소비</span>
      </div>
      <div className="chart-wrap">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="최근 7일 소비 흐름 차트">
          <defs>
            <linearGradient id="flowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#20b8f2" stopOpacity="0.46" />
              <stop offset="100%" stopColor="#78e4d3" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <path className="flow-area" d={areaPath} />
          <path className="flow-line" d={path} />
          {points.map((point) => (
            <g key={point.date}>
              <circle className="flow-dot" cx={point.x} cy={point.y} r="4" />
              <text className="flow-label" x={point.x} y="121" textAnchor="middle">{point.label}</text>
              <title>{`${point.shortDate} ${formatWon(point.amount)}`}</title>
            </g>
          ))}
        </svg>
      </div>
    </GlassCard>
  );
}
