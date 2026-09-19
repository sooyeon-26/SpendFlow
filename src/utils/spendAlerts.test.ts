import { describe, expect, it } from "vitest";

import type { Budget, Expense } from "../types/expense";
import { createExpenseCreatedWebhookPayload, createSpendAlertPayloads } from "./spendAlerts";

const budget: Budget = {
  monthlyBudget: 100_000,
  categoryBudgets: {
    카페: 20_000,
    식비: 30_000,
    교통: 10_000,
    쇼핑: 10_000,
    구독: 10_000,
    생활: 10_000,
    문화: 5_000,
    기타: 5_000,
  },
};

function expense(id: string, amount: number): Expense {
  const date = new Date().toISOString().slice(0, 10);
  return {
    id,
    date,
    merchant: "테스트 지출",
    amount,
    category: "식비",
    paymentMethod: "카드",
    source: "manual",
    confidence: 1,
    needsReview: false,
    memo: "테스트",
    createdAt: new Date().toISOString(),
  };
}

describe("spend alerts", () => {
  it("월 예산 80% 이상이면 경고 payload를 만든다", () => {
    const latest = expense("expense-1", 80_000);
    const alerts = createSpendAlertPayloads([latest], budget, latest);

    expect(alerts.map((alert) => alert.type)).toContain("BUDGET_WARNING");
    expect(alerts.map((alert) => alert.type)).toContain("DAILY_SPEND_ALERT");
  });

  it("Slack 메시지를 포함한 소비 생성 이벤트를 만든다", () => {
    const latest = expense("expense-2", 101_000);
    const payload = createExpenseCreatedWebhookPayload([latest], budget, latest);

    expect(payload.event).toBe("expense_created");
    expect(payload.alertType).toBe("budget_exceeded");
    expect(payload.slack.summaryMessage.blocks.length).toBeGreaterThan(0);
    expect(payload.slack.riskMessage).not.toBeNull();
  });
});
