import type { Bot } from "grammy";
import type { MyContext, Status, Language } from "./types.js";
import { prisma } from "../db/prisma.js";
import { findMatches } from "../services/matching.js";
import { t } from "./i18n.js";

export function registerAdminHandlers(bot: Bot<MyContext>) {
  bot.callbackQuery(/^approve_(\d+)$/, async (ctx) => {
    const sessionId = Number(ctx.match[1]);
    const session = await prisma.userSession.findUnique({ where: { id: sessionId } });

    if (!session) {
      await ctx.answerCallbackQuery({ text: "Session not found." });
      return;
    }

    // Guard against double-clicks / two admins approving the same
    // application at once — only act if it's still pending.
    if (session.paymentStatus !== "pending") {
      await ctx.answerCallbackQuery({
        text: `Already marked as ${session.paymentStatus}.`,
      });
      return;
    }

    await prisma.userSession.update({
      where: { id: sessionId },
      data: { paymentStatus: "approved" },
    });

    const matchResult = await findMatches({
      status: session.status as Status,
      monthlyIncome: session.monthlyIncome ? session.monthlyIncome.toNumber() : undefined,
      desiredAmountMin: session.desiredAmountMin.toNumber(),
      desiredAmountMax: session.desiredAmountMax.toNumber(),
    });

    const s = t(session.language as Language);
    const applicantName = session.fullName ?? "there";

    const sections = matchResult.institutions.map((inst) => {
      const productLines = inst.products
        .map((p) => {
          const rate = p.interestRate ? ` (${p.interestRate})` : "";
          const docs = p.requiredDocuments ? `\n     Docs: ${p.requiredDocuments}` : "";
          return `   - ${p.loanProductName}: ${p.amountMin}-${p.amountMax} Birr${rate}${docs}`;
        })
        .join("\n");
      const phone = inst.phone ? ` - ${inst.phone}` : "";
      return `${inst.institutionName} (${inst.institutionType})${phone}\n${productLines}`;
    });

    const resultMessage = `${s.approvedIntro(applicantName)}\n\n${sections.join("\n\n")}`;

    // Use the string form of the BigInt Telegram ID — safer than casting to
    // Number, and future-proof against ids that grow past safe integer range.
    try {
      await ctx.api.sendMessage(session.telegramUserId.toString(), resultMessage);
    } catch (err) {
      console.error(`Failed to notify user ${session.telegramUserId}:`, err);
      await ctx.answerCallbackQuery({
        text: "Approved, but couldn't message the user (they may have blocked the bot).",
      });
      return;
    }

    try {
      const existingCaption = ctx.callbackQuery.message?.caption ?? "";
      await ctx.editMessageCaption({
        caption: `${existingCaption}\n\n✅ Approved`,
      });
    } catch (err) {
      // The admin may have deleted the original message — not fatal, just log it.
      console.warn("Could not edit admin message caption:", err);
    }

    await ctx.answerCallbackQuery({ text: "Approved and sent to user." });
  });

  bot.callbackQuery(/^reject_(\d+)$/, async (ctx) => {
    const sessionId = Number(ctx.match[1]);
    const session = await prisma.userSession.findUnique({ where: { id: sessionId } });

    if (!session) {
      await ctx.answerCallbackQuery({ text: "Session not found." });
      return;
    }

    if (session.paymentStatus !== "pending") {
      await ctx.answerCallbackQuery({
        text: `Already marked as ${session.paymentStatus}.`,
      });
      return;
    }

    await prisma.userSession.update({
      where: { id: sessionId },
      data: { paymentStatus: "rejected" },
    });

    const s = t(session.language as Language);
    const applicantName = session.fullName ?? "there";

    try {
      await ctx.api.sendMessage(session.telegramUserId.toString(), s.rejected(applicantName));
    } catch (err) {
      console.error(`Failed to notify user ${session.telegramUserId}:`, err);
      await ctx.answerCallbackQuery({
        text: "Rejected, but couldn't message the user (they may have blocked the bot).",
      });
      return;
    }

    try {
      const existingCaption = ctx.callbackQuery.message?.caption ?? "";
      await ctx.editMessageCaption({
        caption: `${existingCaption}\n\n❌ Rejected`,
      });
    } catch (err) {
      console.warn("Could not edit admin message caption:", err);
    }

    await ctx.answerCallbackQuery({ text: "Rejected and user notified." });
  });
}
