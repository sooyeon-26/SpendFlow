# Prototype Instructions

Run the local server yourself and open the preview in the in-app browser. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## SpendFlow prototype decisions

- First-run onboarding should render before the existing app shell and must not change the Home screen, water-level interaction, analysis cards, or bottom navigation. Completion is stored with `spendflow_onboarding_seen` in localStorage.
- Home screen should not show raw automation payload previews or n8n test panels in the user-facing prototype; keep automation evidence in the external n8n/Slack workflow.
- Input screen should prioritize button-based quick expense logging: amount first, category pills, payment-method pills, optional memo, and save. Natural-language/mock AI input should remain as a secondary helper that fills the quick form, not the main value proposition.
- Portfolio recording on desktop should center the prototype in a 393px x 852px iPhone 14 Pro frame with enough outer canvas padding for browser capture.
- The desktop demo and portfolio embed should behave like a mobile viewport: only the app content scrolls, navigation stays at the bottom of the device, and onboarding uses the same frame. Fit the frame to shorter desktop windows; on mobile and narrow iframe viewports, use the available screen without a second device border.
- Keep the bezel thin (3px). When fitting a desktop device preview, scale the complete 393×852 screen, including typography and controls, rather than narrowing the layout with unchanged font sizes.
