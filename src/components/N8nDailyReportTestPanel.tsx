import { Send } from "lucide-react";
import { useState } from "react";
import type { N8nDailyReportPayload } from "../utils/createN8nDailyReportPayload";
import { formatPercent } from "../utils/format";
import { sendN8nDailyReportWebhook, type N8nDailyReportWebhookResult } from "../utils/sendN8nDailyReportWebhook";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { GlassCard } from "./ui/GlassCard";

type SendState = "idle" | "sending" | "success" | "failed" | "missing-url";

function getStatusLabel(state: SendState): string {
  if (state === "sending") return "전송 중";
  if (state === "success") return "전송 성공";
  if (state === "failed") return "전송 실패";
  if (state === "missing-url") return "Webhook URL 없음";
  return "대기 중";
}

function getBadgeTone(state: SendState): "aqua" | "warning" | "danger" | "neutral" {
  if (state === "success") return "aqua";
  if (state === "missing-url") return "warning";
  if (state === "failed") return "danger";
  return "neutral";
}

export function N8nDailyReportTestPanel({ payload }: { payload: N8nDailyReportPayload }) {
  const [sendState, setSendState] = useState<SendState>("idle");
  const [lastSentAt, setLastSentAt] = useState<string>("-");
  const [resultMessage, setResultMessage] = useState("현재 데일리 소비 브리핑 payload를 n8n Webhook으로 전송합니다.");

  const handleSend = async () => {
    setSendState("sending");
    const result: N8nDailyReportWebhookResult = await sendN8nDailyReportWebhook(payload);
    setResultMessage(result.status ? `${result.message} (${result.status})` : result.message);
    setLastSentAt(new Date().toLocaleString("ko-KR"));

    if (result.ok) {
      setSendState("success");
      return;
    }

    setSendState(result.reason === "NO_WEBHOOK_URL" ? "missing-url" : "failed");
  };

  return (
    <GlassCard className="preview-card">
      <div className="card-heading">
        <h2>n8n 데일리 알림 테스트</h2>
        <Badge tone={getBadgeTone(sendState)}>{getStatusLabel(sendState)}</Badge>
      </div>
      <p className="calm-copy">{resultMessage}</p>
      <div className="preview-list">
        <div>
          <span>reportDate</span>
          <strong>{payload.reportDate}</strong>
        </div>
        <div>
          <span>usageRate</span>
          <strong>{formatPercent(payload.spending.usageRate)}</strong>
        </div>
        <div>
          <span>hasRisk</span>
          <strong>{payload.hasRisk ? "true" : "false"}</strong>
        </div>
        <div>
          <span>riskLevel</span>
          <strong>{payload.riskLevel}</strong>
        </div>
        <div>
          <span>alertCount</span>
          <strong>{payload.alerts.length}</strong>
        </div>
        <div>
          <span>마지막 전송 시간</span>
          <strong>{lastSentAt}</strong>
        </div>
      </div>
      <Button type="button" variant="secondary" onClick={handleSend} disabled={sendState === "sending"}>
        <Send size={17} />
        <span>{sendState === "sending" ? "전송 중..." : "n8n으로 테스트 알림 보내기"}</span>
      </Button>
    </GlassCard>
  );
}
