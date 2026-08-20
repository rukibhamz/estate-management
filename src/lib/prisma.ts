import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; prismaGen?: number };
const PRISMA_GEN = 3;

function createClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

if (!globalForPrisma.prisma || globalForPrisma.prismaGen !== PRISMA_GEN) {
  globalForPrisma.prisma?.$disconnect().catch(() => undefined);
  globalForPrisma.prisma = createClient();
  globalForPrisma.prismaGen = PRISMA_GEN;
}

export const prisma = globalForPrisma.prisma;
