import { InlineKeyboard } from "grammy";
import type { Language } from "./types.js";
import { t } from "./i18n.js";

export const languageKeyboard = new InlineKeyboard()
  .text("English", "lang_en")
  .text("አማርኛ", "lang_am");

export function statusKeyboard(language: Language) {
  const s = t(language);
  return new InlineKeyboard()
    .text(s.statusEmployed, "status_employed")
    .text(s.statusStudent, "status_student")
    .row()
    .text(s.statusUnemployed, "status_unemployed")
    .text(s.statusBusiness, "status_business");
}

// Amount ranges in Birr — values encode min/max directly in the callback data
export const AMOUNT_RANGES = [
  { label: "5k - 10k", min: 5_000, max: 10_000 },
  { label: "10k - 50k", min: 10_000, max: 50_000 },
  { label: "50k - 100k", min: 50_000, max: 100_000 },
  { label: "100k - 500k", min: 100_000, max: 500_000 },
  { label: "500k - 1M", min: 500_000, max: 1_000_000 },
] as const;

export const amountKeyboard = (() => {
  const kb = new InlineKeyboard();
  AMOUNT_RANGES.forEach((range, i) => {
    kb.text(range.label, `amount_${i}`);
    if (i % 2 === 1) kb.row(); // two buttons per row
  });
  return kb;
})();

export function adminApprovalKeyboard(sessionId: number) {
  return new InlineKeyboard()
    .text("✅ Approve", `approve_${sessionId}`)
    .text("❌ Reject", `reject_${sessionId}`);
}
