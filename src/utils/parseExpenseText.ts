import type { ExpenseCategory, ParsedExpenseResult, PaymentMethod } from "../types/expense";
import { DEFAULT_PAYMENT_METHOD } from "../constants/expenses";
import { toDateKey } from "./date";

const categoryKeywords: Record<ExpenseCategory, string[]> = {
  카페: ["스타벅스", "투썸", "메가커피", "카페"],
  교통: ["지하철", "버스", "택시"],
  쇼핑: ["올리브영", "쿠팡", "무신사", "네이버페이"],
  구독: ["넷플릭스", "유튜브", "디즈니", "티빙"],
  문화: ["영화", "공연", "전시", "책", "서점", "음악"],
  식비: ["편의점", "마트", "식당", "밥", "김밥", "햄버거"],
  생활: ["다이소", "생활용품"],
  기타: []
};

const paymentKeywords: Record<PaymentMethod, string[]> = {
  카드: ["카드", "체크", "신용"],
  현금: ["현금"],
  계좌이체: ["계좌", "이체", "계좌이체"],
  간편결제: ["간편결제", "페이", "네이버페이", "카카오페이", "토스"],
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

function classifyPaymentMethod(text: string): PaymentMethod {
  const normalized = text.toLowerCase();
  for (const [method, keywords] of Object.entries(paymentKeywords) as [PaymentMethod, string[]][]) {
    if (keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))) {
      return method;
    }
  }
  return DEFAULT_PAYMENT_METHOD;
}

function removePaymentWords(text: string): string {
  return Object.values(paymentKeywords)
    .flat()
    .reduce((next, keyword) => next.replace(new RegExp(keyword, "gi"), ""), text);
}

export function parseExpenseText(text: string): ParsedExpenseResult {
  const amountMatch = text.match(/(?:₩\s*)?([0-9][0-9,\s]*)\s*원?/);
  const amount = amountMatch ? Number(amountMatch[1].replace(/[,\s]/g, "")) : 0;
  const merchant = removePaymentWords(text)
    .replace(/(?:₩\s*)?[0-9][0-9,\s]*\s*원?/g, "")
    .trim()
    .replace(/\s+/g, " ") || "확인 필요";
  const category = classifyCategory(text);
  const paymentMethod = classifyPaymentMethod(text);
  const confidence = confidenceFor(category, merchant);

  return {
    rawText: text,
    date: toDateKey(new Date()),
    merchant,
    amount,
    category,
    paymentMethod,
    source: "mock-ai",
    confidence,
    needsReview: confidence < 0.8,
    memo: text
  };
}
