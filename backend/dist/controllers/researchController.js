"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistory = getHistory;
exports.getDetails = getDetails;
exports.analyzeTicker = analyzeTicker;
const db_1 = require("../config/db");
const logger_1 = __importDefault(require("../utils/logger"));
const graph_1 = require("../services/agent/graph");
async function getHistory(req, res, next) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized access" });
            return;
        }
        const reports = await db_1.prisma.researchReport.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json({ reports });
    }
    catch (err) {
        next(err);
    }
}
async function getDetails(req, res, next) {
    try {
        const userId = req.user?.id;
        const ticker = req.params.ticker;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized access" });
            return;
        }
        if (!ticker) {
            res.status(400).json({ error: "Symbol ticker parameter is required" });
            return;
        }
        const report = await db_1.prisma.researchReport.findFirst({
            where: {
                userId,
                ticker: ticker.toUpperCase(),
            },
            orderBy: { createdAt: "desc" },
        });
        if (!report) {
            res.status(404).json({ error: `No research report found for ticker ${ticker.toUpperCase()}` });
            return;
        }
        res.status(200).json({ report });
    }
    catch (err) {
        next(err);
    }
}
async function analyzeTicker(req, res, next) {
    try {
        const userId = req.user?.id;
        const { ticker } = req.body;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized access" });
            return;
        }
        if (!ticker) {
            res.status(400).json({ error: "Ticker symbol is required" });
            return;
        }
        const cleanTicker = ticker.toUpperCase().trim();
        logger_1.default.info(`AI analysis requested for ticker: ${cleanTicker} by user: ${userId}`);
        // Check if report has already been created today (cache lookup)
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const existingReport = await db_1.prisma.researchReport.findFirst({
            where: {
                userId,
                ticker: cleanTicker,
                createdAt: {
                    gte: startOfToday,
                },
            },
        });
        if (existingReport) {
            logger_1.default.info(`Returning cached report for ticker ${cleanTicker}`);
            res.status(200).json({ report: existingReport, cached: true });
            return;
        }
        // Execute LangGraph multi-agent analysis flow
        logger_1.default.info(`Triggering LangGraph agent for stock: ${cleanTicker}`);
        const agentResult = await (0, graph_1.runInvestmentAgent)(cleanTicker);
        // Save report to database
        const savedReport = await db_1.prisma.researchReport.create({
            data: {
                userId,
                companyName: agentResult.companyName,
                ticker: cleanTicker,
                recommendation: agentResult.recommendation === "INVEST" ? "INVEST" : "PASS",
                confidenceScore: agentResult.confidenceScore,
                reasoning: agentResult.reasoning,
                overview: agentResult.overview,
                swot: agentResult.swot,
                financials: agentResult.financials,
                risks: agentResult.risks,
                sentiment: agentResult.sentiment,
            },
        });
        res.status(201).json({ report: savedReport, cached: false });
    }
    catch (err) {
        next(err);
    }
}
