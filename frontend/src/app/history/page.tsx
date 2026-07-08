"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [allReports, setAllReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVerdict, setFilterVerdict] = useState<"ALL" | "INVEST" | "PASS">("ALL");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch all history from backend
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    researchApi
      .getHistory()
      .then((data) => setAllReports(data.reports.map(mapReport)))
      .catch((err) => setError(err.message || "Failed to load reports."))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  // Client-side filtering
  const filteredReports = allReports.filter((item) => {
    const matchesSearch =
      item.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVerdict =
      filterVerdict === "ALL" || item.recommendation === filterVerdict;
    return matchesSearch && matchesVerdict;
  });

  const investCount = allReports.filter((r) => r.recommendation === "INVEST").length;
  const passCount = allReports.filter((r) => r.recommendation === "PASS").length;

  if (authLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-heading text-white">Historical Logs</h2>
          <p className="text-gray-400 text-sm mt-1">
            Access all previous research agent runs and recommendations.
          </p>
        </div>
        <Link href="/search">
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Analysis</span>
          </Button>
        </Link>
      </div>

      {/* Summary badges */}
      {!loading && allReports.length > 0 && (
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-400">
            Total: <span className="text-white font-semibold">{allReports.length}</span>
          </span>
          <span className="text-emerald-400">
            INVEST: <span className="font-semibold">{investCount}</span>
          </span>
          <span className="text-rose-400">
            PASS: <span className="font-semibold">{passCount}</span>
          </span>
        </div>
      )}

      {/* Filter panel */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:flex-1">
            <input
              type="text"
              placeholder="Filter by company or ticker symbol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {(["ALL", "INVEST", "PASS"] as const).map((verdict) => (
              <Button
                key={verdict}
                variant={
                  filterVerdict === verdict
                    ? verdict === "INVEST"
                      ? "invest"
                      : verdict === "PASS"
                      ? "pass"
                      : "default"
                    : "secondary"
                }
                size="sm"
                onClick={() => setFilterVerdict(verdict)}
                className="flex-1 sm:flex-none"
              >
                {verdict === "ALL" ? "All" : verdict}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-400 text-sm">{error}</div>
          ) : filteredReports.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <p className="text-gray-400">
                {allReports.length === 0
                  ? "No analyses yet. Start your first research report!"
                  : "No reports match your filters."}
              </p>
              {allReports.length === 0 && (
                <Link href="/search">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Start First Analysis
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <ReportTable reports={filteredReports} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
