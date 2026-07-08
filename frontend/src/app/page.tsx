"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Bot, Shield, Zap, Search, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="relative min-h-[75vh] flex flex-col justify-center items-center py-12">
      {/* Background glow orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10" />

      {/* Hero Header */}
      <div className="text-center space-y-6 max-w-3xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Bot className="h-3.5 w-3.5" />
          <span>Multi-Agent AI Analyst v1.0</span>
        </div>
        
        <h1 className="text-5xl sm:text-6xl font-bold font-heading tracking-tight text-white leading-[1.1]">
          Equity Research, <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
            Synthesized in Seconds.
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Instantly evaluate stock tickers. Our AI Investment Research Agent scrapes financials, assesses market news, maps competitor margins, and presents a clear decision: <span className="text-emerald-400 font-semibold">Invest</span> or <span className="text-rose-400 font-semibold">Pass</span>.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto group">
              <span>Go to Dashboard</span>
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/search" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              <span>Try Ticker Search</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mt-24">
        <div className="p-6 rounded-xl border border-white/5 bg-white/2 hover:border-indigo-500/20 transition-colors duration-300">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 w-fit">
            <Landmark className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-white mt-4">Real-Time Financials</h3>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            Pulls P/E, Debt-to-Equity ratios, historical margins, and balance sheet parameters from Yahoo Finance dynamically.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-white/5 bg-white/2 hover:border-indigo-500/20 transition-colors duration-300">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 w-fit">
            <Search className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-white mt-4">Multi-Agent news search</h3>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            Utilizes Tavily Search to analyze recent market sentiment, analyst ratings, and press releases for potential flags.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-white/5 bg-white/2 hover:border-indigo-500/20 transition-colors duration-300">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 w-fit">
            <Shield className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-white mt-4">SWOT & Risk Mapping</h3>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            AI synthesizes qualitative SWOT boards and parses company operations to highlight and categorise critical risk layers.
          </p>
        </div>
      </div>
    </div>
  );
}
