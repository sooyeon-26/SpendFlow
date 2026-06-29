import type { ExpenseCategory, PaymentMethod } from "../types/expense";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = ["카페", "식비", "교통", "쇼핑", "구독", "생활", "문화", "기타"];

export const PAYMENT_METHODS: PaymentMethod[] = ["카드", "현금", "계좌이체", "간편결제", "기타"];

export const DEFAULT_PAYMENT_METHOD: PaymentMethod = "카드";

export const DEFAULT_MONTHLY_BUDGET = 500000;
