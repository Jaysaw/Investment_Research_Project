"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const prisma_1 = require("../generated/prisma");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = __importDefault(require("pg"));
const logger_1 = __importDefault(require("../utils/logger"));
let prisma;
if (global.prisma) {
    exports.prisma = prisma = global.prisma;
}
else {
    const pool = new pg_1.default.Pool({
        connectionString: process.env.DATABASE_URL,
    });
    const adapter = new adapter_pg_1.PrismaPg(pool);
    exports.prisma = prisma = new prisma_1.PrismaClient({ adapter });
    if (process.env.NODE_ENV !== "production") {
        global.prisma = prisma;
    }
}
// Test database connection on startup
prisma.$connect()
    .then(() => {
    logger_1.default.info("Connected to Neon PostgreSQL cloud database successfully via Prisma 7");
})
    .catch((err) => {
    logger_1.default.error("Failed to connect to database via Prisma: " + err.message);
});
