import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
 
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
 
async function main() {
  console.log("Seeding sample institutions and loan products...");
 
  // Clear existing data so this script can be re-run safely during development
  await prisma.loanProduct.deleteMany();
  await prisma.institution.deleteMany();
 
  const addisMicrofinance = await prisma.institution.create({
    data: {
      name: "Addis Microfinance S.C.",
      type: "microfinance",
      phone: "+251911000001",
      address: "Bole, Addis Ababa",
      contactPerson: "Selam T.",
    },
  });
 
  const wisdomMicrofinance = await prisma.institution.create({
    data: {
      name: "Wisdom Microfinance",
      type: "microfinance",
      phone: "+251911000002",
      address: "Piazza, Addis Ababa",
      contactPerson: "Dawit A.",
    },
  });
 
  const sidamaMicrofinance = await prisma.institution.create({
    data: {
      name: "Sidama Microfinance",
      type: "microfinance",
      phone: "+251911000003",
      address: "Kazanchis, Addis Ababa",
      contactPerson: "Hana G.",
    },
  });
 
  const cbeSample = await prisma.institution.create({
    data: {
      name: "Commercial Bank of Ethiopia (sample branch)",
      type: "bank",
      phone: "+251911000004",
      address: "Merkato, Addis Ababa",
      contactPerson: "Yonas B.",
    },
  });
 
  const awashSample = await prisma.institution.create({
    data: {
      name: "Awash Bank (sample branch)",
      type: "bank",
      phone: "+251911000005",
      address: "CMC, Addis Ababa",
      contactPerson: "Meron K.",
    },
  });
 
  await prisma.loanProduct.createMany({
    data: [
      {
        institutionId: addisMicrofinance.id,
        name: "Salary-based personal loan",
        eligibleStatus: ["employed"],
        minIncome: 3000,
        amountMin: 5000,
        amountMax: 50000,
        requiresGuarantor: false,
        requiredDocuments: "ID, payslip, 3-month bank statement",
        interestRate: "10% flat/yr",
        repaymentTerm: "up to 12 months",
      },
      {
        institutionId: addisMicrofinance.id,
        name: "Small business loan",
        eligibleStatus: ["business"],
        amountMin: 10000,
        amountMax: 100000,
        requiresGuarantor: true,
        requiredDocuments: "ID, trade license, guarantor",
        interestRate: "12% declining/yr",
        repaymentTerm: "up to 24 months",
      },
      {
        institutionId: wisdomMicrofinance.id,
        name: "Student micro-loan",
        eligibleStatus: ["student"],
        amountMin: 5000,
        amountMax: 20000,
        requiresGuarantor: true,
        requiredDocuments: "ID, student ID, guarantor",
        interestRate: "8% flat/yr",
        repaymentTerm: "up to 12 months",
      },
      {
        institutionId: wisdomMicrofinance.id,
        name: "Employee loan",
        eligibleStatus: ["employed"],
        minIncome: 2500,
        amountMin: 10000,
        amountMax: 100000,
        requiresGuarantor: false,
        requiredDocuments: "ID, payslip, employment letter",
        interestRate: "11% flat/yr",
        repaymentTerm: "up to 18 months",
      },
      {
        institutionId: sidamaMicrofinance.id,
        name: "Micro business loan",
        eligibleStatus: ["business", "unemployed"],
        amountMin: 5000,
        amountMax: 50000,
        requiresGuarantor: true,
        requiredDocuments: "ID, business plan, guarantor",
        interestRate: "13% declining/yr",
        repaymentTerm: "up to 24 months",
      },
      {
        institutionId: cbeSample.id,
        name: "CBE salary advance",
        eligibleStatus: ["employed"],
        minIncome: 5000,
        amountMin: 50000,
        amountMax: 500000,
        requiresGuarantor: false,
        requiredDocuments: "ID, payslip, 6-month bank statement",
        interestRate: "9% flat/yr",
        repaymentTerm: "up to 36 months",
      },
      {
        institutionId: awashSample.id,
        name: "Awash personal loan",
        eligibleStatus: ["employed", "business"],
        minIncome: 4000,
        amountMin: 100000,
        amountMax: 1000000,
        requiresGuarantor: true,
        requiredDocuments: "ID, payslip or trade license, collateral",
        interestRate: "10.5% declining/yr",
        repaymentTerm: "up to 48 months",
      },
    ],
  });
 
  console.log("Seed complete: 5 institutions, 7 loan products created.");
}
 
main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });