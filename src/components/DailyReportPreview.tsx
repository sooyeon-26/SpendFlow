import type { DailyReportPayload } from "../utils/createDailyReportPayload";
import { formatPercent, formatWon } from "../utils/format";
import { Badge } from "./ui/Badge";
import { GlassCard } from "./ui/GlassCard";

export function DailyReportPreview({ payload }: { payload: DailyReportPayload }) {
  return (
    <GlassCard className="preview-card">
      <div className="card-heading">
        <h2>데일리 소비 브리핑 payload</h2>
        <Badge tone={payload.hasRisk ? "warning" : "aqua"}>{payload.hasRisk ? "risk" : "stable"}</Badge>
      </div>
      <div className="preview-list">
        <div>
          <span>reportDate</span>
          <strong>{payload.reportDate}</strong>
        </div>
        <div>
          <span>todaySpent</span>
          <strong>{formatWon(payload.spending.todaySpent)}</strong>
        </div>
        <div>
          <span>usageRate</span>
          <strong>{formatPercent(payload.spending.usageRate)}</strong>
        </div>
        <div>
          <span>hasRisk</span>
          <strong>{payload.hasRisk ? "true" : "false"}</strong>
        </div>
      </div>
      <div className="home-report-section">
        <div className="report-section-title">
          <strong>{payload.notificationMessage.title}</strong>
        </div>
        <p className="calm-copy" style={{ whiteSpace: "pre-wrap" }}>{payload.notificationMessage.body}</p>
      </div>
      <details className="home-report-section">
        <summary className="calm-copy">JSON payload 펼치기</summary>
        <pre style={{ maxHeight: 180, overflow: "auto", margin: "10px 0 0", fontSize: 11, lineHeight: 1.45, whiteSpace: "pre-wrap" }}>
          {JSON.stringify(payload, null, 2)}
        </pre>
      </details>
    </GlassCard>
  );
}
