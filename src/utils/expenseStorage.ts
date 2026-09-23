import { DEFAULT_PAYMENT_METHOD } from "../constants/expenses";
import type { Expense } from "../types/expense";
import { createDemoExpenses } from "../data/demoExpenses";
import { toDateKey } from "./date";

const STORAGE_KEY = "spendflow_expenses";
const DEMO_KEY = "spendflow_demo_expenses_v1";
const defaultModes = new WeakMap<Window, boolean>();

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get("demo") === "1") return true;
  if (params.get("mode") === "personal") return false;
  // A saved personal dataset (including an intentionally empty one) is never replaced.
  if (!defaultModes.has(window)) defaultModes.set(window, window.localStorage.getItem(STORAGE_KEY) === null);
  return defaultModes.get(window)!;
}

export function resetDemoExpenses(): Expense[] {
  const expenses = createDemoExpenses();
  window.localStorage.setItem(DEMO_KEY, JSON.stringify({ month: toDateKey(new Date()).slice(0, 7), expenses }));
  return expenses;
}

function readDemoExpenses(): Expense[] {
  try {
    const saved = JSON.parse(window.localStorage.getItem(DEMO_KEY) ?? "null");
    if (saved?.month === toDateKey(new Date()).slice(0, 7) && Array.isArray(saved.expenses)) {
      return sortExpenses(saved.expenses.map(normalizeExpense));
    }
  } catch { /* Recover only the separate demo dataset. */ }
  return resetDemoExpenses();
}

function normalizeExpense(expense: Expense): Expense {
  return {
    ...expense,
    paymentMethod: expense.paymentMethod ?? DEFAULT_PAYMENT_METHOD,
    memo: expense.memo ?? expense.merchant ?? ""
  };
}

function sortExpenses(expenses: Expense[]): Expense[] {
  return [...expenses].sort((a, b) => {
    const createdDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (createdDiff !== 0) return createdDiff;
    return new Date(`${b.date}T00:00:00`).getTime() - new Date(`${a.date}T00:00:00`).getTime();
  });
}

export function readExpensesFromStorage(): Expense[] {
  if (typeof window === "undefined") return [];
  if (isDemoMode()) return readDemoExpenses();
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved) as Expense[];
    if (!Array.isArray(parsed)) return [];
    return sortExpenses(parsed.map(normalizeExpense));
  } catch {
    return [];
  }
}

export function writeExpensesToStorage(expenses: Expense[]): void {
  if (typeof window === "undefined") return;
  if (isDemoMode()) {
    window.localStorage.setItem(DEMO_KEY, JSON.stringify({
      month: toDateKey(new Date()).slice(0, 7), expenses: sortExpenses(expenses.map(normalizeExpense)),
    }));
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sortExpenses(expenses.map(normalizeExpense))));
}

export function addExpenseToStorage(expense: Expense): Expense[] {
  const expenses = readExpensesFromStorage();
  const next = sortExpenses([normalizeExpense(expense), ...expenses]);
  writeExpensesToStorage(next);
  return next;
}

export function updateExpenseInStorage(id: string, updates: Partial<Expense>): Expense[] {
  const expenses = readExpensesFromStorage();
  const next = expenses.map((expense) => (expense.id === id ? normalizeExpense({ ...expense, ...updates }) : expense));
  writeExpensesToStorage(next);
  return next;
}

export function deleteExpenseFromStorage(id: string): Expense[] {
  const next = readExpensesFromStorage().filter((expense) => expense.id !== id);
  writeExpensesToStorage(next);
  return next;
}

