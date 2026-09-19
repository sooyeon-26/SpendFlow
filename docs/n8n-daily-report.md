# n8n 데일리 소비 리포트 연결

SpendFlow가 만든 `DAILY_SPENDING_REPORT` payload를 n8n으로 전달하는 선택 기능입니다. 브라우저는 n8n 주소를 직접 호출하지 않고 `/api/daily-report` 서버 함수를 사용합니다.

## 환경변수

배포 환경에 아래 값을 등록합니다.

```dotenv
VITE_ENABLE_DAILY_REPORTS=true
N8N_DAILY_REPORT_WEBHOOK_URL=https://your-n8n-domain/webhook/spendflow-daily-report
```

`VITE_ENABLE_DAILY_REPORTS`는 공개되어도 되는 기능 플래그입니다. 실제 Webhook 주소인 `N8N_DAILY_REPORT_WEBHOOK_URL`은 서버에서만 읽으며 `VITE_` 접두사를 붙이면 안 됩니다.

## 요청 흐름

```text
테스트 패널
  → POST /api/daily-report
  → N8N_DAILY_REPORT_WEBHOOK_URL
  → n8n Webhook
```

브라우저가 닫혀 있으면 테스트 패널도 요청을 만들지 않습니다. 정해진 시각에 자동 발송하려면 n8n의 Schedule Trigger가 별도의 데이터 소스나 백엔드 API를 호출하도록 구성해야 합니다.

## n8n 노드 예시

1. Webhook Trigger로 SpendFlow payload를 받습니다.
2. IF Node에서 `{{$json.hasRisk}}`가 `true`인지 확인합니다.
3. 위험 조건이면 `channelMessage.plainText`를 경고 채널로 보냅니다.
4. 위험 조건이 없으면 같은 필드를 일반 리포트 채널로 보냅니다.
5. 필요한 경우 `notionLog` 필드를 저장합니다.

주요 필드:

- `eventType`
- `reportDate`
- `hasRisk`
- `riskLevel`
- `channelMessage.title`
- `channelMessage.plainText`
- `spending.currentSpent`
- `spending.monthlyBudget`
- `spending.usageRate`
- `alerts`
- `insight.summary`
- `notionLog`

## payload 예시

```json
{
  "eventType": "DAILY_SPENDING_REPORT",
  "source": "SpendFlow",
  "reportDate": "2026-06-23",
  "hasRisk": true,
  "riskLevel": "warning",
  "channelMessage": {
    "title": "SpendFlow 데일리 소비 리포트",
    "plainText": "이번 달 예산의 82%를 사용했어요."
  },
  "spending": {
    "todaySpent": 68000,
    "monthlyBudget": 800000,
    "currentSpent": 656000,
    "remainingBudget": 144000,
    "usageRate": 82
  },
  "alerts": [],
  "insight": {
    "summary": "이번 달 소비 속도가 빠른 편이에요.",
    "suggestion": "이번 주 카페 지출을 한두 번 줄여보세요.",
    "tone": "warning"
  }
}
```
