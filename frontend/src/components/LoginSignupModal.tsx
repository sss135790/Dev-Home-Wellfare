"use client";

import React, { useState } from "react";
import { User, Shield, Key, Mail, Phone, Home, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";

interface LoginSignupModalProps {
  onSuccess: (token: string, user: any) => void;
}

export default function LoginSignupModal({ onSuccess }: LoginSignupModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"member" | "admin">("member");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [gmail, setGmail] = useState("");
  const [phone, setPhone] = useState("");
  const [block, setBlock] = useState("Block A");
  const [houseNumber, setHouseNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleSendOtp = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: gmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to send OTP");
      }
      setOtpSent(true);
      setSimulatedOtp(data.otp);
      setMessage(`OTP sent Successfully ! `);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const payload: any = {
      username,
      password,
      role,
    };

    if (role === "admin") {
      payload.otp = otp;
    }

    if (!isLogin) {
      payload.gmail = gmail;
      payload.phone_number = phone;
      payload.block = block;
      payload.house_number = houseNumber;
    }

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      onSuccess(data.access_token, data.user);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg glass-panel rounded-2xl overflow-hidden shadow-2xl animate-slideup p-6 md:p-8 border border-white/10">
        
        {/* Branding header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            Dev Homes Wellfare Society
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {isLogin ? "Log in to access your resident portal" : "Sign up for society membership"}
          </p>
        </div>

        {/* Auth Toggle Tabs */}
        <div className="flex bg-slate-900/80 rounded-lg p-1 mb-6 border border-white/5">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
              isLogin ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-white"
            }`}
            onClick={() => {
              setIsLogin(true);
              setError("");
              setMessage("");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
              !isLogin ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-white"
            }`}
            onClick={() => {
              setIsLogin(false);
              setError("");
              setMessage("");
            }}
          >
            Register
          </button>
        </div>

        {/* Error / Success Announcements */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-500/30 text-red-300 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                className="w-full bg-slate-900 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                placeholder="e.g. johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Registration Fields */}
          {!isLogin && (
            <>
              {/* Gmail & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      className="w-full bg-slate-900 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                      placeholder="john@gmail.com"
                      value={gmail}
                      onChange={(e) => setGmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Phone Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      className="w-full bg-slate-900 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                      placeholder="+9198765..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Block & House Number */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Block</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Home className="w-4 h-4" />
                    </span>
                    <select
                      className="w-full bg-slate-900 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                    >
                      <option value="Block A">Block A</option>
                      <option value="Block B">Block B</option>
                      <option value="Block C">Block C</option>
                      <option value="Block D">Block D</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">House Number</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-900 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    placeholder="e.g. 102, 304-A"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Role Choice */}
          <div>
            {isLogin ? <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Sign In As</label> : <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Register As</label>}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className={`py-3 px-4 border rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition ${
                  role === "member"
                    ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/5"
                    : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
                }`}
                onClick={() => setRole("member")}
              >
                <User className="w-4 h-4" />
                Member
              </button>
              <button
                type="button"
                className={`py-3 px-4 border rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition ${
                  role === "admin"
                    ? "bg-amber-600/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/5"
                    : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
                }`}
                onClick={() => setRole("admin")}
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full bg-slate-900 border border-white/10 rounded-lg py-2.5 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Admin Role OTP Requirement (simulated) */}
          {role === "admin" && !isLogin && (
            <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4 space-y-3 animate-slideup">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-amber-200 text-xs leading-normal">
                  Administrator status requires validation. Click the button to simulate sending an OTP code to ADMIN's gmail account.
                </p>
              </div>

              {/* Ask for phone number on login too if admin selected */}
              {isLogin && (
                <div>
                  <label className="block text-[10px] font-semibold text-amber-300 uppercase mb-1">Registered Phone Number</label>
                  <input
                    type="tel"
                    required
                    className="w-full bg-slate-900/60 border border-amber-500/20 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 transition"
                    placeholder="Enter phone to request OTP"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  required={role === "admin"}
                  className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 text-slate-950 font-semibold px-4 py-2 rounded-lg text-xs transition uppercase tracking-wider"
                >
                  Send OTP
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold py-3 px-4 rounded-lg text-sm transition-all duration-300 mt-6 shadow-lg shadow-blue-500/10 focus:outline-none"
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Register & Start"}
          </button>
        </form>

        {/* Demo Helper Text */}
        <div className="mt-6 pt-4 border-t border-white/5 text-center">
          <p className="text-xs text-slate-500 leading-relaxed">
            Made by K2 Owner®
          </p>
        </div>

      </div>
    </div>
  );
}
