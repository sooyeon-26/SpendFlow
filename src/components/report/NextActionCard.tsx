import { ArrowRightCircle } from "lucide-react";
import type { Budget, Expense } from "../../types/expense";
import { detectRepeatedSpending, getPreviousWeeklySpent, getRiskCategories, getWeeklySpent, getCategoryTotals } from "../../utils/analytics";
import { formatWon } from "../../utils/format";
import { GlassCard } from "../ui/GlassCard";

function buildNextAction(expenses: Expense[], budget: Budget): string {
  const risks = getRiskCategories(expenses, budget);
  const repeats = detectRepeatedSpending(expenses);
  const cafeRisk = risks.find((risk) => risk.category === "카페");
  const shoppingRisk = risks.find((risk) => risk.category === "쇼핑");
  const weekly = getWeeklySpent(expenses);
  const previous = getPreviousWeeklySpent(expenses);

  if (cafeRisk || repeats.some((repeat) => repeat.label === "카페")) {
    const remaining = Math.max(0, budget.categoryBudgets.카페 - getCategoryTotals(expenses).카페);
    return remaining > 0
      ? `이번 달 남은 카페 예산은 ${formatWon(remaining)}이에요. 다음 지출 전에 남은 예산을 확인해 보세요.`
      : "이번 달 카페 예산을 모두 사용했어요. 다음 지출 전에 예산과 소비 계획을 다시 확인해 보세요.";
  }

  if (shoppingRisk) {
    return "쇼핑 수위가 빠르게 차오르고 있어요. 다음 쇼핑 전 3일 대기 규칙을 적용해보세요.";
  }

  if (previous > 0 && weekly > previous * 1.1) {
    return "이번 주 소비 흐름이 가팔라졌어요. 가장 많이 오른 카테고리부터 천천히 확인해보세요.";
  }

  return "이번 주 소비 흐름은 안정적이에요. 작은 지출 파동만 가볍게 살펴보면 충분해요.";
}

export function NextActionCard({ expenses, budget }: { expenses: Expense[]; budget: Budget }) {
  return (
    <GlassCard className="next-action-card">
      <div className="card-heading">
        <h2>다음 액션</h2>
        <ArrowRightCircle size={18} />
      </div>
      <p>{buildNextAction(expenses, budget)}</p>
    </GlassCard>
  );
}
