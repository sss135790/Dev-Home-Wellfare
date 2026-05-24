"use client";

import React, { useState, useEffect } from "react";
import { 
  Building, CreditCard, AlertTriangle, Vote, Scale, Megaphone, Phone, 
  LayoutDashboard, User, Shield, Info
} from "lucide-react";

import Navbar from "@/components/Navbar";
import LoginSignupModal from "@/components/LoginSignupModal";
import Tour from "@/components/Tour";
import Maintenance from "@/components/Maintenance";
import Complaints from "@/components/Complaints";
import Voting from "@/components/Voting";
import Rules from "@/components/Rules";
import Notices from "@/components/Notices";
import Emergency from "@/components/Emergency";

type Tab = "tour" | "maintenance" | "complaints" | "voting" | "rules" | "notices" | "emergency";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>("notices"); // notices by default
  const [clientLoaded, setClientLoaded] = useState(false);

  // Sync token from localStorage on mount
  useEffect(() => {
    setClientLoaded(true);
    const storedToken = localStorage.getItem("society_token");
    const storedUser = localStorage.getItem("society_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = (newToken: string, newUser: any) => {
    localStorage.setItem("society_token", newToken);
    localStorage.setItem("society_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("society_token");
    localStorage.removeItem("society_user");
    setToken(null);
    setUser(null);
    setActiveTab("notices");
  };

  if (!clientLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render Login Modal if not logged in
  if (!token || !user) {
    return <LoginSignupModal onSuccess={handleLoginSuccess} />;
  }

  const renderActiveSection = () => {
    switch (activeTab) {
      case "tour":
        return <Tour />;
      case "maintenance":
        return <Maintenance token={token} user={user} />;
      case "complaints":
        return <Complaints token={token} user={user} />;
      case "voting":
        return <Voting token={token} user={user} />;
      case "rules":
        return <Rules />;
      case "emergency":
        return <Emergency />;
      case "notices":
      default:
        return <Notices token={token} user={user} />;
    }
  };

  const menuItems = [
    { id: "notices", label: "Notice Board", icon: Megaphone },
    { id: "tour", label: "Take a Tour", icon: Building },
    { id: "maintenance", label: "Maintenance Bills", icon: CreditCard },
    { id: "complaints", label: "Report Complaint", icon: AlertTriangle },
    { id: "voting", label: "Decision Voting", icon: Vote },
    { id: "rules", label: "Society Rules", icon: Scale },
    { id: "emergency", label: "Emergency Contacts", icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Top Navbar */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* Main Body Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-6 p-4 md:p-6">
        
        {/* Sidebar panel */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="glass-panel p-4 rounded-2xl border border-white/10 sticky top-28 space-y-4">
            
            {/* Quick Greeting */}
            <div className="px-2 py-3 bg-slate-950/40 rounded-xl border border-white/5 flex items-center gap-3">
              <div className="p-2 bg-blue-600/10 rounded-lg text-blue-400">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Welcome back</p>
                <p className="text-xs font-bold text-white truncate max-w-[130px]">{user.username}</p>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 pb-2 lg:pb-0 scrollbar-none">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as Tab)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold border transition shrink-0 lg:shrink ${
                      isActive
                        ? "bg-blue-600/10 border-blue-500/20 text-blue-300 shadow-md shadow-blue-500/5"
                        : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Quick Society Stat */}
            <div className="hidden lg:block p-3.5 bg-slate-950/60 border border-white/5 rounded-xl text-[10px] text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 text-blue-400 font-bold uppercase tracking-wider">
                <Info className="w-3.5 h-3.5" />
                <span>Dev_Homes Info</span>
              </div>
              <p className="leading-relaxed">You are logged into the central portal. Manage all transactions, votes, and issues here.</p>
            </div>

          </div>
        </aside>

        {/* Dynamic Section Window */}
        <main className="flex-1 glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl min-h-[500px]">
          {renderActiveSection()}
        </main>

      </div>
      
      {/* Footer */}
      <footer className="w-full text-center py-6 border-t border-white/5 bg-slate-950/50 text-[10px] text-slate-500 mt-12">
        <p>© 2026 Dev_Homes Welfare Society (Regd. No. 4482-DH). All rights reserved.</p>
        <p className="mt-1 text-slate-600">Built using Next.js, FastAPI & PostgreSQL.</p>
      </footer>

    </div>
  );
}
