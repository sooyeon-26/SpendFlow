import { describe, expect, it } from "vitest";

import { parseExpenseText } from "./parseExpenseText";

describe("parseExpenseText", () => {
  it("금액, 가맹점, 카테고리와 결제수단을 규칙으로 분리한다", () => {
    const result = parseExpenseText("스타벅스 6,800원 카드");

    expect(result.amount).toBe(6800);
    expect(result.merchant).toBe("스타벅스");
    expect(result.category).toBe("카페");
    expect(result.paymentMethod).toBe("카드");
    expect(result.source).toBe("rule-based");
  });

  it("금액을 찾지 못하면 검토가 필요한 기본값을 반환한다", () => {
    const result = parseExpenseText("친구와 저녁");

    expect(result.amount).toBe(0);
    expect(result.category).toBe("기타");
    expect(result.paymentMethod).toBe("카드");
    expect(result.needsReview).toBe(true);
  });
});
