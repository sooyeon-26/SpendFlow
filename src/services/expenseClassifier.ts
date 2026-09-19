import type { ParsedExpenseResult } from "../types/expense";
import { parseExpenseText } from "../utils/parseExpenseText";

export async function classifyExpenseText(text: string): Promise<ParsedExpenseResult> {
  return parseExpenseText(text);
}
