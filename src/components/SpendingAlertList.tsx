import type { SpendingAlert } from "../utils/detectSpendingAlerts";
import { Badge } from "./ui/Badge";
import { GlassCard } from "./ui/GlassCard";

const severityLabel: Record<SpendingAlert["severity"], string> = {
  info: "안내",
  warning: "주의",
  danger: "위험"
};

const badgeTone: Record<SpendingAlert["severity"], "aqua" | "warning" | "danger" | "neutral"> = {
  info: "neutral",
  warning: "warning",
  danger: "danger"
};

export function SpendingAlertList({ alerts }: { alerts: SpendingAlert[] }) {
  return (
    <GlassCard className="report-card">
      <div className="card-heading">
        <h2>소비 위험 알림</h2>
        <span>{alerts.length}개</span>
      </div>
      {alerts.length > 0 ? (
        <div className="risk-list">
          {alerts.map((alert) => (
            <div key={alert.id}>
              <Badge tone={badgeTone[alert.severity]}>{severityLabel[alert.severity]}</Badge>
              <strong>{alert.title}</strong>
              <p>{alert.message}</p>
              <span className="risk-budget-line">{alert.createdAt}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state compact">아직 위험 신호는 없어요</p>
      )}
    </GlassCard>
  );
}
