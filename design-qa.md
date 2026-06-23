**Findings**
- No actionable P0/P1/P2 issues found.

**Source Visual Truth**
- Source: conversation-provided mobile water UI references for glass cards, large numeric hierarchy, soft blue gradient, water level progress, circular add button, and lower record-card structure.
- Notes: The references are not filesystem assets; they were inspected from the prompt. SpendFlow intentionally omits cute character/health-drink cues and applies the water metaphor to budget data.

**Implementation Screenshot**
- Path: `/tmp/spendflow-home-gesture-zones.png`
- Viewport: 393 x 852
- State: Home tab, seeded mock expenses, monthly budget usage at 66%, full-screen water scene hero.
- PWA verification screenshot: `/tmp/spendflow-report-pwa-card.png`
- PWA verification state: Report tab scrolled near the bottom, non-standalone browser mode, install guidance card visible.

**Full-View Comparison Evidence**
- The implementation now treats the Home first viewport as one continuous water-level scene rather than a dashboard card.
- The large `SpendFlow` title is not rendered on Home; DOM check found no `h1` on the Home tab.
- Home details are separated below the full-screen water scene. The water scene captures water gestures, while the floating bottom handle is the explicit scroll affordance into details.
- The app-specific finance copy is visible and not mixed with prompt instructions.

**Focused Region Comparison Evidence**
- Budget hero: card border, white box treatment, and drop shadow are removed; the water fill spans the full hero surface.
- Water level: at 66%, the lower portion of the Home hero is filled with aqua/mint water and a soft surface line sits above center, making top air and lower water distinct.
- Wave layers: the hero water now uses a Canvas 2D simulation with back, mid, and front drawn water fills, a live surface line, subtle underwater refraction lines, and damped ripple rings.
- Budget copy: percentage remains dominant, with `329,050원 사용` as the main amount and `전체 예산 500,000원 중` as secondary context.
- Gesture zoning: the water scene has `touch-action: none` and handles pointer down/move with `preventDefault`, while the floating `자세한 소비 흐름 보기` handle is outside the water scene with `touch-action: pan-y`.
- Budget interaction: pointer/touch coordinates inject impulses into the Canvas water simulation. The surface array propagates pressure through neighboring points, adds velocity-based force on drag, and damps naturally after release.
- Touch verification: touch drag on the water kept `scrollY` at 0; touch drag on the bottom handle scrolled to `scrollY` 201, confirming the water and page-scroll zones are separated.
- Scroll handle verification: `자세한 소비 흐름 보기` is a real `button`; click calls `scrollIntoView({ behavior: "smooth", block: "start" })` on the detail section. In browser verification, scroll moved from 0 to 599 and the details section landed above the fixed tabbar.
- Idle visual update: the caustic/reflection layer is lowered to `opacity: 0.1`, uses `mix-blend-mode: soft-light`, has 18-24s drift cycles, and the Canvas idle wave/refraction strokes are reduced so the main percentage and amount remain visually dominant.
- Bottom controls: fixed tabbar remains visible and avoids the iPhone safe-area bottom. The floating center add button has been removed per the latest request.
- Input: automation flow glass card appears below the input card, and the automatic preview card scrolls into view after parsing.
- History: category chips show counts; expense category badges use restrained pastel category colors; delete button is visually quieter while preserving tap target size.
- Report: weekly change copy is softer, risk budget details are split across lines, and a `다음 액션` card is present below the insight section.

**Required Fidelity Surfaces**
- Fonts and typography: system/Pretendard-style stack, strong display weight for numeric hierarchy, no negative letter spacing, readable Korean UI copy.
- Spacing and layout rhythm: 393px app frame, Home hero starts at the top of the viewport, measures 681px high in the test viewport, and details begin immediately below it.
- Colors and visual tokens: light aqua/white gradients, navy text, restrained mint/aqua accents, warning/danger states for budget thresholds.
- Image quality and asset fidelity: no decorative character art; water visuals are implemented as CSS/SVG UI surfaces appropriate for a data app. PWA icons are generated PNG assets with aqua/blue gradient and simple wave lines, without money symbols or water-intake cues.
- Copy and content: SpendFlow-specific finance automation copy is used throughout; health/water-intake language is avoided.

**Patches Made Since Previous QA Pass**
- Replaced the SVG wave-path implementation with a Canvas 2D ripple simulation in `WaveProgress`.
- Added an imperative `disturb`/`release` API so pointer events inject impulses without React state re-rendering the water every frame.
- Reintroduced the lower Home detail section and added a floating scroll handle above the tabbar, outside the `touch-action: none` water scene.
- Kept text/content fixed in a separate layer while Canvas draws only the background water, surface, highlights, and ripple rings.
- Converted the scroll handle from a decorative div into an accessible button wired to the Home details ref.
- Reduced idle Canvas energy, surface-line opacity/width, refraction stroke alpha, and caustic movement so strong water motion only appears after user interaction.

**PWA 2단계 Verification**
- `public/manifest.json` includes `display: standalone`, `orientation: portrait`, `/` start/scope, water-tone theme/background colors, and PNG icon entries for 192px, 512px, and maskable 512px.
- `index.html` contains a single viewport meta with `viewport-fit=cover`, iPhone standalone meta tags, theme color, manifest link, and Apple touch icon link.
- App icons exist at `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/maskable-512.png`, and `public/icons/apple-touch-icon.png`; file inspection confirmed 192x192, 512x512, 512x512, and 180x180 PNG dimensions.
- Safe-area handling uses `100dvh`, `env(safe-area-inset-top)`, and `env(safe-area-inset-bottom)` for the shell, screen content, Home hero, and fixed bottom tabs.
- Report tab includes a compact `앱처럼 사용하기` glass card in non-standalone mode and hides it when `isStandalonePWA()` detects standalone mode.
- `src/utils/pwa.ts` supports both standard `display-mode: standalone` and iOS `navigator.standalone` checks.
- Dev script is `vite --host 0.0.0.0`, and README documents local network, tunnel, home-screen-add, standalone capture, and PWA file structure instructions.
- localStorage remains behind `src/services/expenseRepository.ts` with the existing `spendflow_expenses` key; no component-level storage access was added.
- Backend integrations remain future-facing documentation only; no Supabase, Firebase, Dify, or n8n network connection was introduced.
- iOS overscroll hardening: `html`, `body`, `#root`, `.page-shell`, and the Home phone frame share the same water gradient background so rubber-band pull does not reveal a mismatched color. The water scene is `100dvh`; scroll is exposed through the lower handle/details section.

**Implementation Checklist**
- Build passes with `npm run build`.
- Home screen renders at 393 x 852 as a full water-level scene with no large `SpendFlow` title.
- Home gesture-zone DOM check: `.wave-canvas` exists, `.home-scroll-handle` parent is `.home-screen`, `.home-hero` and `.budget-card` have `touch-action: none`, `.home-scroll-handle` has `touch-action: pan-y`, and document max scroll is 599.
- Pointer checks:
  - Touch drag on the water scene kept `scrollY` at 0.
  - Touch drag on the scroll handle moved to `scrollY` 201.
  - Canvas rendering stays inside `.wave-canvas`; no water-level DOM transform is used for interaction.
- Scroll button check:
  - `.home-scroll-handle` tag is `BUTTON`.
  - Before click: `scrollY` 0 and details top 765.
  - After click: `scrollY` 599 and details top 166, with `scroll-margin-top: 14px`.
- Screenshot check: `/tmp/spendflow-canvas-water-handle.png` confirms the Canvas water scene, fixed text, bottom scroll handle, and fixed tabbar are visually separated.
- Idle screenshot check: `/tmp/spendflow-quiet-idle-home.png` confirms the idle scene is visually calmer, with caustic effects no longer competing with the main number.
- PWA manifest and iPhone meta tags are present.
- Dev server HTTP check returned 200 for `/manifest.json` and `/icons/icon-192.png` on `localhost:5174`.
- Browser check on the Report tab found the PWA install card visible in non-standalone mode.
- Dev server runs at `http://localhost:5173/` and `http://192.168.0.173:5173/`.

**Follow-up Polish**
- On a real iPhone, tune the subtle wave offset intensity if it feels too quiet or too responsive in Safari.

final result: passed
