import { Bot, session } from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";
import { PrismaAdapter } from "@grammyjs/storage-prisma";
import type { MyContext, SessionData } from "./types.js";
import { loanApplication } from "./conversations/loanApplication.js";
import { registerAdminHandlers } from "./adminHandlers.js";
import { prisma } from "../db/prisma.js";

export function createBot(token: string): Bot<MyContext> {
  const bot = new Bot<MyContext>(token);

  // Session must come before the conversations plugin.
  // Using a Prisma-backed adapter instead of the default in-memory store —
  // this way, active conversations survive a server restart/redeploy
  // instead of being silently lost for anyone mid-questionnaire.
  bot.use(
    session({
      initial: (): SessionData => ({ language: "en" }),
      storage: new PrismaAdapter(prisma.session),
    })
  );
  bot.use(conversations());

  // Register the questionnaire as a named conversation
  bot.use(createConversation(loanApplication));

  // Handle admin Approve/Reject button clicks (independent of any conversation)
  registerAdminHandlers(bot);

  bot.command("start", async (ctx) => {
    // If the user is already mid-conversation (e.g. they send /start again
    // halfway through the questionnaire), exit first — entering an already
    // active conversation throws otherwise.
    await ctx.conversation.exit("loanApplication");
    await ctx.conversation.enter("loanApplication");
  });

  bot.catch((err) => {
    console.error("Bot error:", err);
  });

  return bot;
}
