import { DEFAULT_PAYMENT_METHOD } from "../constants/expenses";
import type { Expense } from "../types/expense";

const STORAGE_KEY = "spendflow_expenses";

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
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved) as Expense[];
    if (!Array.isArray(parsed)) return [];
    return sortExpenses(parsed.map(normalizeExpense));
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function writeExpensesToStorage(expenses: Expense[]): void {
  if (typeof window === "undefined") return;
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

