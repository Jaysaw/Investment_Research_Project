import React from "react";
import { ExternalLink, Calendar, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface NewsItem {
  title: string;
  source: string;
  url: string;
  time: string;
  sentiment?: "Positive" | "Neutral" | "Negative";
}

interface NewsTimelineProps {
  news: NewsItem[];
}

export default function NewsTimeline({ news }: NewsTimelineProps) {
  const getSentimentBadge = (sentiment?: string) => {
    if (!sentiment) return null;
    switch (sentiment) {
      case "Positive":
        return <Badge variant="invest" className="text-[10px] py-0">Positive</Badge>;
      case "Negative":
        return <Badge variant="pass" className="text-[10px] py-0">Negative</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px] py-0">Neutral</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-white/5">
        <CardTitle className="text-base font-bold text-white flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-indigo-500" />
          <span>Latest Market News & Sentiment Feed</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-white/5">
          {news && news.length > 0 ? (
            news.map((item, idx) => (
              <div
                key={idx}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4 hover:bg-white/2 transition-colors duration-200"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-indigo-400 font-medium">{item.source}</span>
                    {getSentimentBadge(item.sentiment)}
                  </div>
                  <h5 className="text-sm font-semibold text-white leading-snug">
                    {item.title}
                  </h5>
                  <div className="flex items-center space-x-1.5 text-xs text-gray-400">
                    <Calendar className="h-3 w-3" />
                    <span>{item.time}</span>
                  </div>
                </div>
                {item.url && item.url !== "#" && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors self-start sm:self-center"
                  >
                    <span>Read Article</span>
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-gray-500 italic">
              No recent news items compiled for this company.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
