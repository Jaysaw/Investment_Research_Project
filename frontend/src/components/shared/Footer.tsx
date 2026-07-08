import React from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

export default function Footer() {
  return (
    <footer className="glass-panel border-t border-white/5 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
          <div className="flex items-center space-x-2 text-white font-bold tracking-tight">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
            <span>Stellar<span className="text-indigo-500">Invest</span></span>
          </div>
          <div className="flex space-x-6 text-sm text-gray-400">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Security</Link>
            <Link href="#" className="hover:text-white transition-colors">Support</Link>
          </div>
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} StellarInvest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
