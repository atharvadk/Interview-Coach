"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Bot, Mail, Lock, Loader2, Eye, EyeOff, Sparkles, BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background">
      {/* --- Left Half: Creative Animated Background --- */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 flex-col justify-center items-center overflow-hidden border-r border-slate-800">
        
        {/* Animated Radial Gradients */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[60px] animate-[spin_10s_linear_infinite]" 
             style={{ animation: "pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[80px]"
             style={{ animation: "pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite reverse" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>

        {/* Floating elements */}
        <div className="relative z-10 w-full max-w-lg px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md mb-6">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Level up your career</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-6">
              Dominate your next <br /> <span className="text-blue-500">Technical Interview</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              Experience the closest thing to reality with our advanced AI evaluator tracking your voice, mood, and knowledge.
            </p>
          </motion.div>

          {/* Feature Badges Layout */}
          <div className="grid grid-cols-2 gap-4 mt-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-md">
              <BrainCircuit className="w-8 h-8 text-indigo-400 mb-3" />
              <h3 className="font-semibold text-slate-200 mb-1">Smart Analytics</h3>
              <p className="text-xs text-slate-500">Uncover your blindspots</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-md">
              <Bot className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="font-semibold text-slate-200 mb-1">Live Coaching</h3>
              <p className="text-xs text-slate-500">Real-time feedback</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* --- Right Half: Auth Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[420px]"
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
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome back</h2>
            <p className="text-slate-400">Sign in to your account to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3.5 pl-11 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-300">Password</label>
                  <a href="#" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3.5 pl-11 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold h-12 rounded-xl flex items-center justify-center tracking-wide transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] disabled:opacity-50 disabled:hover:bg-blue-600"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In to Dashboard"}
            </button>

            <p className="text-center text-slate-400 mt-8">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-white font-semibold hover:text-blue-400 transition-colors underline decoration-slate-600 hover:decoration-blue-400 underline-offset-4">
                Register here
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
