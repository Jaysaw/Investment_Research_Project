import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "invest" | "pass";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-indigo-500/10 text-indigo-300 border-indigo-500/20":
            variant === "default",
          "border-transparent bg-white/5 text-gray-300 border-white/10":
            variant === "secondary",
          "text-white border-white/20 bg-transparent": variant === "outline",
          "border-transparent bg-emerald-500/10 text-emerald-400 border-emerald-500/20 glow-emerald":
            variant === "invest",
          "border-transparent bg-rose-500/10 text-rose-400 border-rose-500/20 glow-rose":
            variant === "pass",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
