import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import logger from "../utils/logger";

declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (global.prisma) {
  prisma = global.prisma;
} else {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
  }
}

// Test database connection on startup
prisma.$connect()
  .then(() => {
    logger.info("Connected to Neon PostgreSQL cloud database successfully via Prisma 7");
  })
  .catch((err: Error) => {
    logger.error("Failed to connect to database via Prisma: " + err.message);
  });

export { prisma };
