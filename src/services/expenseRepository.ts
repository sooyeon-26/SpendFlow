import { mockExpenses } from "../data/mockExpenses";
import type { Expense } from "../types/expense";

const STORAGE_KEY = "spendflow_expenses";

function readStorage(): Expense[] {
  if (typeof window === "undefined") return mockExpenses;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mockExpenses));
    return mockExpenses;
  }
  try {
    return JSON.parse(saved) as Expense[];
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mockExpenses));
    return mockExpenses;
  }
}

export async function getExpenses(): Promise<Expense[]> {
  return readStorage();
}

export async function saveExpenses(expenses: Expense[]): Promise<void> {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

export async function addExpense(expense: Expense): Promise<void> {
  const expenses = await getExpenses();
  await saveExpenses([expense, ...expenses]);
}

export async function deleteExpense(id: string): Promise<void> {
  const expenses = await getExpenses();
  await saveExpenses(expenses.filter((expense) => expense.id !== id));
}
