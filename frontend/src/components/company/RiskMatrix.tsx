import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface RiskItem {
  risk: string;
  impact: "High" | "Medium" | "Low";
}

interface RiskMatrixProps {
  risks: RiskItem[];
}

export default function RiskMatrix({ risks }: RiskMatrixProps) {
  const getImpactBadge = (impact: "High" | "Medium" | "Low") => {
    switch (impact) {
      case "High":
        return <Badge variant="pass">High Impact</Badge>;
      case "Medium":
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Medium Impact</Badge>;
      case "Low":
        return <Badge variant="secondary">Low Impact</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-bold text-white">Risk Profile Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {risks && risks.length > 0 ? (
            risks.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between space-x-4 p-3 rounded-lg border border-white/5 bg-white/2"
              >
                <div className="text-sm text-gray-300">
                  <span className="font-semibold text-white mr-1.5">{idx + 1}.</span>
                  {item.risk}
                </div>
                <div className="shrink-0">{getImpactBadge(item.impact)}</div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">No risks analyzed.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
