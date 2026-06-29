import type { Budget } from "../types/expense";
import { DEFAULT_MONTHLY_BUDGET } from "../constants/expenses";

export const defaultBudget: Budget = {
  monthlyBudget: DEFAULT_MONTHLY_BUDGET,
  categoryBudgets: {
    식비: 180000,
    카페: 50000,
    교통: 70000,
    쇼핑: 100000,
    구독: 30000,
    생활: 50000,
    문화: 30000,
    기타: 20000
  }
};
