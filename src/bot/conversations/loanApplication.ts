import type { Context } from "grammy";
import type { MyConversation, Language, Status } from "../types.js";
import { t } from "../i18n.js";
import {
  languageKeyboard,
  statusKeyboard,
  amountKeyboard,
  adminApprovalKeyboard,
  AMOUNT_RANGES,
} from "../keyboards.js";
import { prisma } from "../../db/prisma.js";
import { findMatches } from "../../services/matching.js";

export async function loanApplication(
  conversation: MyConversation,
  ctx: Context
) {
  // ---- 1. Language ----
  await ctx.reply(
    "Welcome! Please choose your language.\nእንኳን በደህና መጡ! እባክዎ ቋንቋ ይምረጡ።",
    { reply_markup: languageKeyboard }
  );
  const langCtx = await conversation.waitForCallbackQuery([
    "lang_en",
    "lang_am",
  ]);
  const language: Language = langCtx.callbackQuery.data === "lang_am" ? "am" : "en";
  await langCtx.answerCallbackQuery();

  // Persist the language choice in session so future messages can use it too.
  // Note: inside a conversation, ctx.session isn't available directly — you
  // must use the ctx that conversation.external() passes into its callback.
  await conversation.external((extCtx) => {
    extCtx.session.language = language;
  });

  const s = t(language);

  // ---- 2. Name ----
  await ctx.reply(s.askName);
  const nameCtx = await conversation.waitFor("message:text");
  const fullName = nameCtx.message.text.trim();

  // ---- 3. Status ----
  await ctx.reply(s.askStatus, { reply_markup: statusKeyboard(language) });
  const statusCtx = await conversation.waitForCallbackQuery([
    "status_employed",
    "status_student",
    "status_unemployed",
    "status_business",
  ]);
  const status = statusCtx.callbackQuery.data.replace("status_", "") as Status;
  await statusCtx.answerCallbackQuery();

  // ---- 4. Income (only if employed) ----
  let monthlyIncome: number | undefined;
  if (status === "employed") {
    let validIncome = false;
    while (!validIncome) {
      await ctx.reply(s.askIncome);
      const incomeCtx = await conversation.waitFor("message:text");
      const cleaned = incomeCtx.message.text.replace(/[^0-9.]/g, "");
const parsed = Number(cleaned);
      if (Number.isFinite(parsed) && parsed > 0) {
        monthlyIncome = parsed;
        validIncome = true;
      } else {
        await ctx.reply(s.invalidIncome);
      }
    }
  }

  // ---- 5. Desired loan amount ----
  await ctx.reply(s.askAmount, { reply_markup: amountKeyboard });
  const amountCtx = await conversation.waitForCallbackQuery(
    AMOUNT_RANGES.map((_, i) => `amount_${i}`)
  );
  const rangeIndex = Number(amountCtx.callbackQuery.data.replace("amount_", ""));
  const chosenRange = AMOUNT_RANGES[rangeIndex]!;
  await amountCtx.answerCallbackQuery();

  // ---- Save to database ----
  // Return only the primitive id (safe to clone) — not the full Prisma
  // record, which contains non-cloneable Decimal instances.
  const sessionId = await conversation.external(async () => {
    const created = await prisma.userSession.create({
      data: {
        telegramUserId: BigInt(ctx.from!.id),
        language,
        fullName,
        status,
        monthlyIncome: monthlyIncome ?? null,
        desiredAmountMin: chosenRange.min,
        desiredAmountMax: chosenRange.max,
      },
    });
    return created.id;
  });

  // ---- Find matching institutions ----
  const matchResult = await conversation.external(() =>
    findMatches({
      status,
      monthlyIncome,
      desiredAmountMin: chosenRange.min,
      desiredAmountMax: chosenRange.max,
    })
  );

  const totalMatches = matchResult.bankCount + matchResult.microfinanceCount;

  if (totalMatches === 0) {
    await ctx.reply(s.noMatches(fullName));
    return;
  }

  // ---- Show match count + payment instructions ----
  const feeBirr = Number(process.env.LOAN_INFO_FEE_BIRR ?? "50");
  const telebirrNumber = process.env.TELEBIRR_NUMBER ?? "0900000000";
  const cbeAccount = process.env.CBE_ACCOUNT_NUMBER ?? "1000000000000";

  await ctx.reply(
    s.matchesFound(fullName, matchResult.bankCount, matchResult.microfinanceCount, feeBirr)
  );
  await ctx.reply(s.paymentInstructions(telebirrNumber, cbeAccount));

  // ---- Wait for payment screenshot ----
let screenshotFileId: string | undefined;
let screenshotIsPhoto = true; // false when it's a document (image file or PDF)
while (!screenshotFileId) {
  const msgCtx = await conversation.waitFor("message");
  const msg = msgCtx.message;
  if (msg.photo) {
    // Telegram sends multiple resolutions — take the largest (last) one
    screenshotFileId = msg.photo.at(-1)!.file_id;
    screenshotIsPhoto = true;
  } else if (
    msg.document &&
    (msg.document.mime_type?.startsWith("image/") ||
      msg.document.mime_type === "application/pdf")
  ) {
    // User sent the receipt as a file attachment — either an image sent
    // uncompressed, or a PDF (common for bank-issued receipts).
    screenshotFileId = msg.document.file_id;
    screenshotIsPhoto = false;
  } else {
    await ctx.reply(s.invalidScreenshot);
  }
}

  await conversation.external(async () => {
    await prisma.userSession.update({
      where: { id: sessionId },
      data: { paymentScreenshotFileId: screenshotFileId },
    });
  });

  // ---- Forward to admin for approval ----
  const adminChatId = process.env.ADMIN_CHAT_ID;
  if (adminChatId) {
    const caption =
      `New loan application awaiting approval\n\n` +
      `Name: ${fullName}\n` +
      `Status: ${status}\n` +
      `Income: ${monthlyIncome ?? "N/A"}\n` +
      `Desired amount: ${chosenRange.min}-${chosenRange.max} Birr\n` +
      `Matches: ${matchResult.bankCount} bank(s), ${matchResult.microfinanceCount} microfinance(s)\n\n` +
      `Session ID: ${sessionId}`;

    // Wrapped in external() — this is a side effect (sending a real Telegram
    // message) and must not be allowed to re-run during conversation replay.
    await conversation.external(async () => {
  if (screenshotIsPhoto) {
    await ctx.api.sendPhoto(Number(adminChatId), screenshotFileId!, {
      caption,
      reply_markup: adminApprovalKeyboard(sessionId),
    });
  } else {
    // PDFs and other documents can't be sent via sendPhoto
    await ctx.api.sendDocument(Number(adminChatId), screenshotFileId!, {
      caption,
      reply_markup: adminApprovalKeyboard(sessionId),
    });
  }
});
  } else {
    console.warn(
      "ADMIN_CHAT_ID is not set — this application will not be sent for approval."
    );
  }

  await ctx.reply(s.screenshotReceived(fullName));
  // Admin approval + revealing the actual matched loan list is the next
  // development step.
}
