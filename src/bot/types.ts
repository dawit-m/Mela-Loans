import type { Context, SessionFlavor } from "grammy";
import type { Conversation, ConversationFlavor } from "@grammyjs/conversations";

export type Language = "en" | "am";
export type Status = "employed" | "student" | "unemployed" | "business";

// Data we keep in grammy's session (persists between messages for a user)
export interface SessionData {
  language: Language;
}

// The full context type: base grammy Context + session + conversations plugin
// Used everywhere OUTSIDE conversation functions (bot.use, command handlers, etc.)
export type MyContext = ConversationFlavor<Context & SessionFlavor<SessionData>>;

// The type used INSIDE conversation functions (see loanApplication.ts).
// Per grammy's design, this must be a plain Context — it must NOT carry
// SessionFlavor. To touch session data inside a conversation, use
// conversation.external((outsideCtx) => { ... }) instead.
export type MyConversation = Conversation<MyContext, Context>;

// What we collect from the user by the end of the questionnaire
export interface LoanApplicationAnswers {
  language: Language;
  fullName: string;
  status: Status;
  monthlyIncome?: number;
  desiredAmountMin: number;
  desiredAmountMax: number;
}
