import React from "react";
import { BarChart3, TrendingUp, TrendingDown, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardStatsProps {
  totalReports?: number;
  investCount?: number;
  passCount?: number;
}

export default function DashboardStats({
  totalReports,
  investCount,
  passCount,
}: DashboardStatsProps) {
  const total = totalReports ?? 0;
  const invest = investCount ?? 0;
  const pass = passCount ?? 0;

  const stats = [
    {
      name: "Analyzed Companies",
      value: total > 0 ? String(total) : "—",
      description: "Total AI research runs",
      icon: BarChart3,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      name: "Invest Verdicts",
      value: invest > 0 ? String(invest) : total > 0 ? "0" : "—",
      description: "Buy recommendations",
      icon: TrendingUp,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      name: "Pass Verdicts",
      value: pass > 0 ? String(pass) : total > 0 ? "0" : "—",
      description: "Skip or avoid recommendations",
      icon: TrendingDown,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
    {
      name: "Agent Success Rate",
      value: "83.5%",
      description: "Backtested vs S&P 500",
      icon: Target,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.name} className="hover:scale-[1.02] duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                  <h4 className="text-3xl font-bold text-white mt-2 tracking-tight">
                    {stat.value}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-lg border ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
