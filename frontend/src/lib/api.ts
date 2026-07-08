/**
 * API Client – wraps all backend HTTP calls.
 * Stores the access token in-memory (and localStorage); refresh token lives in an HttpOnly cookie.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ─── In-memory token store ──────────────────────────────────────────────────
let _accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  _accessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
  }
}

export function getAccessToken(): string | null {
  if (_accessToken) return _accessToken;
  if (typeof window !== "undefined") {
    _accessToken = localStorage.getItem("accessToken");
  }
  return _accessToken;
}

// ─── Base fetch wrapper ─────────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include", // send HttpOnly cookies for refresh token
  });

  // Try to refresh token on 401 and retry once
  if (res.status === 401 && retry) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      return apiFetch<T>(path, options, false);
    }
    setAccessToken(null);
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    let errMsg = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      errMsg = data?.error || errMsg;
    } catch {
      // ignore parse error
    }
    throw new Error(errMsg);
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ─── Token refresh ──────────────────────────────────────────────────────────
async function tryRefreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.accessToken) {
      setAccessToken(data.accessToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}

export interface NewsItem {
  title: string;
  source: string;
  url: string;
  time: string;
  sentiment: "Positive" | "Neutral" | "Negative";
}

export interface RiskItem {
  risk: string;
  impact: "High" | "Medium" | "Low";
}

export interface ChartDataPoint {
  year: string;
  revenue: number;
  netIncome: number;
}

export interface ResearchReport {
  id: string;
  userId: string;
  companyName: string;
  ticker: string;
  recommendation: "INVEST" | "PASS";
  confidenceScore: number;
  reasoning: string;
  overview: {
    companyName?: string;
    businessModel: string;
    industry: string;
    marketCap: string;
    revenue: string;
    competitors: string[];
  };
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  financials: {
    pe: string;
    pb: string;
    de: string;
    roe: string;
    margin: string;
    operatingMargin?: string;
    chartData: ChartDataPoint[];
  };
  risks: RiskItem[];
  sentiment: {
    recentNews: NewsItem[];
    analystSentiment: "Bullish" | "Neutral" | "Bearish";
  };
  createdAt: string;
  updatedAt: string;
}

// ─── Auth API ───────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    apiFetch<{ accessToken: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiFetch<{ accessToken: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiFetch<{ message: string }>("/auth/logout", { method: "POST" }),

  refresh: () => tryRefreshToken(),

  getMe: () => apiFetch<{ user: User }>("/auth/me"),
};

// ─── Research API ────────────────────────────────────────────────────────────
export const researchApi = {
  analyze: (ticker: string) =>
    apiFetch<{ report: ResearchReport; cached: boolean }>("/research/analyze", {
      method: "POST",
      body: JSON.stringify({ ticker }),
    }),

  getHistory: () =>
    apiFetch<{ reports: ResearchReport[] }>("/research/history"),

  getByTicker: (ticker: string) =>
    apiFetch<{ report: ResearchReport }>(`/research/details/${ticker}`),
};
