import { PrismaClient } from "@prisma/client";
import { usesDatabase } from "@/lib/data-source";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

/**
 * In static mode no client is created. Any code path that still reaches the
 * database fails immediately with a clear message, rather than trying to
 * connect to whatever DATABASE_URL happens to be set in the environment.
 */
const disabled = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (prop === "then") return undefined; // not a thenable
    throw new Error(
      `The database is disabled (static mode), but db.${String(prop)} was used. Set DATA_SOURCE=database to enable it.`
    );
  },
});

export const db: PrismaClient = usesDatabase ? (globalForPrisma.prisma ?? createClient()) : disabled;

if (usesDatabase && process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
