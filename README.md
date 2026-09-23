# SpendFlow

A mobile-first expense tracker with local storage, rule-based text entry, and a water-level budget display.

[Demo](https://spend-flow-eight.vercel.app/?demo=1) · [Portfolio](https://sooyeon-developer-portfolio.vercel.app/)

The demo opens directly at **26%** (KRW 130,000 spent out of a KRW 500,000 budget), with ten sample expenses. Demo edits and resets use separate browser storage and never send automation webhooks. Existing personal records are preserved; use **내 기록 보기** to return to them. Sample dates refresh when the month changes or the demo is reset.

Desktop previews keep a proportional 393×852 viewport across browser zoom changes. The portfolio uses `?view=embed&demo=1` to avoid a second device frame; `view=app` opens the borderless app layout.

## Overview

Expense totals can be difficult to relate to a monthly budget at a glance. SpendFlow shows budget usage as a rising water level and pairs spending summaries with budget alerts. Users can log an expense directly or fill the form from a short Korean phrase such as `스타벅스 6800원 카드`.

## Features

- Add, edit, and delete expenses with an amount, category, payment method, and memo.
- Extract amounts, merchants, categories, and payment methods from text using keyword and number rules.
- Store expenses in the current browser's `localStorage` without an account.
- Summarize daily, weekly, and monthly spending and category totals.
- Visualize monthly budget usage as a water level and show recent spending patterns.
- Calculate budget warnings at 80% usage, budget-limit alerts at 100%, and daily spending alerts from KRW 50,000.
- Include a web app manifest and mobile safe-area styling.
- Optionally forward expense events and daily report payloads to n8n through server functions.

Text parsing and spending comments do not call an external AI model.

## Tech Stack

| Layer | Technologies | Purpose |
| --- | --- | --- |
| UI | React, TypeScript, Tailwind CSS | Mobile screens and budget visualization |
| State | Zustand | Expense, budget, and navigation state |
| Persistence | localStorage | Expense storage in one browser |
| Build | Vite | Development server and production build |
| Optional automation | Vercel Functions, n8n webhooks | Forward events without exposing webhook URLs in the client |
| Tests | Vitest | Parsing, alerts, demo isolation, and reporting-date boundaries |

## Architecture

```text
Expense form → Zustand store → expenseRepository → localStorage
                     ↓
              Spending calculations → Home and report screens

Optional: Browser → /api/spend-alert or /api/daily-report → n8n webhook
```

Expense persistence is separated from UI state through a repository module. Alert calculations are separate from delivery, so the budget display works with automation disabled. Webhook URLs are read by server functions and are not bundled into the frontend.

Code entry points:

- [Expense store](src/store/expenseStore.ts) and [persistence interface](src/services/expenseRepository.ts)
- [Rule-based text parsing](src/utils/parseExpenseText.ts)
- [Budget and daily alert calculations](src/utils/spendAlerts.ts)
- [Expense webhook function](api/spend-alert.js) and [daily report function](api/daily-report.js)

## Getting Started

Use Node.js 22.12+.

```bash
npm ci
npm run dev
```

Open the address printed by Vite, normally `http://localhost:5173`. The core expense-tracking flow works without environment variables or a backend. The monthly budget starts from [the default budget configuration](src/data/defaultBudget.ts).

## Checks

```bash
npm test
npm run build
```

Tests cover text parsing and spending-alert logic. The build runs TypeScript checks before generating the static app.

## Optional Automation

Automation is disabled by default. On a deployment that serves the `api/` Vercel Functions, configure:

```dotenv
VITE_ENABLE_SPEND_ALERTS=true
VITE_ENABLE_DAILY_REPORTS=true
N8N_SPEND_ALERT_WEBHOOK_URL=https://example.n8n.cloud/webhook/...
N8N_DAILY_REPORT_WEBHOOK_URL=https://example.n8n.cloud/webhook/...
```

The `VITE_` flags are build-time frontend settings. Set the `N8N_` URLs only in server environment variables; never prefix webhook URLs with `VITE_` or commit real values. Vite's development server alone does not serve the `api/` functions. The repository includes the integration code, not a hosted n8n instance.

The functions currently have no user authentication or rate limiting. Keep automation disabled on a public deployment unless an appropriate access-control layer is provided. Expense data remains in localStorage; enabling automation sends the configured event/report payloads to the webhook.

See [the daily report integration notes](docs/n8n-daily-report.md) for the existing payload documentation.

## Screenshots

![SpendFlow monthly budget usage and water-level display](docs/preview.png)

## Limitations

- Expenses are stored in one browser; there is no account login or cross-device sync.
- Text entry uses fixed keyword rules and may misclassify unfamiliar merchants or complex phrases.
- A web app manifest is included, but there is no service worker for offline caching.
- n8n delivery requires configured server functions, environment variables, and an external workflow.

## Links

[Demo](https://spend-flow-eight.vercel.app/) · [Portfolio](https://sooyeon-developer-portfolio.vercel.app/)
