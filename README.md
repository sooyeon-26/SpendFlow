# SpendFlow

SpendFlow는 소비 데이터를 자동으로 입력, 분류, 분석하고 예산 사용률을 물의 수위로 시각화하는 iPhone 최적화 PWA입니다.

## 문제 정의

일반 가계부는 사용자가 매번 소비를 입력하고 카테고리를 고르며 예산 초과 여부를 직접 확인해야 합니다. SpendFlow는 이 흐름을 자동화해 소비가 물처럼 쌓이고, 특정 수위에 가까워지면 사용자가 빠르게 알아차릴 수 있게 합니다.

## 모바일 앱 컨셉

- 기준 화면: iPhone 14 Pro, 393px x 852px
- 구조: 홈, 입력, 내역, 리포트 하단 탭
- UI: glass card, light blue gradient, wave progress, calm water motion
- 데스크탑에서는 가운데 iPhone 앱 프레임처럼 보이고, 모바일에서는 전체 화면을 사용합니다.

## 핵심 기능

- 소비 문장 입력과 mock AI 자동 분류
- 파싱 결과 미리보기와 저장
- localStorage 기반 소비 내역 유지
- 소비 내역 삭제와 카테고리 필터
- 월 총 소비, 오늘 소비, 이번 주 소비 계산
- 예산 수위 wave progress
- 최근 7일 소비 흐름 차트
- 주간 리포트, 반복 소비 감지, 위험 수위 카테고리 표시
- 모바일 토스트와 하단 탭바
- PWA 기본 manifest와 iPhone 메타 태그

## 2단계 개발 내용

- PWA manifest 보강
- iPhone 홈 화면 추가 지원
- PNG 앱 아이콘과 Apple touch icon 적용
- standalone 모드 대응 유틸 추가
- iPhone safe area와 하단 탭바 여백 최적화
- 실제 iPhone 테스트와 포트폴리오 캡처 방법 정리

## 자동화 플로우

현재:

```txt
컴포넌트
→ Zustand store
→ expenseRepository
→ localStorage
```

향후:

```txt
컴포넌트
→ Zustand store
→ expenseRepository
→ Supabase/Firebase/API
```

새 소비 저장 흐름은 아래 확장을 염두에 두고 분리되어 있습니다.

```txt
소비 저장
→ addExpense()
→ notifyExpenseCreated(expense, expenses, budget)
→ sendSpendAlertWebhook(payload)
→ 예산 위험 알림 / 주간 리포트 자동화
```

`VITE_N8N_WEBHOOK_URL`이 설정되어 있으면 조건 충족 시 webhook으로 payload를 전송합니다. URL이 없으면 개발 중 확인하기 쉽도록 콘솔에 payload를 출력합니다.

현재 알림 조건:

- 월 예산 80% 이상 도달
- 월 예산 100% 이상 초과
- 하루 소비 50,000원 이상

## 기술 스택

- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- localStorage
- PWA manifest

## 폴더 구조

```txt
src/
  app/
  components/
    layout/
    home/
    input/
    history/
    report/
    ui/
  store/
  services/
  utils/
  types/
  data/
  styles/
```

## 실행 방법

```bash
npm install
npm run dev
```

Vite dev server는 외부 기기 접속을 위해 기본적으로 `--host 0.0.0.0`으로 실행됩니다.

로컬 네트워크 테스트를 명시적으로 실행하려면 아래 명령을 사용합니다.

```bash
npm run dev -- --host 0.0.0.0
```

## iPhone 실제 테스트 방법

1. 개발 PC와 iPhone을 같은 Wi-Fi에 연결합니다.
2. 개발 PC의 로컬 IP 주소를 확인합니다.

macOS/Linux:

```bash
ifconfig
```

또는:

```bash
ip addr
```

Windows:

```bash
ipconfig
```

3. 서버를 실행합니다.

```bash
npm run dev -- --host 0.0.0.0
```

4. 터미널에 표시되는 Network 주소를 iPhone Safari에서 엽니다.

```txt
http://192.168.0.12:5173
```

## 터널 테스트

같은 Wi-Fi 연결이 어렵거나 외부에서 테스트해야 하면 아래 중 하나를 사용할 수 있습니다.

```bash
npx localtunnel --port 5173
```

또는:

```bash
cloudflared tunnel --url http://localhost:5173
```

터널 URL을 iPhone Safari에서 열면 실제 폰에서 테스트할 수 있습니다.

## PWA 설정

`public/manifest.json`과 `index.html`의 iPhone 메타 태그를 포함했습니다. `theme_color`, `display: standalone`, `orientation: portrait`, safe area 대응 CSS가 적용되어 홈 화면 추가 테스트를 할 수 있습니다.

PWA 관련 파일 구조:

```txt
public/
  manifest.json
  icons/
    icon-192.png
    icon-512.png
    maskable-512.png
    apple-touch-icon.png

src/
  utils/
    pwa.ts
```

## iPhone PWA 캡처 방법

주소창 없는 앱 화면으로 테스트하거나 캡처하려면 아래 순서로 진행합니다.

1. iPhone Safari에서 SpendFlow Network 주소를 엽니다.
2. Safari 하단 공유 버튼을 누릅니다.
3. “홈 화면에 추가”를 선택합니다.
4. 홈 화면에 생성된 SpendFlow 아이콘을 실행합니다.
5. 주소창 없는 standalone 화면에서 레이아웃, safe area, 스크롤, 캡처 상태를 확인합니다.

포트폴리오용 화면 캡처는 Safari 주소창이 보이는 일반 브라우저 화면보다, 홈 화면에 추가한 PWA standalone 모드에서 촬영하는 것을 권장합니다.

이 방식은 주소창 없이 실제 앱처럼 보이고, 하단 탭바와 safe area가 자연스럽게 보여 iPhone 앱 형태의 포트폴리오 이미지로 사용하기 좋습니다.

## localStorage 사용 이유

이번 MVP는 백엔드 없이 실제 iPhone Safari에서 빠르게 소비 입력, 저장, 삭제, 분석, 리포트 기능을 검증하기 위해 `localStorage`를 사용합니다. 저장 key는 `spendflow_expenses`입니다.

## 향후 DB 확장 계획

- Supabase: 사용자 로그인, 소비 데이터 저장, n8n 연동에 적합
- Firebase: 빠른 모바일 앱 프로토타입과 여러 기기 동기화에 적합

컴포넌트와 화면 코드는 유지하고 `src/services/expenseRepository.ts` 내부를 Supabase/Firebase/API 구현으로 교체하는 방식으로 확장합니다.

## 향후 Dify 연동 계획

현재 `src/services/aiClassifier.ts`는 mock parser인 `parseExpenseText`를 호출합니다. 향후 Dify API를 연결해 소비 문장 분류, 카테고리 추론, 신뢰도 계산, 절약 코멘트 생성을 처리하고 실패 시 mock parser로 fallback할 수 있습니다.

## 향후 n8n Webhook 연동 계획

현재 `src/services/automationWebhook.ts`는 `VITE_N8N_WEBHOOK_URL` 기반으로 n8n Webhook 전송을 준비합니다. 새 소비 저장 시 예산 80% 도달, 예산 초과, 하루 50,000원 이상 소비 조건을 평가하고, URL이 없으면 payload를 콘솔에서 미리 볼 수 있습니다.

## n8n Slack 알림 payload

새 소비가 저장되면 SpendFlow는 n8n Webhook으로 `expense_created` payload를 1회 전송합니다. payload 안에는 기본 소비 요약용 `slack.summaryMessage`가 항상 포함되고, 위험 조건이 감지되면 `slack.riskMessage`가 함께 포함됩니다.

```json
{
  "app": "SpendFlow",
  "event": "expense_created",
  "hasRiskAlert": false,
  "alertType": null,
  "severity": "normal",
  "title": "💧 SpendFlow 소비 요약",
  "message": "소비 흐름이 안정적이에요.",
  "actionSuggestion": "현재 흐름은 안정적이에요. 오늘의 소비 기록을 기준으로 예산 수위를 계속 확인할게요.",
  "expense": {
    "amount": 6800,
    "category": "카페",
    "paymentMethod": "카드",
    "memo": "아이스라떼"
  },
  "summary": {
    "monthlyBudget": 500000,
    "monthlySpent": 260000,
    "remainingBudget": 240000,
    "usageRate": 52,
    "dailySpent": 6800
  },
  "slack": {
    "summaryMessage": {
      "text": "💧 SpendFlow 소비 요약 - 최근 소비 6,800원 · 카페 · 카드, 이번 달 260,000원 / 500,000원 (52%)",
      "blocks": [],
      "blocksJson": "[]"
    },
    "riskMessage": null
  },
  "createdAt": "2026-06-29T10:00:00.000Z"
}
```

위험 조건이 감지된 payload 예시는 아래와 같습니다.

```json
{
  "app": "SpendFlow",
  "event": "expense_created",
  "hasRiskAlert": true,
  "alertType": "budget_warning",
  "severity": "warning",
  "title": "⚠️ SpendFlow 위험 알림",
  "message": "이번 달 예산의 84%를 사용 중이에요.",
  "actionSuggestion": "이번 달 예산의 84%를 사용 중이에요. 이번 주에는 쇼핑 지출을 1~2회 줄이면 예산 안에서 관리하기 쉬워요.",
  "expense": {
    "amount": 42000,
    "category": "쇼핑",
    "paymentMethod": "간편결제",
    "memo": "생활용품"
  },
  "summary": {
    "monthlyBudget": 500000,
    "monthlySpent": 420000,
    "remainingBudget": 80000,
    "usageRate": 84,
    "dailySpent": 42000
  },
  "slack": {
    "summaryMessage": {
      "text": "💧 SpendFlow 소비 요약 - 최근 소비 42,000원 · 쇼핑 · 간편결제, 이번 달 420,000원 / 500,000원 (84%)",
      "blocks": [],
      "blocksJson": "[]"
    },
    "riskMessage": {
      "text": "⚠️ SpendFlow 위험 알림 - 예산 80%에 도달했어요. 이번 달 예산의 84%를 사용 중이에요.",
      "blocks": [],
      "blocksJson": "[]"
    }
  },
  "createdAt": "2026-06-29T10:05:00.000Z"
}
```

n8n 워크플로우 구조는 기존처럼 유지할 수 있습니다.

```txt
Webhook
├─ Slack: 기본 소비 요약 알림
└─ If: 위험 조건 확인
   ├─ true → Slack: 위험 소비 알림
   └─ false → 종료
```

기본 소비 요약 Slack 노드는 Webhook payload의 `slack.summaryMessage`를 사용합니다.

```txt
text: {{$json.body.slack.summaryMessage.text}}
blocks: {{$json.body.slack.summaryMessage.blocks}}
```

위험 소비 알림 Slack 노드는 If 노드에서 `hasRiskAlert === true`일 때만 실행하고, `slack.riskMessage`를 사용합니다.

```txt
text: {{$json.body.slack.riskMessage.text}}
blocks: {{$json.body.slack.riskMessage.blocks}}
```

If 조건은 `{{$json.body.hasRiskAlert}} is true`를 권장합니다. 또는 `{{$json.body.severity}} equals warning OR {{$json.body.severity}} equals danger`로 설정해도 됩니다.

n8n Slack 노드에서 `blocks` 배열을 직접 매핑하기 어렵다면 HTTP Request 노드로 Slack Incoming Webhook에 JSON을 POST합니다. Slack webhook URL이나 token은 코드에 하드코딩하지 말고 n8n credential 또는 환경변수로 관리합니다.

```json
{
  "text": "{{$json.body.slack.summaryMessage.text}}",
  "blocks": {{$json.body.slack.summaryMessage.blocksJson}}
}
```

## 확장 아이디어

- Gmail 결제 알림 메일 자동 수집
- 영수증 OCR
- Notion/Google Sheets 자동 리포트 저장
- Slack/Telegram 주간 리포트 발송
- 모바일 푸시 알림
- Supabase DB 연결
- 사용자 로그인
- 여러 기기 간 데이터 동기화
