import { afterEach, expect, it, vi } from "vitest";
import { createDemoExpenses } from "../data/demoExpenses";

const notify = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
vi.mock("../services/automationWebhook", () => ({ notifyExpenseCreated: notify }));
afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); notify.mockClear(); });

it("keeps demo edits out of external automation and restores the 26% dataset", async () => {
  const saved = new Map<string, string>();
  vi.stubGlobal("window", {
    location: { search: "?demo=1" },
    localStorage: { getItem: (key: string) => saved.get(key) ?? null, setItem: (key: string, value: string) => saved.set(key, value) },
  });
  const { useExpenseStore } = await import("./expenseStore");
  await useExpenseStore.getState().loadExpenses();
  await useExpenseStore.getState().addExpense({ ...createDemoExpenses()[0], id: "test-add", amount: 5000 });
  expect(useExpenseStore.getState().expenses.reduce((sum, expense) => sum + expense.amount, 0)).toBe(135000);
  expect(notify).not.toHaveBeenCalled();
  useExpenseStore.getState().resetDemo();
  expect(useExpenseStore.getState().expenses.reduce((sum, expense) => sum + expense.amount, 0)).toBe(130000);
  expect(saved.has("spendflow_expenses")).toBe(false);
});

it("keeps the personal-record notification behavior and ignores demo reset in personal mode", async () => {
  const saved = new Map<string, string>([["spendflow_expenses", "[]"]]);
  vi.stubGlobal("window", {
    location: { search: "?mode=personal" },
    localStorage: { getItem: (key: string) => saved.get(key) ?? null, setItem: (key: string, value: string) => saved.set(key, value) },
  });
  const { useExpenseStore } = await import("./expenseStore");
  await useExpenseStore.getState().loadExpenses();
  await useExpenseStore.getState().addExpense({ ...createDemoExpenses()[0], id: "personal", amount: 6800 });
  expect(notify).toHaveBeenCalledTimes(1);
  useExpenseStore.getState().resetDemo();
  expect(useExpenseStore.getState().expenses).toHaveLength(1);
  expect(useExpenseStore.getState().expenses[0].id).toBe("personal");
});
