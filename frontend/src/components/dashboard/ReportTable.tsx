import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export interface ReportItem {
  id: string;
  ticker: string;
  companyName: string;
  recommendation: "INVEST" | "PASS";
  confidenceScore: number;
  createdAt: string;
}

interface ReportTableProps {
  reports: ReportItem[];
}

export default function ReportTable({ reports }: ReportTableProps) {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-white/5 bg-white/2">
        <p className="text-gray-400 text-sm">No analysis reports generated yet.</p>
        <Link href="/search" className="mt-4">
          <Button size="sm">Start First Research</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/5">
      <table className="min-w-full divide-y divide-white/5 bg-white/2 backdrop-blur-md">
        <thead>
          <tr className="bg-white/5">
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Symbol
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Verdict
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Confidence
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-gray-300">
          {reports.map((report) => (
            <tr
              key={report.id}
              className="hover:bg-white/5 transition-colors duration-200"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-400">
                {report.ticker}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                {report.companyName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={report.recommendation === "INVEST" ? "invest" : "pass"}>
                  {report.recommendation}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white">
                    {report.confidenceScore}%
                  </span>
                  <div className="w-16 bg-white/10 rounded-full h-1.5 overflow-hidden hidden sm:block">
                    <div
                      className={`h-full rounded-full ${
                        report.recommendation === "INVEST" ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${report.confidenceScore}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                {new Date(report.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <Link href={`/company/${report.ticker}`}>
                  <Button variant="ghost" size="sm" className="hover:text-indigo-400">
                    <span>Details</span>
                    <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
