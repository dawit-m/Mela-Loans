import "dotenv/config";
import { run } from "@grammyjs/runner";
import { createBot } from "./bot/bot.js";

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error("BOT_TOKEN is not set in your .env file");
}

const bot = createBot(token);

// @grammyjs/runner processes updates concurrently instead of one at a time,
// so one user's slow request (e.g. a database query) doesn't make everyone
// else wait behind them.
const runner = run(bot);
console.log("Bot started (concurrent long polling via @grammyjs/runner)...");

// Graceful shutdown — stops the runner cleanly instead of dropping
// in-flight requests when the process is killed (Ctrl+C, deploy, etc.)
const stop = () => runner.isRunning() && runner.stop();
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
