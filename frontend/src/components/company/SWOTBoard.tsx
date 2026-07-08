import React from "react";
import { PlusCircle, MinusCircle, Lightbulb, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface SWOTBoardProps {
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

export default function SWOTBoard({ swot }: SWOTBoardProps) {
  const categories = [
    {
      title: "Strengths",
      items: swot.strengths,
      icon: PlusCircle,
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    },
    {
      title: "Weaknesses",
      items: swot.weaknesses,
      icon: MinusCircle,
      color: "text-rose-400 border-rose-500/20 bg-rose-500/5",
    },
    {
      title: "Opportunities",
      items: swot.opportunities,
      icon: Lightbulb,
      color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5",
    },
    {
      title: "Threats",
      items: swot.threats,
      icon: AlertTriangle,
      color: "text-amber-400 border-amber-500/20 bg-amber-500/5",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <Card key={category.title} className={`border ${category.color}`}>
            <CardHeader className="p-4 flex flex-row items-center space-x-2 border-b border-white/5 bg-white/2">
              <Icon className="h-5 w-5" />
              <CardTitle className="text-sm font-bold tracking-wider uppercase text-white">
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <ul className="space-y-2">
                {category.items && category.items.length > 0 ? (
                  category.items.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-sm text-gray-300">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/30 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500 italic">No points specified.</li>
                )}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
