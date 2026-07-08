"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  Sparkles,
  TrendingUp,
  Cpu,
  Server,
  ShieldCheck,
  AlertCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { researchApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

const STATUS_MESSAGES = [
  { text: "Initializing multi-agent graph nodes...", icon: Cpu },
  { text: "Pulling balance sheet & ratios from Yahoo Finance...", icon: Server },
  { text: "Scraping recent market news & analyst reviews via Tavily...", icon: Search },
  { text: "Formulating SWOT and evaluating risk exposure levels...", icon: ShieldCheck },
  { text: "Synthesizing final Invest / Pass recommendation...", icon: Sparkles },
];

const SUGGESTIONS = ["AAPL", "MSFT", "TSLA", "NVDA", "GOOGL", "AMZN"];

export default function SearchPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [query, setQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusStep, setStatusStep] = useState(0);
  const [error, setError] = useState("");
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const analysisRef = useRef<AbortController | null>(null);

  // Advance the status step display during analysis
  useEffect(() => {
    if (!isAnalyzing) return;
    stepTimerRef.current = setInterval(() => {
      setStatusStep((prev) =>
        prev < STATUS_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 3500);
    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, [isAnalyzing]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const ticker = query.trim().toUpperCase();
    if (!ticker) return;
    if (!isAuthenticated) {
      setError("Please sign in to run an AI analysis.");
      return;
    }

    setError("");
    setStatusStep(0);
    setIsAnalyzing(true);

    try {
      const result = await researchApi.analyze(ticker);
      // Navigate to the company page; pass cached flag as query param
      router.push(`/company/${ticker}?cached=${result.cached}`);
    } catch (err: any) {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      setIsAnalyzing(false);
      setError(err.message || "Analysis failed. Please try again.");
    }
  };

  const handleSuggestionClick = (sym: string) => {
    setQuery(sym);
    setError("");
  };

  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-4">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8">
      {!isAnalyzing ? (
        <>
          <Card className="glow-accent">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold font-heading text-white flex items-center justify-center space-x-2">
                <Sparkles className="h-6 w-6 text-indigo-500" />
                <span>Investment Research Agent</span>
              </CardTitle>
              <p className="text-gray-400 text-sm mt-1">
                Enter any global company ticker to execute an AI multi-agent research analysis.
              </p>
            </CardHeader>
            <CardContent className="p-6">
              {/* Auth guard notice */}
              {!isAuthenticated && (
                <div className="mb-5 flex items-start space-x-3 p-4 bg-amber-500/8 border border-amber-500/20 rounded-xl">
                  <Lock className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-amber-300 font-semibold">Authentication Required</p>
                    <p className="text-xs text-amber-400/80 mt-1">
                      You must be signed in to run an AI analysis.{" "}
                      <Link href="/login" className="underline underline-offset-2 hover:text-amber-200">
                        Sign in here.
                      </Link>
                    </p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-5 flex items-start space-x-3 p-4 bg-rose-500/8 border border-rose-500/20 rounded-xl">
                  <AlertCircle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-rose-300">{error}</p>
                </div>
              )}

              <form onSubmit={handleSearch} className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter Stock Ticker (e.g. AAPL, MSFT, TSLA)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value.toUpperCase())}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors uppercase font-medium"
                    maxLength={10}
                  />
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Quick Suggestions:</span>
                  {SUGGESTIONS.map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => handleSuggestionClick(sym)}
                      className={`px-2.5 py-1 rounded border text-xs font-semibold transition-all ${
                        query === sym
                          ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                          : "bg-white/5 border-white/5 text-gray-400 hover:text-white hover:border-white/20"
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={!query.trim() || !isAuthenticated}
                >
                  {isAuthenticated ? "Start AI Analysis" : "Sign In to Analyze"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info cards */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Agent Nodes", value: "5" },
              { label: "Data Sources", value: "2+" },
              { label: "Avg. Time", value: "~45s" },
            ].map((item) => (
              <div
                key={item.label}
                className="p-4 rounded-xl border border-white/5 bg-white/2"
              >
                <p className="text-2xl font-bold text-white font-heading">{item.value}</p>
                <p className="text-xs text-gray-500 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Agent execution panel */}
          <Card className="border border-indigo-500/30">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
                <Loader2 className="h-12 w-12 text-indigo-500 animate-spin relative" />
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white tracking-wide">
                  Analyzing {query}...
                </h4>
                <p className="text-gray-400 text-sm max-w-sm min-h-[2.5rem] flex items-center justify-center">
                  {STATUS_MESSAGES[statusStep].text}
                </p>
              </div>

              {/* Status checklist */}
              <div className="w-full space-y-3 pt-6 border-t border-white/5 text-left max-w-md">
                {STATUS_MESSAGES.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isCurrent = idx === statusStep;
                  const isDone = idx < statusStep;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center space-x-3 text-sm transition-all duration-500 ${
                        isCurrent
                          ? "opacity-100 text-indigo-400 font-medium"
                          : isDone
                          ? "opacity-50 text-emerald-400"
                          : "opacity-25 text-gray-500"
                      }`}
                    >
                      {isDone ? (
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <StepIcon className="h-4 w-4" />
                      )}
                      <span>{step.text}</span>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-gray-600">
                This typically takes 30–90 seconds depending on network and AI latency.
              </p>
            </CardContent>
          </Card>

          {/* Background loading skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <Skeleton className="h-56 w-full" />
        </div>
      )}
    </div>
  );
}
