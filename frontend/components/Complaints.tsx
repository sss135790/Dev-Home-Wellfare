"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, PlusCircle, CheckCircle2, Clock, PlayCircle, Filter, RefreshCw, ClipboardList, Trash2 } from "lucide-react";

interface UserInfo {
  username: string;
  gmail: string;
  phone_number: string;
  block: string;
  house_number: string;
  role: string;
}

interface Complaint {
  id: number;
  title: string;
  category: string;
  description: string;
  status: "pending" | "in_progress" | "resolved";
  created_at: string;
  user_id: number;
  user: UserInfo;
}

interface ComplaintsProps {
  token: string;
  user: any;
}

export default function Complaints({ token, user }: ComplaintsProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Plumbing");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Filters State
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchComplaints = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/complaints`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to fetch complaints");
      }
      setComplaints(data);
    } catch (err: any) {
      setError(err.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setError("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/api/complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, category, description })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to submit complaint");
      }

      setSuccess("Complaint filed successfully!");
      setTitle("");
      setDescription("");
      setCategory("Plumbing");
      setShowForm(false);
      
      // Prepend to complaints list
      setComplaints([data, ...complaints]);
    } catch (err: any) {
      setError(err.message || "Failed to file complaint");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (complaintId: number, newStatus: string) => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/complaints/${complaintId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to update status");
      }
      // Update local state list
      setComplaints(complaints.map(c => c.id === complaintId ? data : c));
    } catch (err: any) {
      setError(err.message || "Failed to update complaint status");
    }
  };

  const getStatusIcon = (status: "pending" | "in_progress" | "resolved") => {
    switch (status) {
      case "resolved":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "in_progress":
        return <PlayCircle className="w-4 h-4 text-blue-400 animate-pulse" />;
      case "pending":
      default:
        return <Clock className="w-4 h-4 text-amber-400" />;
    }
  };

  const getStatusBadge = (status: "pending" | "in_progress" | "resolved") => {
    switch (status) {
      case "resolved":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "in_progress":
        return "bg-blue-500/10 border-blue-500/20 text-blue-400";
      case "pending":
      default:
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
    }
  };

  const filteredComplaints = complaints.filter(c => {
    if (filterStatus === "All") return true;
    return c.status === filterStatus.toLowerCase().replace(" ", "_");
  });

  return (
    <div className="space-y-6">
      
      {/* Tab Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-blue-500" />
            Complaints & Grievance Desk
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {user?.role === "admin" 
              ? "Oversee and resolve all registered society complaints." 
              : "Register maintenance, utility, or cleaning grievances directly with society admins."}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          {user?.role === "member" && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              File New Complaint
            </button>
          )}
          <button
            onClick={fetchComplaints}
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

      {/* Complaint Filing Form (Toggleable) */}
      {showForm && user?.role === "member" && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl animate-slideup max-w-xl">
          <h3 className="text-md font-bold text-white mb-4">File a Grievance</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Complaint Title</label>
              <input
                type="text"
                required
                className="w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                placeholder="e.g. Water leakage on ceiling, Elevator door stuck"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Category</label>
              <select
                className="w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Cleanliness">Cleanliness</option>
                <option value="Security">Security</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Description</label>
              <textarea
                required
                rows={4}
                className="w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                placeholder="Describe the issue in detail, specifying floor level or spot location..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-300 mt-2"
            >
              {submitting ? "Filing Ticket..." : "Submit Complaint"}
            </button>
          </form>
        </div>
      )}

      {/* Filter and Content sections */}
      <div className="space-y-4">
        
        {/* Filters Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/40 p-4 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter className="w-4 h-4" />
            <span>Filter List:</span>
          </div>

          <div className="flex gap-2">
            {["All", "Pending", "In Progress", "Resolved"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  filterStatus === status
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-slate-900 border-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints Listing */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm">Fetching grievances list...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => (
              <div 
                key={complaint.id}
                className="glass-panel p-5 rounded-2xl border border-white/10 shadow-lg space-y-4 hover:border-white/15 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${getStatusBadge(complaint.status)}`}>
                      {getStatusIcon(complaint.status)}
                      {complaint.status.replace("_", " ")}
                    </span>
                    <span className="bg-slate-900 border border-white/5 text-slate-400 text-[10px] font-semibold px-2.5 py-1 rounded-md">
                      {complaint.category}
                    </span>
                  </div>
                  
                  <span className="text-[10px] text-slate-500">
                    Filed on {new Date(complaint.created_at).toLocaleDateString("en-IN", {
                      year: "numeric", month: "short", day: "numeric"
                    })}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-md font-bold text-white">{complaint.title}</h3>
                  <p className="text-slate-300 text-xs leading-relaxed">{complaint.description}</p>
                </div>

                {/* Meta details footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3.5 border-t border-white/5">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5 text-blue-400" />
                    <span>Resident: <strong className="text-slate-300">{complaint.user?.username || "Unknown"}</strong></span>
                    <span>• Block: <strong className="text-slate-300">{complaint.user?.block || "Unknown"}</strong></span>
                    <span>• House: <strong className="text-slate-300">{complaint.user?.house_number || "Unknown"}</strong></span>
                    <span>• Ph: <strong className="text-slate-300">{complaint.user?.phone_number || "N/A"}</strong></span>
                  </div>

                  {/* Admin actions status picker */}
                  {user?.role === "admin" && (
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase">Update Status:</label>
                      <select
                        className="bg-slate-950 border border-white/10 rounded-lg py-1 px-3.5 text-xs text-white focus:outline-none focus:border-blue-500 transition cursor-pointer"
                        value={complaint.status}
                        onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  )}
                </div>

              </div>
            ))}

            {filteredComplaints.length === 0 && (
              <div className="glass-panel py-16 text-center text-slate-500 rounded-2xl border border-white/5">
                <ClipboardList className="w-12 h-12 text-slate-700 mx-auto mb-2" />
                <p className="text-sm">No complaints found matching this category.</p>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
