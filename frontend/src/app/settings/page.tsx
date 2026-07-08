"use client";

import React, { useState } from "react";
import { User, Key, ShieldCheck, Mail, Database, Bell } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [openaiKey, setOpenaiKey] = useState("••••••••••••••••••••••••");
  const [tavilyKey, setTavilyKey] = useState("••••••••••••••••••••••••");
  const [emailAlerts, setEmailAlerts] = useState(true);

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-heading text-white">System Settings</h2>
        <p className="text-gray-400 text-sm mt-1">
          Manage your account profile, credentials, API quotas, and notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side Navigation links */}
        <div className="space-y-2">
          <button className="w-full text-left p-3 rounded-lg bg-white/5 border border-white/10 text-white font-medium text-sm flex items-center space-x-2.5">
            <User className="h-4.5 w-4.5 text-indigo-400" />
            <span>Profile & Account</span>
          </button>
          <button className="w-full text-left p-3 rounded-lg bg-transparent hover:bg-white/2 text-gray-400 hover:text-white font-medium text-sm flex items-center space-x-2.5 transition-colors">
            <Key className="h-4.5 w-4.5" />
            <span>API Integrations</span>
          </button>
          <button className="w-full text-left p-3 rounded-lg bg-transparent hover:bg-white/2 text-gray-400 hover:text-white font-medium text-sm flex items-center space-x-2.5 transition-colors">
            <ShieldCheck className="h-4.5 w-4.5" />
            <span>Security Settings</span>
          </button>
        </div>

        {/* Right Side Settings Panel */}
        <div className="md:col-span-2 space-y-6">
          {/* User profile */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold text-white">Investor Account Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-2xl font-bold">
                  GU
                </div>
                <div>
                  <h4 className="text-white font-semibold text-base">Guest User</h4>
                  <p className="text-gray-500 text-xs">Joined: July 2026</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                  <div className="flex items-center space-x-2.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>guest.investor@example.com</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold text-white">Custom API Keys (Optional)</CardTitle>
              <CardDescription>
                Override default sandbox keys with your private credentials.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">OpenAI API Key</label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tavily Search Key</label>
                <input
                  type="password"
                  value={tavilyKey}
                  onChange={(e) => setTavilyKey(e.target.value)}
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t border-white/5 bg-white/1 p-4 flex justify-between">
              <span className="text-xs text-gray-500">Keys are encrypted and stored locally.</span>
              <Button size="sm" onClick={handleSave}>Save Keys</Button>
            </CardFooter>
          </Card>

          {/* Quota & Usage limits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold text-white flex items-center space-x-2">
                <Database className="h-5 w-5 text-indigo-500" />
                <span>Subscription AI Usage</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Usage Credits</span>
                  <span className="font-semibold text-white">12 / 50 calls</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: "24%" }} />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Credits reset on the 1st of every month. Upgrade plan for unlimited runs.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
