import type { DailyReportPayload } from "./createDailyReportPayload";

export type N8nDailyReportRiskLevel = "safe" | "info" | "warning" | "danger";

export type N8nDailyReportPayload = {
  eventType: "DAILY_SPENDING_REPORT";
  source: "SpendFlow";
  userId: string;
  reportDate: string;
  hasRisk: boolean;
  riskLevel: N8nDailyReportRiskLevel;
  channelMessage: {
    title: string;
    body: string;
    plainText: string;
    summaryLine: string;
  };
  spending: DailyReportPayload["spending"];
  alerts: Array<{
    type: string;
    severity: string;
    title: string;
    message: string;
  }>;
  insight: DailyReportPayload["insight"];
  notionLog: {
    title: string;
    riskLevel: N8nDailyReportRiskLevel;
    alertCount: number;
    mainAlert: string;
    insightSummary: string;
  };
  createdAt: string;
};

function getRiskLevel(payload: DailyReportPayload): N8nDailyReportRiskLevel {
  if (!payload.hasRisk) return "safe";
  if (payload.alerts.some((alert) => alert.severity === "danger")) return "danger";
  if (payload.alerts.some((alert) => alert.severity === "warning")) return "warning";
  return "info";
}

function createSummaryLine(payload: DailyReportPayload, riskLevel: N8nDailyReportRiskLevel): string {
  if (riskLevel === "safe") return "오늘 소비 흐름은 안정적이에요.";
  if (riskLevel === "danger") return `이번 달 소비율 ${payload.spending.usageRate}%, 위험 신호가 있어요.`;
  return `이번 달 소비율 ${payload.spending.usageRate}%, 주의가 필요해요.`;
}

function createPlainText(payload: DailyReportPayload): string {
  return [
    `[${payload.notificationMessage.title}]`,
    "",
    payload.notificationMessage.body
      .replace(/- /g, "* ")
      .replace("감지된 소비 위험:", "감지된 소비 위험:\n")
  ].join("\n");
}

export function createN8nDailyReportPayload(dailyReportPayload: DailyReportPayload): N8nDailyReportPayload {
  const riskLevel = getRiskLevel(dailyReportPayload);
  const mainAlert = dailyReportPayload.alerts[0]?.message ?? "위험 신호 없음";

  return {
    eventType: "DAILY_SPENDING_REPORT",
    source: "SpendFlow",
    userId: dailyReportPayload.userId,
    reportDate: dailyReportPayload.reportDate,
    hasRisk: dailyReportPayload.hasRisk,
    riskLevel,
    channelMessage: {
      title: dailyReportPayload.notificationMessage.title,
      body: dailyReportPayload.notificationMessage.body,
      plainText: createPlainText(dailyReportPayload),
      summaryLine: createSummaryLine(dailyReportPayload, riskLevel)
    },
    spending: dailyReportPayload.spending,
    alerts: dailyReportPayload.alerts.map((alert) => ({
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      message: alert.message
    })),
    insight: dailyReportPayload.insight,
    notionLog: {
      title: `${dailyReportPayload.reportDate} 데일리 소비 브리핑`,
      riskLevel,
      alertCount: dailyReportPayload.alerts.length,
      mainAlert,
      insightSummary: dailyReportPayload.insight.summary
    },
    createdAt: dailyReportPayload.createdAt
  };
}
