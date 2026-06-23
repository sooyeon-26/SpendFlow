import type { N8nDailyReportPayload } from "./createN8nDailyReportPayload";

const WEBHOOK_URL = import.meta.env.VITE_N8N_DAILY_REPORT_WEBHOOK_URL as string | undefined;

export type N8nDailyReportWebhookResult =
  | {
      ok: true;
      status: number;
      message: string;
    }
  | {
      ok: false;
      status?: number;
      reason: "NO_WEBHOOK_URL" | "REQUEST_FAILED";
      message: string;
    };

export async function sendN8nDailyReportWebhook(payload: N8nDailyReportPayload): Promise<N8nDailyReportWebhookResult> {
  if (!WEBHOOK_URL) {
    return {
      ok: false,
      reason: "NO_WEBHOOK_URL",
      message: "n8n Webhook URL이 설정되지 않았어요."
    };
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
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
