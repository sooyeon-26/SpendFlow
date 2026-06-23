import { create } from "zustand";
import { defaultBudget } from "../data/defaultBudget";
import { addExpense as addExpenseToRepo, deleteExpense as deleteExpenseFromRepo, getExpenses } from "../services/expenseRepository";
import { notifyExpenseCreated } from "../services/automationWebhook";
import type { Budget, Expense, TabId } from "../types/expense";

type ToastState = {
  message: string;
  visible: boolean;
};

type ExpenseState = {
  expenses: Expense[];
  budget: Budget;
  activeTab: TabId;
  isLoading: boolean;
  toast: ToastState;
  selectedCategory: string;
  loadExpenses: () => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setActiveTab: (tab: TabId) => void;
  setSelectedCategory: (category: string) => void;
  showToast: (message: string) => void;
  hideToast: () => void;
};

export const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: [],
  budget: defaultBudget,
  activeTab: "home",
  isLoading: true,
  toast: { message: "", visible: false },
  selectedCategory: "전체",
  loadExpenses: async () => {
    const expenses = await getExpenses();
    set({ expenses, isLoading: false });
  },
  addExpense: async (expense) => {
    await addExpenseToRepo(expense);
    await notifyExpenseCreated(expense);
    const expenses = await getExpenses();
    set({ expenses, toast: { message: "오늘의 소비가 흐름에 추가됐어요", visible: true } });
  },
  deleteExpense: async (id) => {
    await deleteExpenseFromRepo(id);
    const expenses = await getExpenses();
    set({ expenses, toast: { message: "소비 흐름에서 삭제했어요", visible: true } });
  },
  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  showToast: (message) => set({ toast: { message, visible: true } }),
  hideToast: () => set((state) => ({ toast: { ...state.toast, visible: false } }))
}));
