"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = protect;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const logger_1 = __importDefault(require("../utils/logger"));
const JWT_SECRET = process.env.JWT_SECRET || "stellarinvest_secret_key_change_in_prod";
async function protect(req, res, next) {
    let token;
    // Check Authorization header
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    // Fallback to cookie
    else if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
    }
    if (!token) {
        res.status(401).json({ error: "Access denied. No authentication token provided." });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Find active user
        const user = await db_1.prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, name: true },
        });
        if (!user) {
            res.status(401).json({ error: "User session not found or deleted." });
            return;
        }
        req.user = user;
        next();
    }
    catch (err) {
        logger_1.default.error("JWT verification failure: " + err.message);
        res.status(401).json({ error: "Authentication failed. Invalid or expired token." });
    }
}
