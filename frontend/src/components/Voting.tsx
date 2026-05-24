"use client";

import React, { useState, useEffect } from "react";
import { Vote, PlusCircle, CheckCircle, RefreshCw, BarChart2, Calendar, AlertCircle } from "lucide-react";

interface Poll {
  id: number;
  title: string;
  description: string;
  options: string[];
  closed: boolean;
  created_at: string;
  results: { [key: string]: number };
  has_voted: boolean;
  voted_option: string | null;
}

interface VotingProps {
  token: string;
  user: any;
}

export default function Voting({ token, user }: VotingProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Create Poll Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [optionsText, setOptionsText] = useState("Yes\nNo");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchPolls = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/polls`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to fetch polls");
      }
      setPolls(data);
    } catch (err: any) {
      setError(err.message || "Failed to load voting polls");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const handleVoteSubmit = async (pollId: number, selectedOption: string) => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API_URL}/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ selected_option: selectedOption })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to submit vote");
      }

      setSuccess("Your vote has been counted!");
      // Reload polls to get updated results and has_voted status
      fetchPolls();
    } catch (err: any) {
      setError(err.message || "Failed to cast vote");
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const parsedOptions = optionsText
      .split("\n")
      .map(o => o.trim())
      .filter(o => o.length > 0);

    if (parsedOptions.length < 2) {
      setError("Please input at least 2 voting options.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/polls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          options: parsedOptions
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to create poll");
      }

      setSuccess("New decision poll created!");
      setTitle("");
      setDescription("");
      setOptionsText("Yes\nNo");
      setShowForm(false);
      fetchPolls();
    } catch (err: any) {
      setError(err.message || "Failed to build poll");
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotalVotes = (results: { [key: string]: number }) => {
    return Object.values(results).reduce((a, b) => a + b, 0);
  };

  const calculatePercentage = (count: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Vote className="w-6 h-6 text-blue-500" />
            Decision Voting
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {user?.role === "admin" 
              ? "Publish community voting campaigns for resident polls." 
              : "Participate in society decisions. You can vote only once per decision. Choices are final."}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          {user?.role === "admin" && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Create Decision Poll
            </button>
          )}
          <button
            onClick={fetchPolls}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-semibold border border-white/5 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-950/60 border border-red-500/30 text-red-300 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs">
          {success}
        </div>
      )}

      {/* Create Poll Panel (Admin Only) */}
      {showForm && user?.role === "admin" && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl animate-slideup max-w-xl">
          <h3 className="text-md font-bold text-white mb-4">Build a New Community Poll</h3>
          
          <form onSubmit={handleCreatePoll} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Proposal Title</label>
              <input
                type="text"
                required
                className="w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                placeholder="e.g. Gym equipment upgrade budget"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Context / Description</label>
              <textarea
                required
                rows={3}
                className="w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                placeholder="Details of the proposal, cost splits, benefits..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Voting Options (One per line)</label>
              <textarea
                required
                rows={4}
                className="w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 font-mono transition"
                placeholder="Yes&#10;No&#10;Abstain"
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Input at least two choices. Empty lines will be skipped.</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-300 mt-2"
            >
              {submitting ? "Publishing Poll..." : "Publish Decision Poll"}
            </button>
          </form>
        </div>
      )}

      {/* Poll Cards Listing */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">Fetching decision campaigns...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {polls.map((poll) => {
            const totalVotes = calculateTotalVotes(poll.results);
            
            return (
              <div 
                key={poll.id}
                className="glass-panel p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col justify-between hover:border-white/15 transition-all duration-300"
              >
                
                {/* Header status */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Opened {new Date(poll.created_at).toLocaleDateString()}
                    </span>
                    <span className="font-bold uppercase bg-slate-900 border border-white/5 px-2 py-0.5 rounded text-slate-400">
                      {totalVotes} {totalVotes === 1 ? "Vote" : "Votes"} Cast
                    </span>
                  </div>

                  <h3 className="text-md font-bold text-white leading-snug">{poll.title}</h3>
                  <p className="text-slate-300 text-xs leading-relaxed">{poll.description}</p>
                </div>

                {/* Vote Casting / Result Section */}
                <div className="mt-6 space-y-4 pt-4 border-t border-white/5">
                  {poll.has_voted ? (
                    // Display results if already voted
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] text-emerald-400">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>You voted: <strong className="uppercase">{poll.voted_option}</strong> (Votes are final)</span>
                      </div>

                      {/* Display Progress bars */}
                      <div className="space-y-2 pt-2">
                        {poll.options.map((opt) => {
                          const votes = poll.results[opt] || 0;
                          const pct = calculatePercentage(votes, totalVotes);
                          const isVotedChoice = poll.voted_option === opt;
                          
                          return (
                            <div key={opt} className="text-xs">
                              <div className="flex justify-between font-semibold text-slate-300 mb-1">
                                <span className={isVotedChoice ? "text-emerald-400 flex items-center gap-1" : ""}>
                                  {opt} {isVotedChoice && <span className="text-[9px] px-1 py-0.2 bg-emerald-500/20 text-emerald-400 font-bold uppercase rounded">You</span>}
                                </span>
                                <span>{pct}% ({votes})</span>
                              </div>
                              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isVotedChoice ? "bg-emerald-500" : "bg-blue-600/70"
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    // Display buttons to cast vote if not yet voted
                    <div>
                      {user?.role === "admin" ? (
                        // Admins can't vote, just show options/results
                        <div className="space-y-3">
                          <p className="text-[10px] text-amber-400 italic">Administrator preview. Cast results shown below:</p>
                          <div className="space-y-2">
                            {poll.options.map((opt) => {
                              const votes = poll.results[opt] || 0;
                              const pct = calculatePercentage(votes, totalVotes);
                              return (
                                <div key={opt} className="text-xs">
                                  <div className="flex justify-between text-slate-400 mb-1">
                                    <span>{opt}</span>
                                    <span>{pct}% ({votes})</span>
                                  </div>
                                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500" style={{ width: `${pct}%` }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        // Resident role can vote
                        <div className="space-y-2">
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Select your option to cast vote:</p>
                          <div className="grid grid-cols-1 gap-2">
                            {poll.options.map((opt) => (
                              <button
                                key={opt}
                                onClick={() => handleVoteSubmit(poll.id, opt)}
                                className="w-full bg-slate-900 border border-white/5 hover:border-blue-500/50 hover:bg-slate-800 text-slate-300 hover:text-white py-2.5 px-4 rounded-xl text-xs font-semibold text-left transition flex items-center justify-between group"
                              >
                                <span>{opt}</span>
                                <Vote className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })}

          {polls.length === 0 && (
            <div className="glass-panel py-20 text-center text-slate-500 rounded-2xl border border-white/5 col-span-2">
              <BarChart2 className="w-12 h-12 text-slate-700 mx-auto mb-2" />
              <p className="text-sm">No community decisions active at this time.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
