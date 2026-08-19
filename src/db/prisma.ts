import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Single shared instance — import this everywhere instead of creating new PrismaClients
export const prisma = new PrismaClient({ adapter });
