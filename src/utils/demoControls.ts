const portfolioOrigin = "https://sooyeon-developer-portfolio.vercel.app";

export function isDemoResetMessage(event: MessageEvent, parent: Window, allowLocal = false) {
  const trustedOrigin = event.origin === portfolioOrigin ||
    (allowLocal && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(event.origin));
  return trustedOrigin && event.source === parent && event.data?.type === "spendflow:reset-demo";
}
