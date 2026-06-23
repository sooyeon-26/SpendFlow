import type { Expense } from "../types/expense";
import type { SpendingAlert } from "./detectSpendingAlerts";
import type { SpendingInsight, SpendingStatusForInsight } from "./generateSpendingInsight";
import { formatPercent, formatWon } from "./format";

export type DailyReportPayload = {
  userId: string;
  eventType: "DAILY_SPENDING_REPORT";
  reportDate: string;
  spending: {
    todaySpent: number;
    monthlyBudget: number;
    currentSpent: number;
    remainingBudget: number;
    usageRate: number;
  };
  alerts: SpendingAlert[];
  insight: SpendingInsight;
  notificationMessage: {
    title: string;
    body: string;
  };
  hasRisk: boolean;
  createdAt: string;
};

type CreateDailyReportPayloadInput = {
  userId: string;
  reportDate: string;
  spendingStatus: SpendingStatusForInsight;
  transactions: Expense[];
  alerts: SpendingAlert[];
  insight: SpendingInsight;
  monthlyBudget: number;
  currentSpent: number;
};

function getTodaySpent(transactions: Expense[], reportDate: string): number {
  return transactions
    .filter((transaction) => transaction.date === reportDate)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

function createNotificationBody(payload: {
  todaySpent: number;
  monthlyBudget: number;
  currentSpent: number;
  usageRate: number;
  alerts: SpendingAlert[];
  insight: SpendingInsight;
  hasRisk: boolean;
}): string {
  const baseLines = [
    `오늘 사용 금액은 ${formatWon(payload.todaySpent)}이에요.`,
    `이번 달 누적 소비는 ${formatWon(payload.currentSpent)} / ${formatWon(payload.monthlyBudget)}이고, 현재 소비율은 ${formatPercent(payload.usageRate)}예요.`
  ];

  if (!payload.hasRisk) {
    return [
      ...baseLines,
      "아직 위험 신호는 없어요.",
      "지금 소비 흐름은 안정적이에요."
    ].join("\n");
  }

  return [
    ...baseLines,
    "",
    "주의가 필요해요.",
    "감지된 소비 위험:",
    ...payload.alerts.map((alert) => `- ${alert.message}`),
    "",
    "AI 소비 인사이트:",
    payload.insight.summary,
    payload.insight.suggestion
  ].join("\n");
}

export function createDailyReportPayload({
  userId,
  reportDate,
  spendingStatus,
  transactions,
  alerts,
  insight,
  monthlyBudget,
  currentSpent
}: CreateDailyReportPayloadInput): DailyReportPayload {
  const todaySpent = getTodaySpent(transactions, reportDate);
  const usageRate = Math.round(spendingStatus.usageRate);
  const hasRisk = alerts.length > 0;
  const notificationMessage = {
    title: "SpendFlow 데일리 소비 브리핑",
    body: createNotificationBody({
      todaySpent,
      monthlyBudget,
      currentSpent,
      usageRate,
      alerts,
      insight,
      hasRisk
    })
  };

  return {
    userId,
    eventType: "DAILY_SPENDING_REPORT",
    reportDate,
    spending: {
      todaySpent,
      monthlyBudget,
      currentSpent,
      remainingBudget: monthlyBudget - currentSpent,
      usageRate
    },
    alerts,
    insight,
    notificationMessage,
    hasRisk,
    createdAt: new Date().toISOString()
  };
}
