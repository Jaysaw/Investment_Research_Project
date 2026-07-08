"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchCompanyWeb = searchCompanyWeb;
exports.fetchCompanyFinancials = fetchCompanyFinancials;
const yahoo_finance2_1 = __importDefault(require("yahoo-finance2"));
const core_1 = require("@tavily/core");
const logger_1 = __importDefault(require("../../utils/logger"));
// Initialize Tavily Client
function getTavilyClient() {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
        logger_1.default.warn("TAVILY_API_KEY is missing from environment. Tavily search will return empty results.");
        return null;
    }
    try {
        return (0, core_1.tavily)({ apiKey });
    }
    catch (err) {
        logger_1.default.error("Failed to initialize Tavily client: " + err.message);
        return null;
    }
}
/**
 * Searches the web using Tavily Search API.
 */
async function searchCompanyWeb(query) {
    const client = getTavilyClient();
    if (!client) {
        return "Tavily Search API key missing or invalid. No web research data retrieved.";
    }
    try {
        logger_1.default.info(`Searching Tavily for query: "${query}"`);
        const response = await client.search(query, {
            searchDepth: "advanced",
            maxResults: 5,
        });
        const context = response.results
            .map((result) => `[Source: ${result.title} (${result.url})]\n${result.content}`)
            .join("\n\n");
        return context || "No search results returned from Tavily.";
    }
    catch (err) {
        logger_1.default.error(`Tavily search error for query "${query}": ${err.message}`);
        return `Error searching the web: ${err.message}`;
    }
}
/**
 * Fetches company profile, statistics, and earnings metrics from Yahoo Finance.
 */
async function fetchCompanyFinancials(ticker) {
    try {
        logger_1.default.info(`Fetching Yahoo Finance data for ticker: ${ticker}`);
        const summary = (await yahoo_finance2_1.default.quoteSummary(ticker, {
            modules: ["summaryProfile", "financialData", "defaultKeyStatistics", "earnings"],
        }));
        if (!summary) {
            throw new Error(`No financial summary found for ticker ${ticker}`);
        }
        return {
            profile: summary.summaryProfile || {},
            financialData: summary.financialData || {},
            keyStatistics: summary.defaultKeyStatistics || {},
            earnings: summary.earnings || {},
        };
    }
    catch (err) {
        logger_1.default.error(`Yahoo Finance fetch error for ${ticker}: ${err.message}`);
        throw err;
    }
}
