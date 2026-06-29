export type ExpenseCategory = "카페" | "식비" | "교통" | "쇼핑" | "구독" | "생활" | "문화" | "기타";

export type PaymentMethod = "카드" | "현금" | "계좌이체" | "간편결제" | "기타";

export type Expense = {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  source: "manual" | "mock-ai";
  confidence: number;
  needsReview: boolean;
  memo: string;
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
