"use client";

import React, { useState } from "react";
import { Scale, Search, ShieldAlert, ChevronDown, ChevronUp, ParkingSquare, Award, Trash, Heart } from "lucide-react";
import { RULES_DATA } from "./Constants";

export default function Rules() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  const categories = ["All", "General Conduct", "Parking Policies", "Clubhouse & Pool", "Pet Regulations", "Waste Management"];

  const toggleRule = (id: string) => {
    if (expandedRule === id) {
      setExpandedRule(null);
    } else {
      setExpandedRule(id);
    }
  };

  const filteredRules = RULES_DATA.filter((rule) => {
    const matchesSearch = 
      rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.short.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.details.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === "All" || rule.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Tab Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Scale className="w-6 h-6 text-blue-500" />
            Society Rules & Regulations
          </h2>
          <p className="text-slate-400 text-sm mt-1">Review the code of conduct, parking guides, and clubhouse guidelines for residents.</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Search Input */}
        <div className="md:col-span-2 relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-blue-500 transition"
            placeholder="Search rules, guidelines, or fines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Selector */}
        <div>
          <select
            className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-blue-500 transition cursor-pointer"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Rules Accordion List */}
      <div className="space-y-3">
        {filteredRules.map((rule) => {
          const isExpanded = expandedRule === rule.id;
          
          return (
            <div 
              key={rule.id}
              className={`glass-panel border rounded-xl overflow-hidden transition-all duration-200 ${
                isExpanded ? "border-blue-500/20 shadow-lg shadow-blue-500/5 bg-slate-950/40" : "border-white/5"
              }`}
            >
              {/* Accordion Trigger */}
              <button
                onClick={() => toggleRule(rule.id)}
                className="w-full p-4 text-left flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-900 border border-white/5 text-slate-400 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                      {rule.category}
                    </span>
                    {rule.fine && (
                      <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        Fine Applicable
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1.5">{rule.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-1">{rule.short}</p>
                </div>

                <span className="text-slate-400 self-center">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="p-4 bg-slate-950/60 border-t border-white/5 text-xs text-slate-300 space-y-4 animate-slideup leading-relaxed">
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-[10px] text-blue-400 mb-1">Detailed Regulation</h4>
                    <p>{rule.details}</p>
                  </div>

                  {rule.fine && (
                    <div className="p-3 bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-lg flex items-start gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-[10px] uppercase text-rose-400">Violation Penalty</span>
                        <p className="text-rose-200/90 mt-0.5">{rule.fine}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}

        {filteredRules.length === 0 && (
          <div className="glass-panel py-16 text-center text-slate-500 rounded-2xl border border-white/5">
            <Scale className="w-12 h-12 text-slate-700 mx-auto mb-2" />
            <p className="text-sm">No rules matching your filter or search query were found.</p>
          </div>
        )}
      </div>

    </div>
  );
}
