import { PrismaClient } from "@prisma/client";

// Next.js dev-mode reloads modules on every request; without this a fresh
// PrismaClient (and DB connection) would be created each time.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
