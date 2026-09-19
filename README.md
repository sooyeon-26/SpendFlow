# SpendFlow

소비 내역과 월 예산을 물의 수위로 보여주는 모바일 우선 가계부입니다. 금액을 직접 기록하거나 `스타벅스 6800원 카드`처럼 문장으로 입력할 수 있습니다.

[배포된 데모 보기](https://spend-flow-eight.vercel.app/)

![SpendFlow 월 예산 사용률과 물 수위 화면](docs/preview.png)

## 문제

가계부의 숫자만 보고는 현재 소비 속도를 바로 체감하기 어려웠습니다. SpendFlow는 이번 달 지출을 수위로 표현하고, 예산에 가까워질수록 경고와 다음 행동을 함께 보여주도록 만들었습니다.

## 해결 방식

소비 입력을 `localStorage`에 저장하고 월 예산 사용률을 물의 높이와 상태 문구로 바꿨습니다. 위험 조건 계산과 알림 전송을 분리해 n8n을 설정하지 않아도 화면의 예산 판단은 독립적으로 동작합니다.

## 주요 기능

- 금액·카테고리·결제수단·메모를 직접 입력
- 문장에서 금액, 가맹점, 카테고리, 결제수단을 규칙으로 추출
- `localStorage`에 소비 내역 저장·수정·삭제
- 월·주·일 소비액과 카테고리별 비중 계산
- 월 예산 사용률을 물결 형태로 시각화
- 최근 7일 흐름, 반복 소비, 예산 위험 구간 요약
- 모바일 홈 화면 추가를 위한 PWA manifest와 safe area 대응
- 선택적으로 n8n에 소비 경고와 데일리 리포트 전달

문장 분류와 소비 코멘트는 외부 AI 모델을 호출하지 않습니다. 키워드와 금액 구간을 이용한 규칙 기반 기능입니다.

## 데이터 흐름

```text
입력 화면
  → Zustand store
  → expenseRepository
  → localStorage
  → 통계·경고 계산
  → 홈과 리포트 화면
```

자동화를 켠 경우에는 브라우저가 같은 출처의 서버 함수에 요청하고, 서버 함수가 n8n Webhook을 호출합니다. 실제 Webhook 주소는 브라우저 번들에 포함되지 않습니다.

```text
브라우저
  → /api/spend-alert 또는 /api/daily-report
  → 서버 환경변수의 n8n Webhook
```

## 기술 선택

| 구분 | 사용 기술 | 이유 |
| --- | --- | --- |
| UI | React, TypeScript, Tailwind CSS | 모바일 화면을 컴포넌트 단위로 구성 |
| 상태 | Zustand | 입력·내역·예산 상태를 가볍게 공유 |
| 저장 | localStorage | 로그인 없이 바로 사용할 수 있는 MVP 구성 |
| Build | Vite | 빠른 개발 서버와 정적 빌드 |
| Automation | Vercel Functions, n8n | 비밀 URL을 클라이언트에서 분리한 선택 기능 |
| Test | Vitest | 문장 파싱과 예산 경고 규칙 검증 |

## 구현하면서 신경 쓴 점

### 직접 입력이 기본 흐름

금액과 카테고리를 먼저 보이게 두고 문장 입력은 보조 기능으로 배치했습니다. 규칙 분류 결과는 저장 전에 사용자가 수정할 수 있습니다.

### 예산 경고의 기준을 코드로 분리

월 예산 80%, 예산 초과, 하루 5만 원 이상 사용을 각각 판정합니다. 화면용 문구와 자동화 payload가 같은 계산 결과를 사용하도록 유틸 함수로 분리했습니다.

### Webhook 주소를 공개하지 않기

`VITE_`로 시작하는 환경변수는 빌드 결과에 포함됩니다. 따라서 공개 설정에는 기능 활성화 여부만 두고, 실제 n8n 주소는 서버 전용 환경변수로 관리합니다.

## 로컬 실행

Node.js 20 이상이 필요합니다.

```bash
npm install
npm run dev
```

브라우저에서는 터미널에 표시된 `http://localhost:5173` 주소로 접속합니다. 같은 Wi-Fi의 휴대전화에서 확인하려면 출력된 Network 주소를 사용합니다.

## 테스트와 빌드

```bash
npm test
npm run build
npm audit --omit=dev
```

## 배포

- Production: [spend-flow-eight.vercel.app](https://spend-flow-eight.vercel.app/)
- Vite 정적 앱과 `/api/spend-alert`, `/api/daily-report` Vercel Functions를 함께 배포합니다.
- n8n 자동화는 기본적으로 꺼져 있으며 환경변수를 설정한 경우에만 동작합니다.
- 소비 데이터는 배포 서버가 아니라 사용 중인 브라우저의 `localStorage`에 남습니다.

## 선택 기능: n8n 자동화

자동화는 기본적으로 꺼져 있습니다. 배포 환경에 아래 값을 설정하면 서버 함수를 통해 전송됩니다.

```dotenv
VITE_ENABLE_SPEND_ALERTS=true
VITE_ENABLE_DAILY_REPORTS=true
N8N_SPEND_ALERT_WEBHOOK_URL=https://example.n8n.cloud/webhook/...
N8N_DAILY_REPORT_WEBHOOK_URL=https://example.n8n.cloud/webhook/...
```

`N8N_` 주소는 서버 환경변수로만 등록해야 하며 저장소나 `VITE_` 변수에 넣지 않습니다.

## 현재 한계

- 데이터가 한 브라우저의 `localStorage`에 저장되어 기기 간 동기화와 로그인은 지원하지 않습니다.
- 문장 입력은 정해진 키워드와 숫자 패턴을 이용하므로 새로운 상호명이나 복잡한 문장을 잘못 분류할 수 있습니다.
- PWA manifest는 포함되어 있지만 오프라인 캐시를 담당하는 service worker는 아직 없습니다.
- n8n 자동화는 배포 환경에 서버 함수와 환경변수를 설정한 경우에만 동작합니다.
- 자동화 서버 함수에는 사용자 인증과 요청 제한이 없으므로 공개 서비스에서는 기본 비활성 상태를 유지하거나 인증 계층을 추가해야 합니다.
