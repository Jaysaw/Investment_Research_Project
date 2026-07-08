import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { fetchCompanyFinancials, searchCompanyWeb } from "./tools";
import {
  RESEARCH_SYSTEM_PROMPT,
  SWOT_RISK_SYSTEM_PROMPT,
  SENTIMENT_SYSTEM_PROMPT,
  DECISION_SYSTEM_PROMPT,
} from "./prompts";
import logger from "../../utils/logger";

// Helper to safely clean and parse JSON response from LLM
function parseLLMJSON(text: string): any {
  let cleanText = text.trim();
  // Handle markdown code block wrappers
  if (cleanText.startsWith("```json")) {
    cleanText = cleanText.substring(7);
  } else if (cleanText.startsWith("```")) {
    cleanText = cleanText.substring(3);
  }
  if (cleanText.endsWith("```")) {
    cleanText = cleanText.substring(0, cleanText.length - 3);
  }
  cleanText = cleanText.trim();
  return JSON.parse(cleanText);
}

// Select and initialize LLM based on environment keys
function getModel() {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    logger.info("Initializing Google Gemini API for agent reasoning.");
    return new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: geminiKey,
      temperature: 0.1,
    });
  } else if (openaiKey) {
    logger.info("Initializing OpenAI GPT model for agent reasoning.");
    return new ChatOpenAI({
      model: "gpt-4o-mini",
      apiKey: openaiKey,
      temperature: 0.1,
    });
  } else {
    logger.warn("No LLM API Key found. Running with mock key placeholder (will fail if processed).");
    throw new Error("Missing LLM API keys in environment. Set GEMINI_API_KEY or OPENAI_API_KEY.");
  }
}

// Define LangGraph State Schema
const GraphState = Annotation.Root({
  ticker: Annotation<string>,
  companyName: Annotation<string>,
  overview: Annotation<any>,
  swot: Annotation<any>,
  financials: Annotation<any>,
  risks: Annotation<any>,
  sentiment: Annotation<any>,
  recommendation: Annotation<string>,
  confidenceScore: Annotation<number>,
  reasoning: Annotation<string>,
  error: Annotation<string>,
});

// --- NODE IMPLEMENTATIONS ---

// 1. Research Node: Gathers overview, competitors, business model
async function researchNode(state: typeof GraphState.State) {
  try {
    const rawFinancials = await fetchCompanyFinancials(state.ticker);
    const companyName = rawFinancials.profile.longName || state.ticker;
    
    // Search web for business overview and competitors
    const searchContext = await searchCompanyWeb(
      `${companyName} (${state.ticker}) business model segments primary competitors`
    );

    const model = getModel();
    const prompt = RESEARCH_SYSTEM_PROMPT
      .replace("{profileData}", JSON.stringify(rawFinancials.profile, null, 2))
      .replace("{webContext}", searchContext);

    const response = await model.invoke(prompt);
    const parsedOverview = parseLLMJSON(response.content as string);

    return {
      companyName: parsedOverview.companyName || companyName,
      overview: parsedOverview,
    };
  } catch (err: any) {
    logger.error("Error in researchNode: " + err.message);
    return {
      error: `Research node failed: ${err.message}`,
    };
  }
}

// 2. Financials Node: Queries Yahoo Finance ratios and creates historical charts
async function financialsNode(state: typeof GraphState.State) {
  if (state.error) return {};
  try {
    const rawFinancials = await fetchCompanyFinancials(state.ticker);
    
    // Extract key stats
    const fd = rawFinancials.financialData;
    const ks = rawFinancials.keyStatistics;
    const ea = rawFinancials.earnings;

    const ratios = {
      pe: ks.trailingPE ? `${ks.trailingPE.toFixed(1)}x` : "N/A",
      pb: ks.priceToBook ? `${ks.priceToBook.toFixed(1)}x` : "N/A",
      de: ks.debtToEquity ? (ks.debtToEquity / 100).toFixed(2) : "N/A",
      roe: ks.returnOnEquity ? `${(ks.returnOnEquity * 100).toFixed(1)}%` : "N/A",
      margin: fd.profitMargins ? `${(fd.profitMargins * 100).toFixed(1)}%` : "N/A",
      operatingMargin: fd.operatingMargins ? `${(fd.operatingMargins * 100).toFixed(1)}%` : "N/A",
    };

    // Format chartData from Yahoo Finance yearly earnings
    let chartData = [];
    if (ea && ea.financialsChart && ea.financialsChart.yearly) {
      chartData = ea.financialsChart.yearly.map((item: any) => ({
        year: String(item.date),
        revenue: item.revenue ? parseFloat((item.revenue / 1e9).toFixed(1)) : 0, // In Billions
        netIncome: item.earnings ? parseFloat((item.earnings / 1e9).toFixed(1)) : 0, // In Billions
      }));
    } else {
      // Fallback chart points
      chartData = [
        { year: "2022", revenue: 0, netIncome: 0 },
        { year: "2023", revenue: 0, netIncome: 0 },
        { year: "2024", revenue: 0, netIncome: 0 },
      ];
    }

    return {
      financials: {
        ...ratios,
        chartData,
      },
    };
  } catch (err: any) {
    logger.error("Error in financialsNode: " + err.message);
    return {
      error: `Financials node failed: ${err.message}`,
    };
  }
}

// 3. News & Sentiment Node: Analyzes recent headlines
async function sentimentNode(state: typeof GraphState.State) {
  if (state.error) return {};
  try {
    const searchContext = await searchCompanyWeb(
      `${state.companyName || state.ticker} stock price target analyst rating consensus news updates`
    );

    const model = getModel();
    const prompt = SENTIMENT_SYSTEM_PROMPT.replace("{newsContext}", searchContext);
    
    const response = await model.invoke(prompt);
    const parsedSentiment = parseLLMJSON(response.content as string);

    return {
      sentiment: parsedSentiment,
    };
  } catch (err: any) {
    logger.error("Error in sentimentNode: " + err.message);
    return {
      error: `Sentiment node failed: ${err.message}`,
    };
  }
}

// 4. SWOT & Risk Node: Synthesizes SWOT matrix and Risk list
async function swotRiskNode(state: typeof GraphState.State) {
  if (state.error) return {};
  try {
    const model = getModel();
    const prompt = SWOT_RISK_SYSTEM_PROMPT
      .replace("{overview}", JSON.stringify(state.overview))
      .replace("{financials}", JSON.stringify(state.financials));

    const response = await model.invoke(prompt);
    const parsedSwotRisk = parseLLMJSON(response.content as string);

    return {
      swot: parsedSwotRisk.swot,
      risks: parsedSwotRisk.risks,
    };
  } catch (err: any) {
    logger.error("Error in swotRiskNode: " + err.message);
    return {
      error: `SWOT & Risk node failed: ${err.message}`,
    };
  }
}

// 5. Decision Node: Recommends INVEST or PASS
async function decisionNode(state: typeof GraphState.State) {
  if (state.error) return {};
  try {
    const model = getModel();
    const prompt = DECISION_SYSTEM_PROMPT
      .replace("{overview}", JSON.stringify(state.overview))
      .replace("{financials}", JSON.stringify(state.financials))
      .replace("{swotAndRisks}", JSON.stringify({ swot: state.swot, risks: state.risks }))
      .replace("{sentiment}", JSON.stringify(state.sentiment));

    const response = await model.invoke(prompt);
    const parsedDecision = parseLLMJSON(response.content as string);

    return {
      recommendation: parsedDecision.recommendation,
      confidenceScore: parsedDecision.confidenceScore,
      reasoning: parsedDecision.reasoning,
    };
  } catch (err: any) {
    logger.error("Error in decisionNode: " + err.message);
    return {
      error: `Decision node failed: ${err.message}`,
    };
  }
}

// --- COMPILE GRAPH WORKFLOW ---

const workflow = new StateGraph(GraphState)
  .addNode("research_step", researchNode)
  .addNode("financials_step", financialsNode)
  .addNode("sentiment_step", sentimentNode)
  .addNode("swot_risk_step", swotRiskNode)
  .addNode("decision_step", decisionNode)
  // Connections
  .addEdge(START, "research_step")
  .addEdge("research_step", "financials_step")
  .addEdge("financials_step", "sentiment_step")
  .addEdge("sentiment_step", "swot_risk_step")
  .addEdge("swot_risk_step", "decision_step")
  .addEdge("decision_step", END);

// Compile the executable graph
export const agent = workflow.compile();

/**
 * Orchestrator function that triggers the LangGraph analysis for a stock ticker.
 */
export async function runInvestmentAgent(ticker: string) {
  logger.info(`Starting investment agent execution for ticker: ${ticker}`);
  const initialState = {
    ticker: ticker.toUpperCase().trim(),
    companyName: "",
    overview: null,
    swot: null,
    financials: null,
    risks: null,
    sentiment: null,
    recommendation: "",
    confidenceScore: 0,
    reasoning: "",
    error: "",
  };

  const finalState = await agent.invoke(initialState);
  
  if (finalState.error) {
    throw new Error(finalState.error);
  }

  return finalState;
}
