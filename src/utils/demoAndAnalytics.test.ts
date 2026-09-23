import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDemoExpenses } from "../data/demoExpenses";
import { getCategoryTotals, getPreviousWeeklySpent, getTotalSpent, getWeeklySpent, getWeeklyTopCategories } from "./analytics";
import { isWithinDays, toDateKey } from "./date";
import { addExpenseToStorage, isDemoMode, readExpensesFromStorage, resetDemoExpenses, writeExpensesToStorage } from "./expenseStorage";

let saved: Map<string, string>;
let location: { search: string };
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 8, 23, 15));
  saved = new Map();
  location = { search: "" };
  vi.stubGlobal("window", { location, localStorage: {
    getItem: (key: string) => saved.get(key) ?? null,
    setItem: (key: string, value: string) => saved.set(key, value),
    removeItem: (key: string) => saved.delete(key),
  } });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("26% demo isolation", () => {
  it.each([new Date(2026, 8, 23), new Date(2026, 9, 1), new Date(2027, 0, 1)])("seeds 130,000 won in the visit month at %s", (now) => {
    vi.setSystemTime(now);
    const expenses = createDemoExpenses(now);
    expect(getTotalSpent(expenses)).toBe(130000);
    expect(expenses.every((expense) => expense.date.slice(0, 7) === toDateKey(now).slice(0, 7))).toBe(true);
    expect(new Set(expenses.map((expense) => expense.category)).size).toBe(7);
  });
  it("starts a new visitor with a demo, persists additions, and resets only the demo", () => {
    expect(isDemoMode()).toBe(true);
    expect(getTotalSpent(readExpensesFromStorage())).toBe(130000);
    addExpenseToStorage({ ...createDemoExpenses()[0], id: "added", amount: 5000 });
    expect(getTotalSpent(readExpensesFromStorage())).toBe(135000);
    resetDemoExpenses();
    expect(getTotalSpent(readExpensesFromStorage())).toBe(130000);
    expect(saved.has("spendflow_expenses")).toBe(false);
  });
  it("preserves existing personal records byte for byte during demo use and reset", () => {
    const personal = JSON.stringify([{ ...createDemoExpenses()[0], id: "personal", amount: 6800 }]);
    saved.set("spendflow_expenses", personal);
    expect(isDemoMode()).toBe(false);
    expect(getTotalSpent(readExpensesFromStorage())).toBe(6800);
    location.search = "?demo=1";
    expect(getTotalSpent(readExpensesFromStorage())).toBe(130000);
    resetDemoExpenses();
    expect(saved.get("spendflow_expenses")).toBe(personal);
  });
  it("does not switch an open demo to personal storage when another tab creates personal records", () => {
    readExpensesFromStorage();
    const personal = JSON.stringify([{ ...createDemoExpenses()[0], id: "personal", amount: 6800 }]);
    saved.set("spendflow_expenses", personal);
    addExpenseToStorage({ ...createDemoExpenses()[0], id: "demo-edit", amount: 5000 });
    expect(getTotalSpent(readExpensesFromStorage())).toBe(135000);
    expect(saved.get("spendflow_expenses")).toBe(personal);
  });
  it("respects an intentionally empty personal dataset and allows explicit personal use", () => {
    saved.set("spendflow_expenses", "[]");
    expect(isDemoMode()).toBe(false);
    expect(readExpensesFromStorage()).toEqual([]);
    saved.clear(); location.search = "?mode=personal";
    writeExpensesToStorage([]);
    expect(saved.get("spendflow_expenses")).toBe("[]");
  });
  it("refreshes stale demo dates on a new month without affecting personal storage", () => {
    readExpensesFromStorage();
    vi.setSystemTime(new Date(2026, 9, 1, 12));
    expect(getTotalSpent(readExpensesFromStorage())).toBe(130000);
  });
});

describe("consistent reporting windows", () => {
  it("includes culture and excludes zero-value categories from Top 3", () => {
    const culture = { ...createDemoExpenses()[0], category: "문화" as const, amount: 15000 };
    expect(getCategoryTotals([culture]).문화).toBe(15000);
    expect(getWeeklyTopCategories([culture])).toEqual([{ category: "문화", amount: 15000, percent: 100 }]);
    expect(getWeeklyTopCategories([])).toEqual([]);
  });
  it("uses seven full local dates, excludes future dates, and includes the prior-month portion", () => {
    vi.setSystemTime(new Date(2026, 9, 2, 15));
    const expense = createDemoExpenses()[0];
    const expenses = [
      { ...expense, id: "start", date: "2026-09-26", amount: 10000 },
      { ...expense, id: "previous", date: "2026-09-25", amount: 20000 },
      { ...expense, id: "today", date: "2026-10-02", amount: 5000 },
      { ...expense, id: "future", date: "2026-10-03", amount: 90000 },
    ];
    expect(getWeeklySpent(expenses)).toBe(15000);
    expect(getPreviousWeeklySpent(expenses)).toBe(20000);
    expect(getWeeklyTopCategories(expenses)[0].amount).toBe(15000);
    expect(isWithinDays("2026-10-03", 7)).toBe(false);
  });
  it("formats the local date correctly near midnight", () => {
    expect(toDateKey(new Date(2026, 8, 23, 0, 5))).toBe("2026-09-23");
  });
});
