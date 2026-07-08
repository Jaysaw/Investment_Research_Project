"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Award,
  ArrowLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SWOTBoard from "@/components/company/SWOTBoard";
import RiskMatrix from "@/components/company/RiskMatrix";
import FinancialsChart from "@/components/company/FinancialsChart";
import NewsTimeline from "@/components/company/NewsTimeline";
import { researchApi, type ResearchReport } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const ticker = (params.ticker as string || "").toUpperCase();

  const [report, setReport] = useState<ResearchReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCached, setIsCached] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch report
  useEffect(() => {
    if (!isAuthenticated || !ticker) return;
    setLoading(true);
    setError("");
    researchApi
      .getByTicker(ticker)
      .then((data) => {
        setReport(data.report);
        setIsCached(true);
      })
      .catch((err) => {
        setError(err.message || "Report not found. Please run an analysis first.");
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, ticker]);

  if (authLoading || loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (error) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-6">
        <div className="h-16 w-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8 text-rose-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Report Not Found</h2>
          <p className="text-gray-400 text-sm mt-2">{error}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/search">
            <Button>
              <RefreshCw className="h-4 w-4 mr-2" />
              Analyze {ticker}
            </Button>
          </Link>
          <Link href="/history">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to History
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const isInvest = report.recommendation === "INVEST";
  const overview = report.overview || {};
  const swot = report.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  const financials = report.financials || {};
  const risks = report.risks || [];
  const sentiment = report.sentiment || { recentNews: [], analystSentiment: "Neutral" };
  const competitors = overview.competitors || [];

  const ratios = [
    { label: "P/E Ratio", value: financials.pe || "N/A" },
    { label: "P/B Ratio", value: financials.pb || "N/A" },
    { label: "Debt/Equity", value: financials.de || "N/A" },
    { label: "Return on Equity", value: financials.roe || "N/A", accent: "text-emerald-400" },
    { label: "Oper. Margin", value: financials.margin || financials.operatingMargin || "N/A", accent: "text-indigo-400" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Link href="/history" className="hover:text-gray-300 transition-colors flex items-center space-x-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to History</span>
        </Link>
        <span>/</span>
        <span className="text-gray-400">{ticker}</span>
        {isCached && (
          <span className="flex items-center space-x-1 text-xs text-emerald-500">
            <CheckCircle2 className="h-3 w-3" />
            <span>Cached</span>
          </span>
        )}
      </div>

      {/* Header section */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-panel rounded-xl ${
        isInvest ? "glow-emerald" : "glow-rose"
      }`}>
        <div className="space-y-1">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <h1 className="text-4xl font-bold font-heading text-white">{report.ticker}</h1>
            <Badge variant="secondary" className="text-xs">
              {overview.industry || "Technology"}
            </Badge>
            {sentiment.analystSentiment && (
              <Badge
                variant="secondary"
                className={`text-xs ${
                  sentiment.analystSentiment === "Bullish"
                    ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                    : sentiment.analystSentiment === "Bearish"
                    ? "text-rose-400 border-rose-500/20 bg-rose-500/5"
                    : "text-amber-400 border-amber-500/20 bg-amber-500/5"
                }`}
              >
                {sentiment.analystSentiment}
              </Badge>
            )}
          </div>
          <p className="text-gray-400 text-lg">{report.companyName}</p>
          <p className="text-xs text-gray-600">
            Analyzed: {new Date(report.createdAt).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>

        {/* Verdict Callout */}
        <div className="flex items-center space-x-6 border-l border-white/10 pl-6 shrink-0">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
              Verdict
            </p>
            <div className="mt-1">
              <Badge
                variant={isInvest ? "invest" : "pass"}
                className="text-lg px-4 py-1"
              >
                {report.recommendation}
              </Badge>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
              Confidence
            </p>
            <p className={`text-3xl font-extrabold mt-1 ${
              isInvest ? "text-emerald-400" : "text-rose-400"
            }`}>
              {report.confidenceScore}%
            </p>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Reasoning, Overview, Financials, SWOT */}
        <div className="lg:col-span-2 space-y-8">
          {/* Executive Reasoning */}
          <Card className={isInvest ? "border-emerald-500/25" : "border-rose-500/25"}>
            <CardHeader className="bg-white/2 border-b border-white/5">
              <CardTitle className="text-base font-bold text-white flex items-center space-x-2">
                <Award className="h-5 w-5 text-indigo-400" />
                <span>Executive AI Recommendation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                {report.reasoning}
              </p>
            </CardContent>
          </Card>

          {/* Company Overview & Key Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold text-white">Company Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-gray-300 leading-relaxed">
                {overview.businessModel}
              </p>

              {/* Ratios */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-white/5">
                {ratios.map((r) => (
                  <div
                    key={r.label}
                    className="p-3 bg-white/2 rounded-lg border border-white/5 text-center"
                  >
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold block">
                      {r.label}
                    </span>
                    <span className={`text-sm font-bold mt-1 block ${r.accent || "text-white"}`}>
                      {r.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          {financials.chartData && financials.chartData.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-0">
                <div>
                  <CardTitle className="text-base font-bold text-white">
                    Revenue & Earnings Trend
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-1">Historical performance in Billions USD</p>
                </div>
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span className="text-gray-400">Revenue</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-gray-400">Net Income</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <FinancialsChart data={financials.chartData} />
              </CardContent>
            </Card>
          )}

          {/* SWOT */}
          <div className="space-y-3">
            <h4 className="text-lg font-bold text-white">Qualitative SWOT Matrix</h4>
            <SWOTBoard swot={swot} />
          </div>
        </div>

        {/* Right Column: Key Info, Risks, Competitors, Sentiment */}
        <div className="space-y-8">
          {/* Key Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold text-white">Key Profile Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {[
                { label: "Market Cap", value: overview.marketCap || "N/A" },
                { label: "Revenue (LTM)", value: overview.revenue || "N/A" },
                { label: "Analyst Rating", value: sentiment.analystSentiment || "N/A" },
              ].map((item, idx, arr) => (
                <div
                  key={item.label}
                  className={`flex justify-between text-sm py-3 ${idx < arr.length - 1 ? "border-b border-white/5" : ""}`}
                >
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-white font-semibold">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Risk Matrix */}
          {risks.length > 0 && <RiskMatrix risks={risks} />}

          {/* Competitors */}
          {competitors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold text-white">Competitors</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                  {competitors.map((peer: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center p-4 hover:bg-white/2 transition-all"
                    >
                      <div className="h-7 w-7 rounded-full bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 mr-3 shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-sm font-medium text-gray-200">{peer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* News Timeline */}
      {sentiment.recentNews && sentiment.recentNews.length > 0 && (
        <NewsTimeline news={sentiment.recentNews} />
      )}
    </div>
  );
}
