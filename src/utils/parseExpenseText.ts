import type { ExpenseCategory, ParsedExpenseResult } from "../types/expense";
import { toDateKey } from "./date";

const categoryKeywords: Record<ExpenseCategory, string[]> = {
  카페: ["스타벅스", "투썸", "메가커피", "카페"],
  교통: ["지하철", "버스", "택시"],
  쇼핑: ["올리브영", "쿠팡", "무신사", "네이버페이"],
  구독: ["넷플릭스", "유튜브", "디즈니", "티빙"],
  식비: ["편의점", "마트", "식당", "밥", "김밥", "햄버거"],
  생활: ["다이소", "생활용품"],
  기타: []
};

function classifyCategory(text: string): ExpenseCategory {
  const normalized = text.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryKeywords) as [ExpenseCategory, string[]][]) {
    if (keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))) {
      return category;
    }
  }
  return "기타";
}

function confidenceFor(category: ExpenseCategory, merchant: string): number {
  if (category === "기타") return 0.76;
  const seed = merchant.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Math.min(0.98, 0.82 + (seed % 16) / 100);
}

export function parseExpenseText(text: string): ParsedExpenseResult {
  const amountMatch = text.match(/(?:₩\s*)?([0-9][0-9,\s]*)\s*원?/);
  const amount = amountMatch ? Number(amountMatch[1].replace(/[,\s]/g, "")) : 0;
  const merchant = text
    .replace(/(?:₩\s*)?[0-9][0-9,\s]*\s*원?/g, "")
    .trim()
    .replace(/\s+/g, " ") || "확인 필요";
  const category = classifyCategory(text);
  const confidence = confidenceFor(category, merchant);

  return {
    rawText: text,
    date: toDateKey(new Date()),
    merchant,
    amount,
    category,
    source: "mock-ai",
    confidence,
    needsReview: confidence < 0.8
  };
}
