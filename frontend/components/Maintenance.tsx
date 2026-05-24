"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, CheckCircle, Clock, Receipt, RefreshCw, X, ShieldAlert, Award, Calendar } from "lucide-react";
import { MONTH_NAMES } from "./Constants";

interface Bill {
  id: number;
  user_id: number;
  month: number;
  year: number;
  amount: number;
  status: "paid" | "unpaid" | "upcoming";
  transaction_id: string | null;
  payment_date: string | null;
}

interface MaintenanceProps {
  token: string;
  user: any;
}

export default function Maintenance({ token, user }: MaintenanceProps) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  
  // Checkout Modal State
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchBills = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/maintenance`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to fetch bills");
      }
      setBills(data);
    } catch (err: any) {
      setError(err.message || "Failed to load maintenance bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handlePayClick = (bill: Bill) => {
    if (bill.status === "paid" || bill.status === "upcoming") return;
    setSelectedBill(bill);
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setCardName(user?.username || "");
    setPaySuccess(false);
    setError("");
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;

    setPaying(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/maintenance/${selectedBill.id}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          card_number: cardNumber,
          expiry: expiry,
          cvv: cvv,
          cardholder_name: cardName
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Payment failed");
      }

      setPaySuccess(true);
      
      // Update local state
      setBills(bills.map(b => b.id === selectedBill.id ? data : b));
      
      // Close modal after 1.5s
      setTimeout(() => {
        setSelectedBill(null);
        setPaySuccess(false);
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Payment transaction failed");
    } finally {
      setPaying(false);
    }
  };

  const getGridColorClass = (status: "paid" | "unpaid" | "upcoming") => {
    switch (status) {
      case "paid":
        return "bg-emerald-500 border-emerald-400 text-white shadow-emerald-950/20";
      case "unpaid":
        return "bg-rose-500 border-rose-400 text-white animate-pulse shadow-rose-950/20 hover:scale-105 cursor-pointer";
      case "upcoming":
      default:
        return "bg-white border-slate-200 text-slate-900 shadow-slate-950/5 cursor-not-allowed opacity-80";
    }
  };

  const outstandingDues = bills
    .filter(b => b.status === "unpaid")
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6">
      
      {/* Tab Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-500" />
            Maintenance Charges
          </h2>
          <p className="text-slate-400 text-sm mt-1">Review and settle your monthly maintenance dues. Pay by clicking unpaid blocks.</p>
        </div>
        <button
          onClick={fetchBills}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-semibold border border-white/5 transition self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Reload
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">Fetching billing database...</p>
        </div>
      ) : (
        <>
          {/* Dashboard Dues Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between shadow-xl">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase">Total Unpaid Dues</p>
                <p className="text-3xl font-extrabold text-white mt-1">₹{outstandingDues.toLocaleString()}</p>
              </div>
              <div className={`p-3 rounded-xl border ${outstandingDues > 0 ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"}`}>
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between shadow-xl">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase">Monthly Charge Rate</p>
                <p className="text-3xl font-extrabold text-white mt-1">
                  ₹{(bills[0]?.amount || 1200).toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-3 rounded-xl">
                <Receipt className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between shadow-xl">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase">Assigned Unit</p>
                <p className="text-xl font-bold text-white mt-2 truncate">
                  {user?.block || "Block A"} - {user?.house_number || "N/A"}
                </p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-xl">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Month Blocks Grid */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl space-y-4">
            <div>
              <h3 className="text-md font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-400" />
                Year 2026 Billing Grid
              </h3>
              <p className="text-xs text-slate-400 mt-1">Status representation of each monthly block. Click on red blocks to pay.</p>
            </div>

            {error && (
              <div className="p-3 bg-red-950/60 border border-red-500/30 text-red-300 rounded-lg text-xs">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {bills.map((bill) => {
                const monthName = MONTH_NAMES[bill.month - 1];
                const colorClass = getGridColorClass(bill.status);
                
                return (
                  <div
                    key={bill.id}
                    onClick={() => handlePayClick(bill)}
                    className={`relative overflow-hidden p-4 rounded-xl border flex flex-col justify-between items-center text-center transition-all duration-300 shadow-md min-h-[110px] ${colorClass}`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">
                      {monthName}
                    </span>
                    <span className="text-md font-extrabold mt-1">
                      ₹{bill.amount}
                    </span>
                    <span className="text-[9px] uppercase font-bold mt-2 px-2 py-0.5 rounded-full bg-black/15">
                      {bill.status}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Color Legend */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/5 text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-emerald-500 border border-emerald-400 inline-block" />
                Paid Month Block
              </span>
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-rose-500 border border-rose-400 inline-block" />
                Unpaid Month Block
              </span>
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-white border border-slate-200 inline-block" />
                Upcoming Month Block
              </span>
            </div>

          </div>

          {/* Payment Receipts History */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl space-y-4">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-500" />
              Receipt History
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-semibold">
                    <th className="py-3 px-4">Billing Month</th>
                    <th className="py-3 px-4">Paid Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bills
                    .filter(b => b.status === "paid")
                    .map((bill) => (
                      <tr key={bill.id} className="text-slate-300 hover:bg-white/5 transition">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {MONTH_NAMES[bill.month - 1]} {bill.year}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {bill.payment_date 
                            ? new Date(bill.payment_date).toLocaleDateString("en-IN", {
                                year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
                              })
                            : "N/A"}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-400">
                          ₹{bill.amount}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">
                          {bill.transaction_id}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase">
                            Success
                          </span>
                        </td>
                      </tr>
                    ))}
                  {bills.filter(b => b.status === "paid").length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No transactions found. Pay unpaid billing blocks to create history.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </>
      )}

      {/* Credit Card Checkout Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 md:p-8 animate-slideup space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-500" />
                <h3 className="text-md font-bold text-white">Maintenance Checkout</h3>
              </div>
              <button 
                onClick={() => setSelectedBill(null)}
                disabled={paying}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error messaging */}
            {error && (
              <div className="p-3 bg-red-950/60 border border-red-500/30 text-red-300 rounded-lg text-xs">
                {error}
              </div>
            )}

            {/* Processing and Success templates */}
            {paySuccess ? (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-3 animate-pulse">
                <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-400">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-md font-bold text-white mt-2">Payment Successful!</h4>
                <p className="text-xs text-slate-400">Your maintenance receipt has been logged.</p>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                
                {/* Dues details info block */}
                <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                  <div>
                    <p className="text-slate-400 font-semibold uppercase">Billing Month</p>
                    <p className="text-sm font-bold text-white mt-1">
                      {MONTH_NAMES[selectedBill.month - 1]} {selectedBill.year}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 font-semibold uppercase">Payment Dues</p>
                    <p className="text-sm font-bold text-emerald-400 mt-1">₹{selectedBill.amount}</p>
                  </div>
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Card Number</label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono transition"
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={(e) => {
                      // format raw numbers
                      const val = e.target.value.replace(/\D/g, "");
                      const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
                      setCardNumber(formatted);
                    }}
                  />
                </div>

                {/* Expiry / CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Expiration Date</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono transition"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        const formatted = val.length > 2 ? `${val.slice(0,2)}/${val.slice(2,4)}` : val;
                        setExpiry(formatted);
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Security Code (CVV)</label>
                    <input
                      type="password"
                      required
                      maxLength={3}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono transition"
                      placeholder="•••"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 p-3 bg-blue-950/20 border border-blue-500/20 text-blue-300 rounded-lg text-[10px] items-start">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-blue-400" />
                  <p className="leading-relaxed">This is a sandbox portal. Please do not input your real credit card details. Submit any simulated values to test.</p>
                </div>

                {/* Pay Button */}
                <button
                  type="submit"
                  disabled={paying}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-lg shadow-emerald-500/10 transition duration-300 mt-4 uppercase tracking-wider"
                >
                  {paying ? "Processing Payment..." : `Pay Dues: ₹${selectedBill.amount}`}
                </button>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
