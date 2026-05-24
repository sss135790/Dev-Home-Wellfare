"use client";

import React, { useState, useEffect } from "react";
import { Megaphone, PlusCircle, AlertCircle, RefreshCw, Calendar, Tag, ShieldAlert } from "lucide-react";

interface Notice {
  id: number;
  title: string;
  content: string;
  tag: "urgent" | "event" | "maintenance" | "announcement";
  created_at: string;
}

interface NoticesProps {
  token: string;
  user: any;
}

export default function Notices({ token, user }: NoticesProps) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState<"urgent" | "event" | "maintenance" | "announcement">("announcement");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchNotices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/notices`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to fetch notices");
      }
      setNotices(data);
    } catch (err: any) {
      setError(err.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      setError("Please fill all fields");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/api/notices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, content, tag })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to post notice");
      }

      setSuccess("Notice published successfully!");
      setTitle("");
      setContent("");
      setTag("announcement");
      setShowForm(false);
      
      // Update local state list
      setNotices([data, ...notices]);
    } catch (err: any) {
      setError(err.message || "Failed to post notice");
    } finally {
      setSubmitting(false);
    }
  };

  const getTagColor = (tagType: string) => {
    switch (tagType) {
      case "urgent":
        return "bg-rose-500/10 border-rose-500/20 text-rose-400";
      case "event":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "maintenance":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      case "announcement":
      default:
        return "bg-blue-500/10 border-blue-500/20 text-blue-400";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-blue-500" />
            Notice Board & Announcements
          </h2>
          <p className="text-slate-400 text-sm mt-1">Stay updated with official society communications, events, and maintenance schedules.</p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          {user?.role === "admin" && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Post New Notice
            </button>
          )}
          <button
            onClick={fetchNotices}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-semibold border border-white/5 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-950/60 border border-red-500/30 text-red-300 rounded-xl text-xs">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs">
          {success}
        </div>
      )}

      {/* Post Notice Form Panel (Admin Only) */}
      {showForm && user?.role === "admin" && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl animate-slideup max-w-xl">
          <h3 className="text-md font-bold text-white mb-4">Publish a New Notice</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Notice Title</label>
              <input
                type="text"
                required
                className="w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                placeholder="e.g. Common Area Electricity Outage, Water Supply Tank Cleaning"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Category Tag</label>
              <select
                className="w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition cursor-pointer"
                value={tag}
                onChange={(e) => setTag(e.target.value as any)}
              >
                <option value="announcement">Announcement</option>
                <option value="urgent">Urgent Announcement</option>
                <option value="event">Society Event</option>
                <option value="maintenance">Maintenance Schedule</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Content Details</label>
              <textarea
                required
                rows={5}
                className="w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                placeholder="Details of the announcement, timelines, contact details..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-300 mt-2"
            >
              {submitting ? "Publishing..." : "Publish Notice"}
            </button>
          </form>
        </div>
      )}

      {/* Notices Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">Fetching announcements database...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div 
              key={notice.id}
              className={`glass-panel p-5 md:p-6 rounded-2xl border shadow-md space-y-3.5 hover:border-white/15 transition-all duration-300 ${
                notice.tag === "urgent" ? "border-rose-500/20 shadow-lg shadow-rose-500/5 bg-slate-950/20 animate-glow" : "border-white/10"
              }`}
            >
              
              {/* Card Meta Header */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${getTagColor(notice.tag)}`}>
                    {notice.tag}
                  </span>
                  {notice.tag === "urgent" && (
                    <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 flex items-center gap-1.5 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {new Date(notice.created_at).toLocaleDateString("en-IN", {
                    year: "numeric", month: "long", day: "numeric"
                  })}
                </span>
              </div>

              {/* Card Body */}
              <div className="space-y-2">
                <h3 className="text-md font-bold text-white leading-snug">{notice.title}</h3>
                <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">{notice.content}</p>
              </div>

            </div>
          ))}

          {notices.length === 0 && (
            <div className="glass-panel py-20 text-center text-slate-500 rounded-2xl border border-white/5">
              <Megaphone className="w-12 h-12 text-slate-700 mx-auto mb-2" />
              <p className="text-sm">No notices posted. Check back later.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
