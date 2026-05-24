"use client";

import React from "react";
import { LogOut, User, Shield, Home } from "lucide-react";

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Dev Homes Wellfare Society
            </h1>
            <p className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">Resident Portal</p>
          </div>
        </div>

        {/* User profile actions */}
        <div className="flex items-center gap-4">
          
          {/* User profile card */}
          {user && (
            <div className="flex items-center gap-3 bg-slate-950/60 border border-white/5 rounded-xl px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 border border-white/10 shrink-0">
                {user.role === "admin" ? (
                  <Shield className="w-4 h-4 text-amber-400" />
                ) : (
                  <User className="w-4 h-4 text-blue-400" />
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                  {user.username}
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                    user.role === "admin" 
                      ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" 
                      : "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                  }`}>
                    {user.role}
                  </span>
                </p>
                {user.role === "member" && (
                  <p className="text-[10px] text-slate-400">
                    {user.block} • Apt {user.house_number}
                  </p>
                )}
                {user.role === "admin" && (
                  <p className="text-[10px] text-slate-400">
                    HQ Administrator
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Logout Trigger */}
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold border border-white/5 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Sign Out</span>
          </button>

        </div>
      </div>
    </header>
  );
}
