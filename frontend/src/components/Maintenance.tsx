"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Clock,
  Receipt,
  RefreshCw,
  Award,
  Calendar,
} from "lucide-react";

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

export default function Maintenance({
  token,
  user,
}: MaintenanceProps) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Multiple selected bills
  const [selectedBills, setSelectedBills] = useState<Bill[]>([]);

  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchBills = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/maintenance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  // Total selected amount
  const totalSelectedAmount = selectedBills.reduce(
    (sum, bill) => sum + bill.amount,
    0
  );

  // Handle bill selection
  const handleBillSelection = (bill: Bill) => {
    // Only prevent already paid bills
    if (bill.status === "paid") return;

    setSelectedBills((prev) => {
      const alreadySelected = prev.find((b) => b.id === bill.id);

      if (alreadySelected) {
        return prev.filter((b) => b.id !== bill.id);
      }

      return [...prev, bill];
    });
  };

  // Razorpay payment
  const handleCheckoutSubmit = async () => {
    if (selectedBills.length === 0) {
      setError("Please select at least one month.");
      return;
    }

    try {
      setPaying(true);
      setError("");

      const res = await fetch(
        `${API_URL}/api/payments/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: totalSelectedAmount,
            bill_ids: selectedBills.map((b) => b.id),
          }),
        }
      );

      const order = await res.json();

      if (!res.ok) {
        throw new Error(order.detail || "Failed to create order");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

        amount: order.amount,
        currency: order.currency,
        order_id: order.id,

        name: "Dev Homes Welfare Society",

        description: "Maintenance Charges Payment",

        handler: async function (response: any) {
          try {
            const verifyRes = await fetch(
              `${API_URL}/api/payments/verify-payment`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  ...response,
                  bill_ids: selectedBills.map((b) => b.id),
                }),
              }
            );

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              setPaySuccess(true);

              // Clear selected bills
              setSelectedBills([]);

              // Refresh bills
              fetchBills();
            } else {
              setError("Payment verification failed");
            }
          } catch (err) {
            console.log(err);
            setError("Verification failed");
          }
        },

        theme: {
          color: "#2563eb",
        },
      };

      const razorpay = new (window as any).Razorpay(options);

      razorpay.on("payment.failed", function () {
        setError("Payment failed");
      });

      razorpay.open();

    } catch (err: any) {
      console.log(err);
      setError(err.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const getGridColorClass = (
    status: "paid" | "unpaid" | "upcoming"
  ) => {
    switch (status) {
      case "paid":
        return "bg-emerald-500 border-emerald-400 text-white shadow-emerald-950/20";

      case "unpaid":
        return "bg-rose-500 border-rose-400 text-white shadow-rose-950/20 hover:scale-105 cursor-pointer";

      case "upcoming":
      default:
        return "bg-amber-500 border-amber-400 text-white shadow-amber-950/20 hover:scale-105 cursor-pointer";
    }
  };

  const outstandingDues = bills
    .filter((b) => b.status !== "paid")
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-500" />
            Maintenance Charges
          </h2>

          <p className="text-slate-400 text-sm mt-1">
            Select unpaid month boxes and pay together through Razorpay.
          </p>
        </div>

        <button
          onClick={fetchBills}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-semibold border border-white/5 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Reload
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

          <p className="text-sm">
            Fetching billing database...
          </p>
        </div>
      ) : (
        <>
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Outstanding */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between shadow-xl">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase">
                  Total Unpaid Dues
                </p>

                <p className="text-3xl font-extrabold text-white mt-1">
                  ₹{outstandingDues.toLocaleString()}
                </p>
              </div>

              <div className="p-3 rounded-xl border bg-rose-500/10 border-rose-500/20 text-rose-400">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            {/* Monthly Rate */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between shadow-xl">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase">
                  Monthly Charge Rate
                </p>

                <p className="text-3xl font-extrabold text-white mt-1">
                  ₹{(bills[0]?.amount || 1200).toLocaleString()}
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-3 rounded-xl">
                <Receipt className="w-6 h-6" />
              </div>
            </div>

            {/* Unit */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between shadow-xl">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase">
                  Assigned Unit
                </p>

                <p className="text-xl font-bold text-white mt-2 truncate">
                  {user?.block || "Block A"} -{" "}
                  {user?.house_number || "N/A"}
                </p>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-xl">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Bills Grid */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl space-y-4">

            <div>
              <h3 className="text-md font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-400" />
                Year 2026 Billing Grid
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Select unpaid months and pay together.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-950/60 border border-red-500/30 text-red-300 rounded-lg text-xs">
                {error}
              </div>
            )}

            {paySuccess && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs">
                Payment successful.
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">

              {bills.map((bill) => {
                const monthName = MONTH_NAMES[bill.month - 1];

                const colorClass = getGridColorClass(
                  bill.status
                );

                const isSelected = selectedBills.some(
                  (b) => b.id === bill.id
                );

                return (
                  <div
                    key={bill.id}
                    onClick={() =>
                      handleBillSelection(bill)
                    }
                    className={`relative overflow-hidden p-4 rounded-xl border flex flex-col justify-between items-center text-center transition-all duration-300 shadow-md min-h-[120px] ${colorClass} ${
                      isSelected
                        ? "ring-4 ring-blue-400 scale-105"
                        : ""
                    }`}
                  >

                    {/* Checkbox */}
                    {bill.status !== "paid" && (
                      <div
                        className="absolute top-2 right-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            handleBillSelection(bill)
                          }
                          className="w-4 h-4 accent-blue-500 cursor-pointer"
                        />
                      </div>
                    )}

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

            {/* Selected Payment Section */}
            {selectedBills.length > 0 && (
              <div className="mt-6 p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

                <div>
                  <p className="text-sm text-slate-400">
                    Selected Months
                  </p>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedBills.map((bill) => (
                      <span
                        key={bill.id}
                        className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold"
                      >
                        {MONTH_NAMES[bill.month - 1]}{" "}
                        {bill.year}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end">
                  <p className="text-slate-400 text-xs uppercase">
                    Total Payable
                  </p>

                  <p className="text-3xl font-extrabold text-white">
                    ₹{totalSelectedAmount}
                  </p>

                  <button
                    onClick={handleCheckoutSubmit}
                    disabled={paying}
                    className="mt-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition"
                  >
                    {paying
                      ? "Processing..."
                      : "Pay with Razorpay"}
                  </button>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/5 text-xs text-slate-400">

              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-emerald-500 border border-emerald-400 inline-block" />
                Paid Month
              </span>

              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-rose-500 border border-rose-400 inline-block" />
                Unpaid Month
              </span>

              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-amber-500 border border-amber-400 inline-block" />
                Future Unpaid Month
              </span>
            </div>
          </div>

          {/* Receipt History */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl space-y-4">

            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-500" />
              Receipt History
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">

                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-semibold">
                    <th className="py-3 px-4">
                      Billing Month
                    </th>

                    <th className="py-3 px-4">
                      Paid Date
                    </th>

                    <th className="py-3 px-4">
                      Amount
                    </th>

                    <th className="py-3 px-4">
                      Transaction ID
                    </th>

                    <th className="py-3 px-4">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {bills
                    .filter((b) => b.status === "paid")
                    .map((bill) => (
                      <tr
                        key={bill.id}
                        className="text-slate-300 hover:bg-white/5 transition"
                      >

                        <td className="py-3.5 px-4 font-semibold text-white">
                          {MONTH_NAMES[bill.month - 1]}{" "}
                          {bill.year}
                        </td>

                        <td className="py-3.5 px-4 text-slate-400">
                          {bill.payment_date
                            ? new Date(
                                bill.payment_date
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
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

                  {bills.filter((b) => b.status === "paid")
                    .length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-slate-500"
                      >
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}