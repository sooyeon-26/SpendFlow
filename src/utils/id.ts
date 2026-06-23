export function createExpenseId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `expense-${timestamp}-${random}`;
}

