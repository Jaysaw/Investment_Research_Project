import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "invest" | "pass";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-98",
          {
            // Brand gradient primary
            "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md hover:from-indigo-500 hover:to-violet-500 shadow-indigo-500/10":
              variant === "default",
            // Dark gray card-style secondary
            "bg-white/5 text-white hover:bg-white/10 border border-white/10":
              variant === "secondary",
            // Outlined button
            "border border-white/15 bg-transparent hover:bg-white/5 text-white":
              variant === "outline",
            // Ghost button
            "hover:bg-white/5 text-gray-300 hover:text-white": variant === "ghost",
            // Hyperlink text
            "underline-offset-4 hover:underline text-indigo-400 hover:text-indigo-300 p-0":
              variant === "link",
            // Custom Invest green gradient
            "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/10":
              variant === "invest",
            // Custom Pass red gradient
            "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md hover:from-rose-500 hover:to-red-500 shadow-rose-500/10":
              variant === "pass",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-12 rounded-lg px-8 text-base": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
