# Telegram Loan Matching Bot

A Telegram bot that helps people in Ethiopia find loan products they actually
qualify for. Users answer a short questionnaire (employment status, income,
desired loan amount), and the bot matches them against a database of real
bank and microfinance loan products — surfacing interest rates, tenure,
collateral requirements, and required documents for each match.

> Built as a real product for an active small business, not a tutorial
> project — this repo showcases the engineering behind it. Some
> business-specific values (bot token, admin chat ID, payment account
> numbers, and the underlying loan database) are intentionally excluded;
> see [Environment Variables](#environment-variables).

## Features

- 🌐 **Bilingual** — full English and Amharic support
- 💬 **Conversational flow** — step-by-step questionnaire built with grammY's
  [`conversations`](https://grammy.dev/plugins/conversations) plugin
- 🎯 **Matching engine** — overlap-based amount matching, income eligibility
  checks, and status-based filtering against a relational loan product
  database
- 💳 **Payment-gated results** — accepts photo or PDF payment proof, with a
  manual admin approval flow (inline Approve/Reject buttons) before results
  are released
- 🗃️ **Structured data pipeline** — real loan data is collected via a
  3-sheet Excel template and imported through a dedicated script, rather
  than hand-entered
- 🛡️ **Production-hardened** — persistent (database-backed) session
  storage, concurrent update processing, graceful shutdown, double-click
  guards on admin actions, and defensive error handling around every
  external Telegram/Prisma call

## Tech Stack

| Layer              | Choice                                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| Language           | TypeScript (ESM, strict mode)                                                                             |
| Bot framework      | [grammY](https://grammy.dev/) + `@grammyjs/conversations`, `@grammyjs/runner`, `@grammyjs/storage-prisma` |
| Database           | PostgreSQL                                                                                                |
| ORM                | Prisma 7 (with `@prisma/adapter-pg` driver adapter)                                                       |
| Runtime            | Node.js, `tsx`                                                                                            |
| Spreadsheet import | `xlsx` (SheetJS)                                                                                          |

## Architecture

```
src/
├── bot/
│   ├── bot.ts                  # Bot instance, middleware, session setup
│   ├── adminHandlers.ts        # Approve/Reject callback handlers
│   ├── i18n.ts                 # English/Amharic message strings
│   ├── keyboards.ts             # Inline keyboard builders
│   ├── types.ts                 # Shared grammY context/session types
│   └── conversations/
│       └── loanApplication.ts   # The main questionnaire flow
├── db/
│   └── prisma.ts                # Shared Prisma client (with driver adapter)
├── services/
│   └── matching.ts              # Loan-matching query logic
├── scripts/
│   └── importData.ts            # Spreadsheet → database import script
└── index.ts                      # Entry point (runner + graceful shutdown)

prisma/
└── schema.prisma                 # Institution / LoanProduct / UserSession / Session models
```

**Data flow:** an admin collects real loan data into a structured Excel
template (Institutions / Loan Products / Eligibility & Docs, linked by ID)
→ `importData.ts` parses and loads it into Postgres → the bot's matching
engine queries against that data at runtime.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (see below)
cp .env.example .env
# fill in your own values

# 3. Set up the database
npx prisma migrate dev
npx prisma generate

# 4. (Optional) seed sample data for local testing
npx tsx prisma/seed.ts

# 5. Run
npm run dev
```

## Environment Variables

| Variable             | Description                                                  |
| -------------------- | ------------------------------------------------------------ |
| `BOT_TOKEN`          | Telegram bot token from [@BotFather](https://t.me/BotFather) |
| `DATABASE_URL`       | PostgreSQL connection string                                 |
| `ADMIN_CHAT_ID`      | Telegram chat ID that receives payment approvals             |
| `TELEBIRR_NUMBER`    | Payment number shown to applicants                           |
| `CBE_ACCOUNT_NUMBER` | Payment account shown to applicants                          |
| `LOAN_INFO_FEE_BIRR` | Fee charged for revealing matched results                    |

None of these are committed — see `.env.example` for the expected shape
with placeholder values.

## What's Deliberately Not in This Repo

- The real loan database (institutions, interest rates, contact numbers) —
  this is business data collected directly from banks/microfinances, not
  code
- Real payment account numbers and bot credentials
- Real user application data

## License

MIT — see [LICENSE](LICENSE). The code is free to reference and reuse; the
underlying business and its data are not part of this license.
