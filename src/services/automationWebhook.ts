import type { Budget, Expense } from "../types/expense";
import type { ExpenseCreatedWebhookPayload } from "./slackMessages";
import { createExpenseCreatedWebhookPayload } from "../utils/spendAlerts";

const ALERTS_ENABLED = import.meta.env.VITE_ENABLE_SPEND_ALERTS === "true";

export async function sendSpendAlertWebhook(payload: ExpenseCreatedWebhookPayload): Promise<void> {
  if (!ALERTS_ENABLED) {
    return;
  }

  const response = await fetch("/api/spend-alert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Spend alert delivery failed (${response.status})`);
  }
}

export async function notifyExpenseCreated(expense: Expense, expenses: Expense[], budget: Budget): Promise<void> {
  const payload = createExpenseCreatedWebhookPayload(expenses, budget, expense);
  await sendSpendAlertWebhook(payload);
}

export async function notifyBudgetRisk(payload: ExpenseCreatedWebhookPayload): Promise<void> {
  await sendSpendAlertWebhook(payload);
}
