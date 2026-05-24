"use client";

import React, { useState } from "react";
import { Phone, Copy, Check, ShieldAlert, Award, Clock, ArrowUpRight } from "lucide-react";
import { CONTACT_NUMBERS } from "./Constants";

export default function Emergency() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [simulatedCall, setSimulatedCall] = useState<string | null>(null);

  const handleCopy = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCall = (name: string) => {
    setSimulatedCall(`Simulating phone call to: ${name}...`);
    setTimeout(() => setSimulatedCall(null), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Phone className="w-6 h-6 text-blue-500 animate-bounce" />
            Emergency Contacts Directory
          </h2>
          <p className="text-slate-400 text-sm mt-1">Quick-access static phone directory for society utilities, technicians, and office supervisors.</p>
        </div>
      </div>

      {simulatedCall && (
        <div className="p-4 bg-blue-950/80 border border-blue-500/30 text-blue-300 rounded-xl text-xs flex items-center gap-2 animate-pulse">
          <Phone className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{simulatedCall}</span>
        </div>
      )}

      {/* Primary Emergency Info Alert */}
      <div className="p-4 bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-rose-300 uppercase tracking-wider">Medical & Fire Emergency</span>
          <p className="text-rose-200/90 leading-relaxed">
            For critical medical, fire, or police emergencies, please dial national helpline numbers directly: <strong className="text-white">102 (Ambulance)</strong>, <strong className="text-white">101 (Fire)</strong>, or <strong className="text-white">100 (Police)</strong>.
          </p>
        </div>
      </div>

      {/* Static Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CONTACT_NUMBERS.map((contact) => (
          <div 
            key={contact.id}
            className="glass-panel p-5 rounded-2xl border border-white/10 shadow-lg flex flex-col justify-between hover:border-white/15 transition-all duration-300 space-y-4"
          >
            {/* Header info */}
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="bg-slate-900 border border-white/5 text-blue-400 text-[9px] font-bold uppercase px-2.5 py-1 rounded">
                    {contact.profession}
                  </span>
                  <h3 className="text-md font-bold text-white mt-2">{contact.name}</h3>
                </div>
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {contact.availability}
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">{contact.description}</p>
            </div>

            {/* Direct Calling & Copy Actions Row */}
            <div className="flex items-center gap-2 pt-3.5 border-t border-white/5">
              
              {/* Call Simulation Button */}
              <button
                onClick={() => handleCall(contact.name)}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs border border-white/5 transition flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>Call {contact.phone}</span>
                <ArrowUpRight className="w-3 h-3 text-slate-500" />
              </button>

              {/* Copy Phone Clipboard */}
              <button
                onClick={() => handleCopy(contact.id, contact.phone)}
                className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white p-2.5 rounded-xl border border-white/5 transition shrink-0"
                title="Copy Number"
              >
                {copiedId === contact.id ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
