# SpendFlow

SpendFlow는 개인 소비 데이터를 자동으로 입력, 분류, 분석하고 예산 위험 수위와 주간 소비 흐름을 보여주는 iPhone 14 Pro 최적화 모바일 웹앱/PWA입니다.

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
- 모바일 토스트, 하단 탭바, 큰 원형 추가 버튼
- PWA 기본 manifest와 iPhone 메타 태그

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
→ notifyExpenseCreated(expense)
→ n8n Webhook
→ 예산 위험 알림 / 주간 리포트 자동화
```

## 기술 스택

- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- Recharts
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

## iPhone PWA 캡처 방법

주소창 없는 앱 화면으로 테스트하거나 캡처하려면 아래 순서로 진행합니다.

1. iPhone Safari에서 Vite Network 주소를 엽니다.
2. Safari 하단 공유 버튼을 누릅니다.
3. “홈 화면에 추가”를 선택합니다.
4. 홈 화면에 추가된 SpendFlow 아이콘으로 앱을 실행합니다.
5. 주소창 없는 standalone 화면에서 레이아웃, safe area, 스크롤, 캡처 상태를 확인합니다.

## localStorage 사용 이유

이번 MVP는 백엔드 없이 실제 iPhone Safari에서 빠르게 소비 입력, 저장, 삭제, 분석, 리포트 기능을 검증하기 위해 `localStorage`를 사용합니다. 저장 key는 `spendflow_expenses`입니다.

## 향후 DB 확장 계획

- Supabase: 사용자 로그인, 소비 데이터 저장, n8n 연동에 적합
- Firebase: 빠른 모바일 앱 프로토타입과 여러 기기 동기화에 적합

컴포넌트와 화면 코드는 유지하고 `src/services/expenseRepository.ts` 내부를 Supabase/Firebase/API 구현으로 교체하는 방식으로 확장합니다.

## 향후 Dify 연동 계획

현재 `src/services/aiClassifier.ts`는 mock parser인 `parseExpenseText`를 호출합니다. 향후 Dify API를 연결해 소비 문장 분류, 카테고리 추론, 신뢰도 계산, 절약 코멘트 생성을 처리하고 실패 시 mock parser로 fallback할 수 있습니다.

## 향후 n8n Webhook 연동 계획

현재 `src/services/automationWebhook.ts`는 no-op입니다. 향후 새 소비 저장 시 n8n Webhook을 호출해 예산 위험 수위 알림, 주간 리포트 자동 생성, Notion/Google Sheets 저장, Slack/Telegram/Email 알림을 연결할 수 있습니다.

## 확장 아이디어

- Gmail 결제 알림 메일 자동 수집
- 영수증 OCR
- Notion/Google Sheets 자동 리포트 저장
- Slack/Telegram 주간 리포트 발송
- 모바일 푸시 알림
- Supabase DB 연결
- 사용자 로그인
- 여러 기기 간 데이터 동기화
