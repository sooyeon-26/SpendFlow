**Findings**
- No actionable P0/P1/P2 issues found.

**Source Visual Truth**
- Source: conversation-provided mobile water UI references for glass cards, large numeric hierarchy, soft blue gradient, water level progress, circular add button, and lower record-card structure.
- Notes: The references are not filesystem assets; they were inspected from the prompt. SpendFlow intentionally omits cute character/health-drink cues and applies the water metaphor to budget data.

**Implementation Screenshot**
- Path: `/tmp/spendflow-home-polish.png`
- Viewport: 393 x 852
- State: Home tab, seeded mock expenses, monthly budget usage at 66%, polished header and hierarchy.

**Full-View Comparison Evidence**
- The implementation preserves the main reference hierarchy: light blue/white background, translucent rounded cards, large centered percentage, water-fill card treatment, and bottom mobile tabbar.
- The Home first viewport now centers the main budget level card. Summary, recent flow, and insight cards start below the first viewport and are reached by scroll.
- The header no longer shows the right-side wave button, leaving the top area calmer and more app-like.
- The app-specific finance copy is visible and not mixed with prompt instructions.

**Focused Region Comparison Evidence**
- Budget card: large central numeric treatment and water-level fill match the desired reference direction, with readable navy foreground text. The water surface sits near the 66% level, making top air and bottom water visually distinct.
- Budget copy: percentage remains dominant, with `329,050원 사용` as the main amount and `전체 예산 500,000원 중` as secondary context.
- Budget interaction: pointer simulation produced one ripple on touch, wave CSS variables changed during drag (`--wave-x: 6.4px`, `--wave-y: 2.5px`), then returned to `0px` on release.
- Bottom controls: fixed tabbar remains visible and avoids the iPhone safe-area bottom. The floating center add button has been removed per the latest request.
- Input: automation flow glass card appears below the input card, and the automatic preview card scrolls into view after parsing.
- History: category chips show counts; expense category badges use restrained pastel category colors; delete button is visually quieter while preserving tap target size.
- Report: weekly change copy is softer, risk budget details are split across lines, and a `다음 액션` card is present below the insight section.

**Required Fidelity Surfaces**
- Fonts and typography: system/Pretendard-style stack, strong display weight for numeric hierarchy, no negative letter spacing, readable Korean UI copy.
- Spacing and layout rhythm: 393px app frame, compact header, hero card height around 545px, details section begins below the first viewport, fixed bottom tabbar with content padding.
- Colors and visual tokens: light aqua/white gradients, navy text, restrained mint/aqua accents, warning/danger states for budget thresholds.
- Image quality and asset fidelity: no decorative character art; water visuals are implemented as CSS/SVG UI surfaces appropriate for a data app. PWA icon is a simple generated-compatible vector asset for installation metadata.
- Copy and content: SpendFlow-specific finance automation copy is used throughout; health/water-intake language is avoided.

**Patches Made Since Previous QA Pass**
- Removed the right-side header wave icon button.
- Refined BudgetLevelCard information hierarchy and amount labeling.
- Added Input automation flow guidance and strengthened the automatic classification preview card.
- Added category counts to History chips, pastel category badges, and a quieter delete affordance.
- Added Report next-action recommendation card and softened weekly increase copy.
- Added iPhone standalone PWA capture instructions to README.

**Implementation Checklist**
- Build passes with `npm run build`.
- Home screen renders at 393 x 852 with the main budget card as the first-screen focus.
- DOM check: `.home-details` begins around 676px and document max scroll is 468px, so summary and chart content are available below the hero.
- Pointer check: ripple appears on pointer down, wave offset follows drag, and offset returns to zero after pointer up.
- Screenshot checks: `/tmp/spendflow-input-preview-final.png`, `/tmp/spendflow-history-polish.png`, and `/tmp/spendflow-report-polish.png` confirm the new Input, History, and Report polish at 393 x 852.
- PWA manifest and iPhone meta tags are present.
- Dev server runs at `http://localhost:5173/` and `http://192.168.0.173:5173/`.

**Follow-up Polish**
- On a real iPhone, tune the subtle wave offset intensity if it feels too quiet or too responsive in Safari.

final result: passed
