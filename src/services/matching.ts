import { prisma } from "../db/prisma.js";
import type { Status } from "../bot/types.js";

export interface MatchCriteria {
  status: Status;
  monthlyIncome?: number | undefined; // only relevant when status === "employed"
  desiredAmountMin: number;
  desiredAmountMax: number;
}

export interface MatchedProduct {
  loanProductId: number;
  loanProductName: string;
  amountMin: number;
  amountMax: number;
  requiresGuarantor: boolean;
  requiredDocuments: string | null;
  interestRate: string | null;
  repaymentTerm: string | null;
}

export interface MatchedInstitution {
  institutionId: number;
  institutionName: string;
  institutionType: "bank" | "microfinance";
  phone: string | null;
  products: MatchedProduct[];
}

export interface MatchResult {
  institutions: MatchedInstitution[];
  bankCount: number;
  microfinanceCount: number;
}

/**
 * Finds loan products that fit the given criteria and groups them by institution.
 *
 * Matching rules:
 * - The product's eligible_status must include the user's status
 * - If the user is employed and the product has a min_income requirement,
 *   the user's income must meet or exceed it
 * - The user's desired amount range must OVERLAP the product's amount range
 *   (doesn't need to fully contain it)
 */
export async function findMatches(criteria: MatchCriteria): Promise<MatchResult> {
  const products = await prisma.loanProduct.findMany({
    where: {
      isActive: true,
      eligibleStatus: { has: criteria.status },
      amountMin: { lte: criteria.desiredAmountMax },
      amountMax: { gte: criteria.desiredAmountMin },
    },
    include: { institution: true },
  });

  const eligible = products.filter((product) => {
    if (criteria.status === "employed" && product.minIncome != null) {
      const income = criteria.monthlyIncome ?? 0;
      if (income < product.minIncome.toNumber()) return false;
    }
    return true;
  });

  const institutionMap = new Map<number, MatchedInstitution>();

  for (const product of eligible) {
    const inst = product.institution;
    if (!institutionMap.has(inst.id)) {
      institutionMap.set(inst.id, {
        institutionId: inst.id,
        institutionName: inst.name,
        institutionType: inst.type,
        phone: inst.phone,
        products: [],
      });
    }
    institutionMap.get(inst.id)!.products.push({
      loanProductId: product.id,
      loanProductName: product.name,
      amountMin: product.amountMin.toNumber(),
      amountMax: product.amountMax.toNumber(),
      requiresGuarantor: product.requiresGuarantor,
      requiredDocuments: product.requiredDocuments,
      interestRate: product.interestRate,
      repaymentTerm: product.repaymentTerm,
    });
  }

  const institutions = [...institutionMap.values()];

  return {
    institutions,
    bankCount: institutions.filter((i) => i.institutionType === "bank").length,
    microfinanceCount: institutions.filter((i) => i.institutionType === "microfinance")
      .length,
  };
}
