"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Interface definitions
interface FinancialsChartProps {
  data?: {
    year: string;
    revenue: number;
    netIncome: number;
  }[];
}

// Inner chart component that uses recharts
function ChartComponent({ data }: FinancialsChartProps) {
  // Mock data if none provided
  const chartData = data || [
    { year: "2021", revenue: 365.8, netIncome: 94.6 },
    { year: "2022", revenue: 394.3, netIncome: 99.8 },
    { year: "2023", revenue: 383.2, netIncome: 96.9 },
    { year: "2024", revenue: 391.0, netIncome: 101.4 },
    { year: "2025 (Est)", revenue: 412.5, netIncome: 110.2 },
  ];

  // Recharts dynamically imported to avoid window issues in Next.js SSR
  const {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
  } = require("recharts");

  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
          <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} tickLine={false} />
          <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(11, 15, 25, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#6366f1"
            fillOpacity={1}
            fill="url(#colorRevenue)"
            name="Revenue ($B)"
          />
          <Area
            type="monotone"
            dataKey="netIncome"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorIncome)"
            name="Net Income ($B)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Wrap inside a client-side only component to prevent hydration errors
export default dynamic(() => Promise.resolve(ChartComponent), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full animate-pulse bg-white/5 rounded-lg flex items-center justify-center text-gray-500 text-sm">
      Loading interactive charts...
    </div>
  ),
});
