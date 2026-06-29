import type { Budget, Expense } from "../types/expense";
import type { ExpenseCreatedWebhookPayload } from "./slackMessages";
import { createExpenseCreatedWebhookPayload } from "../utils/spendAlerts";

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;

export async function sendSpendAlertWebhook(payload: ExpenseCreatedWebhookPayload): Promise<void> {
  if (!WEBHOOK_URL) {
    console.log("[SpendFlow webhook preview]", payload);
    return;
  }

  await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export async function notifyExpenseCreated(expense: Expense, expenses: Expense[], budget: Budget): Promise<void> {
  const payload = createExpenseCreatedWebhookPayload(expenses, budget, expense);
  await sendSpendAlertWebhook(payload);
}

export async function notifyBudgetRisk(payload: ExpenseCreatedWebhookPayload): Promise<void> {
  await sendSpendAlertWebhook(payload);
}
