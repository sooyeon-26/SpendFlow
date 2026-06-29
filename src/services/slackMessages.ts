import type { Expense } from "../types/expense";

export type AlertType = "budget_warning" | "budget_exceeded" | "daily_spending_warning" | null;
export type Severity = "normal" | "warning" | "danger";

export type SlackTextObject = {
  type: "plain_text" | "mrkdwn";
  text: string;
};

export type SlackBlock =
  | {
      type: "header";
      text: SlackTextObject;
    }
  | {
      type: "section";
      text?: SlackTextObject;
      fields?: SlackTextObject[];
    }
  | {
      type: "context";
      elements: SlackTextObject[];
    };

export type SlackMessage = {
  text: string;
  blocks: SlackBlock[];
  blocksJson: string;
};

export type ExpenseWebhookSummary = {
  monthlyBudget: number;
  monthlySpent: number;
  remainingBudget: number;
  usageRate: number;
  dailySpent: number;
};

export type ExpenseCreatedWebhookPayload = {
  app: "SpendFlow";
  event: "expense_created";
  hasRiskAlert: boolean;
  alertType: AlertType;
  severity: Severity;
  title: string;
  message: string;
  actionSuggestion: string;
  expense: {
    amount: number;
    category: string;
    paymentMethod: string;
    memo: string;
  };
  summary: ExpenseWebhookSummary;
  slack: {
    summaryMessage: SlackMessage;
    riskMessage: SlackMessage | null;
  };
  createdAt: string;
};

export function formatCurrency(value: number): string {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

export function formatSlackTimestamp(createdAt?: string): string {
  if (!createdAt) return "";

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const dayPeriod = formatKoreanDayPeriod(values.dayPeriod);

  return `${values.year}.${values.month}.${values.day} ${dayPeriod} ${values.hour}:${values.minute}`.trim();
}

export function getRiskLabel(alertType: AlertType): string {
  if (alertType === "budget_exceeded") return "월 예산을 초과했어요.";
  if (alertType === "budget_warning") return "예산 80%에 도달했어요.";
  if (alertType === "daily_spending_warning") return "오늘 소비가 평소보다 높아요.";
  return "소비 흐름이 안정적이에요.";
}

export function getActionSuggestion(alertType: AlertType, summary: ExpenseWebhookSummary, expense: Expense): string {
  if (alertType === "budget_exceeded") {
    return `${expense.category} 지출을 먼저 확인하고, 이번 주 추가 소비를 꼭 필요한 항목 위주로 조정해보세요.`;
  }

  if (alertType === "budget_warning") {
    return `이번 달 예산의 ${Math.round(summary.usageRate)}%를 사용 중이에요. 이번 주에는 ${expense.category} 지출을 1~2회 줄이면 예산 안에서 관리하기 쉬워요.`;
  }

  if (alertType === "daily_spending_warning") {
    return `오늘은 이미 ${formatCurrency(summary.dailySpent)}을 사용했어요. 남은 하루 소비는 소액 결제 위주로 가볍게 잡아보세요.`;
  }

  return "현재 흐름은 안정적이에요. 오늘의 소비 기록을 기준으로 예산 수위를 계속 확인할게요.";
}

export function createSlackSummaryMessage(payload: ExpenseCreatedWebhookPayload): SlackMessage {
  const memo = payload.expense.memo ? `\n메모: ${escapeSlackText(payload.expense.memo)}` : "";
  const contextText = createContextText("자동 분석", payload.createdAt);

  return createSlackMessage({
    text: `💧 SpendFlow 소비 요약 - 최근 소비 ${formatCurrency(payload.expense.amount)} · ${payload.expense.category} · ${payload.expense.paymentMethod}, 이번 달 ${formatCurrency(payload.summary.monthlySpent)} / ${formatCurrency(payload.summary.monthlyBudget)} (${Math.round(payload.summary.usageRate)}%)`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "💧 SpendFlow 소비 요약"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*새 소비가 기록됐어요.*\n최근 소비와 현재 예산 흐름을 확인해보세요."
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*최근 소비*\n${formatCurrency(payload.expense.amount)}${memo}`
          },
          {
            type: "mrkdwn",
            text: `*분류*\n${escapeSlackText(payload.expense.category)} · ${escapeSlackText(payload.expense.paymentMethod)}`
          },
          {
            type: "mrkdwn",
            text: `*이번 달 누적*\n${formatCurrency(payload.summary.monthlySpent)} / ${formatCurrency(payload.summary.monthlyBudget)}`
          },
          {
            type: "mrkdwn",
            text: `*예산 사용률*\n${Math.round(payload.summary.usageRate)}%`
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `남은 예산은 *${formatCurrency(payload.summary.remainingBudget)}*이에요.\n오늘 사용 금액은 *${formatCurrency(payload.summary.dailySpent)}*이에요.`
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: contextText
          }
        ]
      }
    ]
  });
}

export function createSlackRiskMessage(payload: ExpenseCreatedWebhookPayload): SlackMessage | null {
  if (!payload.hasRiskAlert) return null;
  const contextText = createContextText("자동 감지", payload.createdAt);

  return createSlackMessage({
    text: `⚠️ SpendFlow 위험 알림 - ${getRiskLabel(payload.alertType)} ${payload.message}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "⚠️ SpendFlow 위험 알림"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${getRiskLabel(payload.alertType)}*\n${escapeSlackText(payload.message)}`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `👉 ${escapeSlackText(payload.actionSuggestion)}`
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: contextText
          }
        ]
      }
    ]
  });
}

function escapeSlackText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function createContextText(prefix: "자동 분석" | "자동 감지", createdAt?: string): string {
  const formattedTimestamp = formatSlackTimestamp(createdAt);
  return formattedTimestamp ? `${prefix} · SpendFlow · ${formattedTimestamp}` : `${prefix} · SpendFlow`;
}

function formatKoreanDayPeriod(dayPeriod?: string): string {
  if (!dayPeriod) return "";
  if (dayPeriod.toLowerCase() === "am") return "오전";
  if (dayPeriod.toLowerCase() === "pm") return "오후";
  return dayPeriod;
}

function createSlackMessage(message: Omit<SlackMessage, "blocksJson">): SlackMessage {
  return {
    ...message,
    blocksJson: JSON.stringify(message.blocks)
  };
}
