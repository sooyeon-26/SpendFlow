import { expect, it } from "vitest";
import { isDemoResetMessage } from "./demoControls";

const parent = {} as Window;
const message = (overrides: Partial<MessageEvent> = {}) => ({
  source: parent,
  origin: "https://sooyeon-developer-portfolio.vercel.app",
  data: { type: "spendflow:reset-demo" },
  ...overrides,
}) as MessageEvent;

it("accepts reset only from the portfolio parent and with the expected command", () => {
  expect(isDemoResetMessage(message(), parent)).toBe(true);
  expect(isDemoResetMessage(message({ source: {} as Window }), parent)).toBe(false);
  expect(isDemoResetMessage(message({ origin: "https://example.com" }), parent)).toBe(false);
  expect(isDemoResetMessage(message({ data: null }), parent)).toBe(false);
  expect(isDemoResetMessage(message({ data: { type: "reset-personal" } }), parent)).toBe(false);
});

it("allows local preview controls only in development", () => {
  const local = message({ origin: "http://127.0.0.1:5182" });
  expect(isDemoResetMessage(local, parent)).toBe(false);
  expect(isDemoResetMessage(local, parent, true)).toBe(true);
  expect(isDemoResetMessage(message({ origin: "http://localhost.evil.com:5182" }), parent, true)).toBe(false);
});
