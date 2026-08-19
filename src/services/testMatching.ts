import "dotenv/config";
import { findMatches } from "./matching.js";
import { prisma } from "../db/prisma.js";

async function runScenario(label: string, criteria: Parameters<typeof findMatches>[0]) {
  const result = await findMatches(criteria);
  console.log(`\n--- ${label} ---`);
  console.log("Criteria:", criteria);
  console.log(
    `Matches: ${result.bankCount} bank(s), ${result.microfinanceCount} microfinance(s)`
  );
  for (const inst of result.institutions) {
    console.log(`  ${inst.institutionName} (${inst.institutionType})`);
    for (const p of inst.products) {
      console.log(`    - ${p.loanProductName}: ${p.amountMin}-${p.amountMax} Birr`);
    }
  }
}

async function main() {
  // Employed, mid income, wants a mid-size loan — should hit several institutions
  await runScenario("Employed, 4000 income, wants 20k-40k", {
    status: "employed",
    monthlyIncome: 4000,
    desiredAmountMin: 20_000,
    desiredAmountMax: 40_000,
  });

  // Employed but income too low for most products — expect fewer or no matches
  await runScenario("Employed, 1000 income (very low), wants 20k-40k", {
    status: "employed",
    monthlyIncome: 1000,
    desiredAmountMin: 20_000,
    desiredAmountMax: 40_000,
  });

  // Student — should only match the one student product
  await runScenario("Student, wants 5k-10k", {
    status: "student",
    desiredAmountMin: 5_000,
    desiredAmountMax: 10_000,
  });

  // Wants a huge amount nothing covers — expect zero matches
  await runScenario("Employed, high income, wants 5M-10M (unrealistic)", {
    status: "employed",
    monthlyIncome: 50_000,
    desiredAmountMin: 5_000_000,
    desiredAmountMax: 10_000_000,
  });

  // Business owner wanting a large amount — should hit Awash's big personal loan too
  await runScenario("Business, wants 150k-300k", {
    status: "business",
    desiredAmountMin: 150_000,
    desiredAmountMax: 300_000,
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
