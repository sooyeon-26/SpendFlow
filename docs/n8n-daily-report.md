# SpendFlow n8n 데일리 소비 브리핑 자동화

## 워크플로우 목표

SpendFlow는 단순히 소비 데이터를 보여주는 앱이 아니라, 소비 데이터를 기반으로 위험 조건을 감지하고 매일 정해진 시간에 자동 브리핑을 보내는 자동화 구조를 포함합니다. n8n Schedule Trigger와 Webhook을 활용해 daily report payload를 수신하고, `hasRisk` 여부에 따라 기본 브리핑과 위험 알림을 분기 처리합니다. 이를 통해 사용자는 앱을 직접 열지 않아도 매일 자신의 소비 흐름과 위험 신호를 확인할 수 있습니다.

## 앱에서 준비하는 것

SpendFlow는 `DAILY_SPENDING_REPORT` payload를 만들고, 개발용 테스트 패널의 `n8n으로 테스트 알림 보내기` 버튼으로 n8n Webhook에 POST 전송할 수 있습니다.

브라우저 앱은 항상 실행 중이지 않기 때문에 앱에서 매일 자동으로 전송하지 않습니다. 매일 정해진 시간 실행은 n8n의 Schedule Trigger가 담당합니다.

## 환경변수

`.env`에 n8n Webhook URL을 설정합니다. 실제 `.env` 파일은 git에 올리지 않습니다.

```bash
VITE_N8N_DAILY_REPORT_WEBHOOK_URL=https://your-n8n-domain/webhook/spendflow-daily-report
```

`.gitignore`에는 `.env`와 `.env.local`이 포함되어 있습니다.

## n8n 노드 구성

1. Schedule Trigger

매일 원하는 시간에 실행합니다. 예: 매일 21:00.

2. Webhook Trigger 또는 HTTP Request

SpendFlow에서 보낸 daily report payload를 수신합니다. 테스트 단계에서는 앱의 `n8n으로 테스트 알림 보내기` 버튼으로 payload 전송을 확인합니다.

3. IF Node

위험 조건 분기:

```text
{{$json.hasRisk}} is true
```

4. True branch

위험 조건이 있는 경우 `channelMessage.plainText`를 사용해 Gmail, Discord, Slack 중 하나로 알림을 보냅니다. 메시지에는 `alerts`와 `insight`가 포함됩니다.

5. False branch

위험 조건이 없는 경우 기본 데일리 소비 브리핑을 보냅니다. 메시지에는 안정적인 소비 흐름 안내가 포함됩니다.

6. Notion Node 선택 사항

데일리 리포트 로그를 저장합니다. 추천 필드는 `reportDate`, `usageRate`, `hasRisk`, `riskLevel`, `alertCount`, `mainAlert`, `insightSummary`입니다.

## n8n에서 사용할 주요 필드

- `eventType`
- `reportDate`
- `hasRisk`
- `riskLevel`
- `channelMessage.title`
- `channelMessage.plainText`
- `spending.todaySpent`
- `spending.currentSpent`
- `spending.monthlyBudget`
- `spending.usageRate`
- `alerts`
- `insight.summary`
- `insight.suggestion`
- `notionLog`

## IF 조건 예시

위험 조건 분기:

```text
{{$json.hasRisk}} is true
```

위험 레벨 danger 분기:

```text
{{$json.riskLevel}} equals danger
```

소비율 80% 이상 분기:

```text
{{$json.spending.usageRate}} >= 80
```

알림 본문:

```text
{{$json.channelMessage.plainText}}
```

알림 제목:

```text
{{$json.channelMessage.title}}
```

## payload 형태

```json
{
  "eventType": "DAILY_SPENDING_REPORT",
  "source": "SpendFlow",
  "userId": "mock-user-1",
  "reportDate": "2026-06-23",
  "hasRisk": true,
  "riskLevel": "warning",
  "channelMessage": {
    "title": "SpendFlow 데일리 소비 브리핑",
    "body": "오늘 사용 금액은 68,000원이에요...",
    "plainText": "[SpendFlow 데일리 소비 브리핑]\n\n오늘 사용 금액은 68,000원이에요...",
    "summaryLine": "이번 달 소비율 82%, 주의가 필요해요."
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
    "summary": "이번 달 소비 속도가 조금 빠른 편이에요.",
    "mainIssue": "카페와 식비 지출 비중이 높아요.",
    "suggestion": "이번 주에는 카페 지출을 2회 정도 줄여보세요.",
    "tone": "warning"
  },
  "notionLog": {
    "title": "2026-06-23 데일리 소비 브리핑",
    "riskLevel": "warning",
    "alertCount": 1,
    "mainAlert": "이번 달 예산의 82%를 사용했어요.",
    "insightSummary": "이번 달 소비 속도가 조금 빠른 편이에요."
  }
}
```

## 향후 실제 서비스 확장

실제 서비스에서는 백엔드 API를 추가하는 방향이 적합합니다. n8n Schedule Trigger가 매일 백엔드 API를 호출하고, 백엔드가 daily report payload를 생성해서 n8n에 반환한 뒤, n8n이 Gmail, Discord, Slack 또는 Notion으로 알림과 로그를 처리합니다.
