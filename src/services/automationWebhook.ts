import type { Expense } from "../types/expense";

export async function notifyExpenseCreated(_expense: Expense): Promise<void> {
  return;
}

export async function notifyBudgetRisk(_payload: unknown): Promise<void> {
  return;
}
