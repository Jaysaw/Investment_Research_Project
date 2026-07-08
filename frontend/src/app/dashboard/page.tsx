"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ReportTable, { ReportItem } from "@/components/dashboard/ReportTable";
import { researchApi, type ResearchReport } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

function mapReport(r: ResearchReport): ReportItem {
  return {
    id: r.id,
    ticker: r.ticker,
    companyName: r.companyName,
    recommendation: r.recommendation,
    confidenceScore: r.confidenceScore,
    createdAt: r.createdAt,
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Redirect if not authenticated once auth loads
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch history
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    researchApi
      .getHistory()
      .then((data) => setReports(data.reports.slice(0, 5).map(mapReport)))
      .catch((err) => setError(err.message || "Failed to load reports."))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold font-heading text-white">
            Research Console
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Welcome back,{" "}
            <span className="text-indigo-400 font-medium">{user?.name}</span>
            {" "}· Monitor AI investment assessments and trigger new ticker queries.
          </p>
        </div>
        <Link href="/search">
          <Button className="flex items-center space-x-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            <span>New Research Agent</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards Section */}
      <DashboardStats totalReports={reports.length} />

      {/* Search Shortcuts Card */}
      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-white font-semibold text-lg">Query a stock symbol</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Analyze profitability, recent news sentiment, SWOT, and risk layers in seconds.
            </p>
          </div>
          <Link href="/search" className="w-full md:w-auto shrink-0">
            <Button variant="secondary" className="w-full flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <span>Search AAPL, MSFT, GOOGL...</span>
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* History Table Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5">
          <CardTitle className="text-lg font-bold text-white">Recent Analyses</CardTitle>
          <Link href="/history" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
            View All Reports
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-gray-500 text-sm">{error}</div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-gray-400 text-sm">No analyses yet. Run your first research report!</p>
              <Link href="/search">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Start First Analysis
                </Button>
              </Link>
            </div>
          ) : (
            <ReportTable reports={reports} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
