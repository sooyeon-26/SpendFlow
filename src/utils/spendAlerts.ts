import type { Budget, Expense } from "../types/expense";
import {
  createSlackRiskMessage,
  createSlackSummaryMessage,
  getActionSuggestion,
  getRiskLabel,
  type AlertType,
  type ExpenseCreatedWebhookPayload,
  type Severity
} from "../services/slackMessages";
import { formatWon } from "./format";
import { getBudgetUsage, getDaySpent, getMonthlySpent, getRemainingBudget, getTopCategory } from "./analytics";

export type SpendAlertType = "BUDGET_WARNING" | "BUDGET_EXCEEDED" | "DAILY_SPEND_ALERT";

export type SpendAlertPayload = {
  type: SpendAlertType;
  percentage: number;
  monthlySpent: number;
  monthlyBudget: number;
  remainingBudget: number;
  topCategory: string;
  message: string;
  expenseId?: string;
  dailySpent?: number;
  createdAt: string;
};

export function createSpendAlertPayloads(expenses: Expense[], budget: Budget, latestExpense?: Expense): SpendAlertPayload[] {
  const monthlySpent = getMonthlySpent(expenses);
  const percentage = Math.round(getBudgetUsage(monthlySpent, budget.monthlyBudget));
  const remainingBudget = getRemainingBudget(expenses, budget.monthlyBudget);
  const topCategory = getTopCategory(expenses);
  const base = {
    percentage,
    monthlySpent,
    monthlyBudget: budget.monthlyBudget,
    remainingBudget,
    topCategory: topCategory.category,
    expenseId: latestExpense?.id,
    createdAt: new Date().toISOString()
  };

  const payloads: SpendAlertPayload[] = [];

  if (percentage >= 100) {
    payloads.push({
      ...base,
      type: "BUDGET_EXCEEDED",
      message: "이번 달 예산을 초과했어요. 소비 흐름을 잠시 잔잔하게 만들어볼까요?"
    });
  } else if (percentage >= 80) {
    payloads.push({
      ...base,
      type: "BUDGET_WARNING",
      message: "이번 달 예산의 80%를 사용했어요."
    });
  }

  if (latestExpense) {
    const dailySpent = getDaySpent(expenses, latestExpense.date);
    if (dailySpent >= 50000) {
      payloads.push({
        ...base,
        type: "DAILY_SPEND_ALERT",
        dailySpent,
        message: `${latestExpense.date} 하루 소비가 ${formatWon(dailySpent)}까지 차올랐어요.`
      });
    }
  }

  return payloads;
}

export function createExpenseCreatedWebhookPayload(expenses: Expense[], budget: Budget, latestExpense: Expense): ExpenseCreatedWebhookPayload {
  const monthlySpent = getMonthlySpent(expenses);
  const usageRate = Math.round(getBudgetUsage(monthlySpent, budget.monthlyBudget));
  const remainingBudget = getRemainingBudget(expenses, budget.monthlyBudget);
  const dailySpent = getDaySpent(expenses, latestExpense.date);
  const alertType = getPrimaryAlertType(usageRate, dailySpent);
  const severity = getSeverity(alertType);
  const hasRiskAlert = alertType !== null;
  const summary = {
    monthlyBudget: budget.monthlyBudget,
    monthlySpent,
    remainingBudget,
    usageRate,
    dailySpent
  };
  const createdAt = new Date().toISOString();
  const message = createRiskMessage(alertType, summary);
  const basePayload: ExpenseCreatedWebhookPayload = {
    app: "SpendFlow",
    event: "expense_created",
    hasRiskAlert,
    alertType,
    severity,
    title: hasRiskAlert ? "⚠️ SpendFlow 위험 알림" : "💧 SpendFlow 소비 요약",
    message,
    actionSuggestion: getActionSuggestion(alertType, summary, latestExpense),
    expense: {
      amount: latestExpense.amount,
      category: latestExpense.category,
      paymentMethod: latestExpense.paymentMethod,
      memo: latestExpense.memo
    },
    summary,
    slack: {
      summaryMessage: {
        text: "",
        blocks: [],
        blocksJson: "[]"
      },
      riskMessage: null
    },
    createdAt
  };

  return {
    ...basePayload,
    slack: {
      summaryMessage: createSlackSummaryMessage(basePayload),
      riskMessage: createSlackRiskMessage(basePayload)
    }
  };
}

function getPrimaryAlertType(usageRate: number, dailySpent: number): AlertType {
  if (usageRate >= 100) return "budget_exceeded";
  if (usageRate >= 80) return "budget_warning";
  if (dailySpent >= 50000) return "daily_spending_warning";
  return null;
}

function getSeverity(alertType: AlertType): Severity {
  if (alertType === "budget_exceeded") return "danger";
  if (alertType === "budget_warning" || alertType === "daily_spending_warning") return "warning";
  return "normal";
}

function createRiskMessage(alertType: AlertType, summary: ExpenseCreatedWebhookPayload["summary"]): string {
  if (alertType === "budget_exceeded") {
    return `이번 달 예산의 ${Math.round(summary.usageRate)}%를 사용 중이에요.`;
  }

  if (alertType === "budget_warning") {
    return `이번 달 예산의 ${Math.round(summary.usageRate)}%를 사용 중이에요.`;
  }

  if (alertType === "daily_spending_warning") {
    return `오늘만 ${formatWon(summary.dailySpent)}을 사용했어요.`;
  }

  return getRiskLabel(alertType);
}
