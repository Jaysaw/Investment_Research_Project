import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  logger.error(
    `[${req.method}] ${req.originalUrl} - Error status: ${status} - Details: ${err.stack || message}`
  );

  res.status(status).json({
    error: message,
    status: "failed",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}
