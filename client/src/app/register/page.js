"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Bot, Mail, Lock, User, Loader2, Eye, EyeOff, Rocket, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await register(name, email, password);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background">
      {/* --- Left Half: Creative Animated Background --- */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 flex-col justify-center items-center overflow-hidden border-r border-slate-800">
        
        {/* Animated Radial Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-[spin_12s_linear_infinite]" 
             style={{ animation: "pulse 10s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px] mix-blend-screen"
             style={{ animation: "pulse 14s cubic-bezier(0.4, 0, 0.6, 1) infinite reverse" }}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3341551a_1px,transparent_1px),linear-gradient(to_bottom,#3341551a_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Floating elements */}
        <div className="relative z-10 w-full max-w-lg px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md mb-6">
              <Rocket className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">Fast-track your success</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-6">
              Join the future of <br /> <span className="text-purple-400">Interview Training</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              Create an account today to access unlimited mock sessions, live emotional feedback, and comprehensive analytics.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 mt-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-md">
              <Target className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="font-semibold text-slate-200 mb-1">Target Weaknesses</h3>
              <p className="text-xs text-slate-500">Perfect your skills</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* --- Right Half: Auth Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[420px] py-8"
        >
          {/* Fixed Logo / Brand Overlap */}
          <div className="flex flex-col items-start mb-10">
            <Link href="/" className="group flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 group-hover:bg-blue-500 transition-colors">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-3xl whitespace-nowrap tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                AI Coach
              </span>
            </Link>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Create an account</h2>
            <p className="text-slate-400">Fill in the details below to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-500 transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3.5 pl-11 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-500 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3.5 pl-11 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-500 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3.5 pl-11 pr-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-500 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-slate-900 border rounded-xl px-4 py-3.5 pl-11 pr-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all shadow-sm ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-slate-700/80 focus:ring-purple-500/50 focus:border-purple-500'}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-sm font-medium mt-1">
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-8 bg-purple-600 hover:bg-purple-500 text-white font-semibold h-12 rounded-xl flex items-center justify-center tracking-wide transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] disabled:opacity-50 disabled:hover:bg-purple-600"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
            </button>

            <p className="text-center text-slate-400 mt-8">
              Already have an account?{" "}
              <Link href="/login" className="text-white font-semibold hover:text-purple-400 transition-colors underline decoration-slate-600 hover:decoration-purple-400 underline-offset-4">
                Sign in here
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
