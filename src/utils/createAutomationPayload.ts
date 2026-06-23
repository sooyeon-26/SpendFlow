import type { SpendingAlert } from "./detectSpendingAlerts";
import type { SpendingInsight, SpendingStatusForInsight } from "./generateSpendingInsight";

export type AutomationPayload = {
  userId: string;
  eventType: "SPENDING_ALERT";
  alerts: SpendingAlert[];
  insight: SpendingInsight;
  spending: SpendingStatusForInsight;
  createdAt: string;
};

export function createAutomationPayload(
  alerts: SpendingAlert[],
  spendingInsight: SpendingInsight,
  spendingStatus: SpendingStatusForInsight,
  userId = "mock-user-1"
): AutomationPayload {
  return {
    userId,
    eventType: "SPENDING_ALERT",
    alerts,
    insight: spendingInsight,
    spending: {
      monthlyBudget: spendingStatus.monthlyBudget,
      currentSpent: spendingStatus.currentSpent,
      usageRate: Math.round(spendingStatus.usageRate)
    },
    createdAt: new Date().toISOString()
  };
}
