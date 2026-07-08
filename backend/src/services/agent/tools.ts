import yahooFinance from "yahoo-finance2";
import { tavily } from "@tavily/core";
import logger from "../../utils/logger";

// Initialize Tavily Client
function getTavilyClient() {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    logger.warn("TAVILY_API_KEY is missing from environment. Tavily search will return empty results.");
    return null;
  }
  try {
    return tavily({ apiKey });
  } catch (err: any) {
    logger.error("Failed to initialize Tavily client: " + err.message);
    return null;
  }
}

/**
 * Searches the web using Tavily Search API.
 */
export async function searchCompanyWeb(query: string): Promise<string> {
  const client = getTavilyClient();
  if (!client) {
    return "Tavily Search API key missing or invalid. No web research data retrieved.";
  }

  try {
    logger.info(`Searching Tavily for query: "${query}"`);
    const response = await client.search(query, {
      searchDepth: "advanced",
      maxResults: 5,
    });

    const context = response.results
      .map((result: any) => `[Source: ${result.title} (${result.url})]\n${result.content}`)
      .join("\n\n");

    return context || "No search results returned from Tavily.";
  } catch (err: any) {
    logger.error(`Tavily search error for query "${query}": ${err.message}`);
    return `Error searching the web: ${err.message}`;
  }
}

/**
 * Fetches company profile, statistics, and earnings metrics from Yahoo Finance.
 */
export async function fetchCompanyFinancials(ticker: string) {
  try {
    logger.info(`Fetching Yahoo Finance data for ticker: ${ticker}`);
    const summary = (await yahooFinance.quoteSummary(ticker, {
      modules: ["summaryProfile", "financialData", "defaultKeyStatistics", "earnings"],
    })) as any;

    if (!summary) {
      throw new Error(`No financial summary found for ticker ${ticker}`);
    }

    return {
      profile: summary.summaryProfile || {},
      financialData: summary.financialData || {},
      keyStatistics: summary.defaultKeyStatistics || {},
      earnings: summary.earnings || {},
    };
  } catch (err: any) {
    logger.error(`Yahoo Finance fetch error for ${ticker}: ${err.message}`);
    throw err;
  }
}
