import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";
import { prisma } from "../config/db";
import logger from "../utils/logger";
import { runInvestmentAgent } from "../services/agent/graph";

export async function getHistory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized access" });
      return;
    }

    const reports = await prisma.researchReport.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ reports });
  } catch (err) {
    next(err);
  }
}

export async function getDetails(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    const ticker = req.params.ticker as string;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized access" });
      return;
    }

    if (!ticker) {
      res.status(400).json({ error: "Symbol ticker parameter is required" });
      return;
    }

    const report = await prisma.researchReport.findFirst({
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
  } catch (err) {
    next(err);
  }
}

export async function analyzeTicker(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
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
    logger.info(`AI analysis requested for ticker: ${cleanTicker} by user: ${userId}`);

    // Check if report has already been created today (cache lookup)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const existingReport = await prisma.researchReport.findFirst({
      where: {
        userId,
        ticker: cleanTicker,
        createdAt: {
          gte: startOfToday,
        },
      },
    });

    if (existingReport) {
      logger.info(`Returning cached report for ticker ${cleanTicker}`);
      res.status(200).json({ report: existingReport, cached: true });
      return;
    }

    // Execute LangGraph multi-agent analysis flow
    logger.info(`Triggering LangGraph agent for stock: ${cleanTicker}`);
    const agentResult = await runInvestmentAgent(cleanTicker);

    // Save report to database
    const savedReport = await prisma.researchReport.create({
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
  } catch (err) {
    next(err);
  }
}
