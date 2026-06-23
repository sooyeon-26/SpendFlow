import type { Expense, ExpenseCategory } from "../types/expense";
import type { SpendingAlert } from "./detectSpendingAlerts";

export type SpendingStatusForInsight = {
  monthlyBudget: number;
  currentSpent: number;
  usageRate: number;
};

export type CategorySummaryForInsight = {
  category: ExpenseCategory;
  amount: number;
};

export type SpendingInsightTone = "positive" | "info" | "warning" | "danger";

export type SpendingInsight = {
  summary: string;
  mainIssue: string;
  suggestion: string;
  tone: SpendingInsightTone;
};

function findAlert(alerts: SpendingAlert[], type: SpendingAlert["type"]): SpendingAlert | undefined {
  return alerts.find((alert) => alert.type === type);
}

export function generateSpendingInsight(
  spendingStatus: SpendingStatusForInsight,
  categorySummary: CategorySummaryForInsight[],
  alerts: SpendingAlert[],
  transactions: Expense[]
): SpendingInsight {
  const overAlert = findAlert(alerts, "BUDGET_OVER");
  const warningAlert = findAlert(alerts, "BUDGET_WARNING");
  const categoryAlert = findAlert(alerts, "CATEGORY_CONCENTRATION");
  const weeklySpikeAlert = findAlert(alerts, "WEEKLY_SPIKE");
  const topCategory = categorySummary[0];
  const hasTransactions = transactions.length > 0;

  if (overAlert) {
    return {
      summary: "이번 달 소비가 예산을 넘어섰어요.",
      mainIssue: categoryAlert ? categoryAlert.message : `${Math.round(spendingStatus.usageRate)}%까지 소비 수위가 올라왔어요.`,
      suggestion: "남은 기간에는 필수 지출만 남기고, 다음 입력부터 카테고리별 한도를 더 촘촘히 확인해보세요.",
      tone: "danger"
    };
  }

  if (warningAlert) {
    return {
      summary: "이번 달 소비 속도가 조금 빠른 편이에요.",
      mainIssue: categoryAlert ? categoryAlert.message : "예산 80% 구간에 가까워져 지출 속도 조절이 필요해요.",
      suggestion: topCategory
        ? `이번 주에는 ${topCategory.category} 지출을 1~2회 줄이면 예산 안에서 관리하기 쉬워요.`
        : "이번 주에는 작은 반복 지출부터 한 번 줄여보세요.",
      tone: "warning"
    };
  }

  if (categoryAlert) {
    return {
      summary: "전체 예산 흐름은 괜찮지만 한 카테고리에 소비가 몰리고 있어요.",
      mainIssue: categoryAlert.message,
      suggestion: `${topCategory?.category ?? "상위 카테고리"} 지출을 다음 소비 전에 한 번 더 확인하면 균형을 맞추기 좋아요.`,
      tone: "warning"
    };
  }

  if (weeklySpikeAlert) {
    return {
      summary: "최근 7일 소비 흐름이 지난주보다 빨라졌어요.",
      mainIssue: weeklySpikeAlert.message,
      suggestion: "이번 주 남은 소비는 고정 지출과 변동 지출을 나눠서 입력해보세요.",
      tone: "warning"
    };
  }

  if (!hasTransactions) {
    return {
      summary: "아직 분석할 소비가 많지 않아요.",
      mainIssue: "첫 소비를 입력하면 SpendFlow가 흐름을 감지할 수 있어요.",
      suggestion: "입력 탭에서 오늘의 소비를 하나 추가해보세요.",
      tone: "info"
    };
  }

  return {
    summary: "이번 달 소비 흐름이 안정적으로 유지되고 있어요.",
    mainIssue: topCategory ? `${topCategory.category}가 가장 큰 비중이지만 위험 신호는 아직 없어요.` : "특별히 두드러진 위험 신호는 없어요.",
    suggestion: "지금처럼 소비를 꾸준히 기록하면 예산 안에서 관리하기 좋아요.",
    tone: "positive"
  };
}
