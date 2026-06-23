import type { Budget } from "../types/expense";

export const defaultBudget: Budget = {
  monthlyBudget: 500000,
  categoryBudgets: {
    식비: 180000,
    카페: 50000,
    교통: 70000,
    쇼핑: 100000,
    구독: 30000,
    생활: 50000,
    기타: 20000
  }
};
