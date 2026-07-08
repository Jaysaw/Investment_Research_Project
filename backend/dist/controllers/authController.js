"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginGoogle = loginGoogle;
exports.refreshToken = refreshToken;
exports.logout = logout;
exports.register = register;
exports.login = login;
exports.getMe = getMe;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../config/db");
const logger_1 = __importDefault(require("../utils/logger"));
const JWT_SECRET = process.env.JWT_SECRET || "stellarinvest_secret_key_change_in_prod";
const JWT_EXPIRES_IN = "1h";
const REFRESH_TOKEN_EXPIRES_DAYS = 7;
function generateAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
async function loginGoogle(req, res, next) {
    try {
        const { email, name, googleId, avatarUrl } = req.body;
        if (!email || !name || !googleId) {
            res.status(400).json({ error: "Missing required fields (email, name, googleId)" });
            return;
        }
        // Upsert user
        let user = await db_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            user = await db_1.prisma.user.create({
                data: {
                    email,
                    name,
                    googleId,
                    avatarUrl,
                },
            });
            logger_1.default.info(`New user registered via Google: ${email}`);
        }
        else if (!user.googleId) {
            // Link Google Account
            user = await db_1.prisma.user.update({
                where: { email },
                data: { googleId, avatarUrl },
            });
            logger_1.default.info(`Google credentials linked to existing email: ${email}`);
        }
        // Generate tokens
        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            name: user.name,
        });
        const refreshTokenString = jsonwebtoken_1.default.sign({ id: user.id }, process.env.REFRESH_SECRET || "stellarinvest_refresh_secret_key", { expiresIn: `${REFRESH_TOKEN_EXPIRES_DAYS}d` });
        // Save refresh token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);
        await db_1.prisma.refreshToken.create({
            data: {
                token: refreshTokenString,
                userId: user.id,
                expiresAt,
            },
        });
        // Set HTTPOnly cookie
        res.cookie("refreshToken", refreshTokenString, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            message: "Authentication successful",
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatarUrl,
            },
        });
    }
    catch (err) {
        next(err);
    }
}
async function refreshToken(req, res, next) {
    try {
        const token = req.cookies.refreshToken || req.body.refreshToken;
        if (!token) {
            res.status(400).json({ error: "Refresh token is missing" });
            return;
        }
        // Find token in database
        const dbToken = await db_1.prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!dbToken || dbToken.revoked || dbToken.expiresAt < new Date()) {
            res.status(401).json({ error: "Invalid, revoked, or expired refresh token" });
            return;
        }
        // Generate new access token
        const accessToken = generateAccessToken({
            id: dbToken.user.id,
            email: dbToken.user.email,
            name: dbToken.user.name,
        });
        res.status(200).json({ accessToken });
    }
    catch (err) {
        next(err);
    }
}
async function logout(req, res, next) {
    try {
        const token = req.cookies.refreshToken || req.body.refreshToken;
        if (token) {
            // Revoke in database
            await db_1.prisma.refreshToken.updateMany({
                where: { token },
                data: { revoked: true },
            });
        }
        res.clearCookie("refreshToken");
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (err) {
        next(err);
    }
}
async function register(req, res, next) {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            res.status(400).json({ error: "Email, password, and name are required" });
            return;
        }
        const existingUser = await db_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: "User with this email already exists" });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await db_1.prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            },
        });
        logger_1.default.info(`New user registered via email: ${email}`);
        // Generate tokens
        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            name: user.name,
        });
        const refreshTokenString = jsonwebtoken_1.default.sign({ id: user.id }, process.env.REFRESH_SECRET || "stellarinvest_refresh_secret_key", { expiresIn: `${REFRESH_TOKEN_EXPIRES_DAYS}d` });
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);
        await db_1.prisma.refreshToken.create({
            data: {
                token: refreshTokenString,
                userId: user.id,
                expiresAt,
            },
        });
        res.cookie("refreshToken", refreshTokenString, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
        });
        res.status(201).json({
            message: "User registered successfully",
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    }
    catch (err) {
        next(err);
    }
}
async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }
        const user = await db_1.prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) {
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }
        // Generate tokens
        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            name: user.name,
        });
        const refreshTokenString = jsonwebtoken_1.default.sign({ id: user.id }, process.env.REFRESH_SECRET || "stellarinvest_refresh_secret_key", { expiresIn: `${REFRESH_TOKEN_EXPIRES_DAYS}d` });
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);
        await db_1.prisma.refreshToken.create({
            data: {
                token: refreshTokenString,
                userId: user.id,
                expiresAt,
            },
        });
        res.cookie("refreshToken", refreshTokenString, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            message: "Login successful",
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatarUrl,
            },
        });
    }
    catch (err) {
        next(err);
    }
}
async function getMe(req, res, next) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Not authenticated" });
            return;
        }
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, avatarUrl: true },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.status(200).json({ user });
    }
    catch (err) {
        next(err);
    }
}
