import type { N8nDailyReportPayload } from "./createN8nDailyReportPayload";

const DAILY_REPORTS_ENABLED = import.meta.env.VITE_ENABLE_DAILY_REPORTS === "true";

export type N8nDailyReportWebhookResult =
  | {
      ok: true;
      status: number;
      message: string;
    }
  | {
      ok: false;
      status?: number;
      reason: "AUTOMATION_DISABLED" | "REQUEST_FAILED";
      message: string;
    };

export async function sendN8nDailyReportWebhook(payload: N8nDailyReportPayload): Promise<N8nDailyReportWebhookResult> {
  if (!DAILY_REPORTS_ENABLED) {
    return {
      ok: false,
      reason: "AUTOMATION_DISABLED",
      message: "데일리 리포트 자동화가 비활성화되어 있어요."
    };
  }

  try {
    const response = await fetch("/api/daily-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        reason: "REQUEST_FAILED",
        message: "n8n 전송에 실패했어요."
      };
    }

    return {
      ok: true,
      status: response.status,
      message: "n8n으로 데일리 브리핑 payload를 전송했어요."
    };
  } catch {
    return {
      ok: false,
      reason: "REQUEST_FAILED",
      message: "n8n 전송에 실패했어요."
    };
  }
}
