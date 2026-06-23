import type { Expense } from "../types/expense";
import { addExpenseToStorage, deleteExpenseFromStorage, readExpensesFromStorage, updateExpenseInStorage, writeExpensesToStorage } from "../utils/expenseStorage";

export async function getExpenses(): Promise<Expense[]> {
  return readExpensesFromStorage();
}

export async function saveExpenses(expenses: Expense[]): Promise<void> {
  writeExpensesToStorage(expenses);
}

export async function addExpense(expense: Expense): Promise<void> {
  addExpenseToStorage(expense);
}

export async function updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
  updateExpenseInStorage(id, updates);
}

export async function deleteExpense(id: string): Promise<void> {
  deleteExpenseFromStorage(id);
}
