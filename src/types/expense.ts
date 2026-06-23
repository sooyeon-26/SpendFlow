export type ExpenseCategory = "식비" | "카페" | "교통" | "쇼핑" | "구독" | "생활" | "기타";

export type Expense = {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category: ExpenseCategory;
  source: "manual" | "mock-ai";
  confidence: number;
  needsReview: boolean;
  memo?: string;
  createdAt: string;
};

export type Budget = {
  monthlyBudget: number;
  categoryBudgets: Record<ExpenseCategory, number>;
};

export type ParsedExpenseResult = Omit<Expense, "id" | "createdAt"> & {
  rawText: string;
};

export type TabId = "home" | "input" | "history" | "report";
