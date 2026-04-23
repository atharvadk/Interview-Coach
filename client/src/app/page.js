"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import Link from "next/link";
import { Brain, Mic, Target, LineChart, Code2, Database, Briefcase, Cpu, Cloud } from "lucide-react";

export default function LandingPage() {
  const domains = [
    { name: "AI/ML", icon: Brain, color: "text-purple-400", bg: "bg-purple-400/10" },
    { name: "Data Structures", icon: Code2, color: "text-blue-400", bg: "bg-blue-400/10" },
    { name: "System Design", icon: Database, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { name: "Frontend", icon: Target, color: "text-pink-400", bg: "bg-pink-400/10" },
    { name: "Backend", icon: Cpu, color: "text-orange-400", bg: "bg-orange-400/10" },
    { name: "DevOps", icon: Cloud, color: "text-cyan-400", bg: "bg-cyan-400/10" },
    { name: "HR & Behavioral", icon: Briefcase, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  ];

  const features = [
    { title: "Real-time Emotion Analysis", icon: Brain, desc: "Get feedback on your confidence and non-verbal cues using advanced face APIs." },
    { title: "Voice Transcription", icon: Mic, desc: "Speak your answers naturally while we transcribe and evaluate your technical vocabulary." },
    { title: "Adaptive Difficulty", icon: Target, desc: "Questions adapt to your chosen difficulty matching real interview conditions." },
    { title: "Detailed Analytics", icon: LineChart, desc: "Review your performance trends over time and identify exact areas to improve." }
  ];

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-4 pt-24 pb-32 overflow-hidden flex flex-col items-center text-center">
          <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[60px] pointer-events-none"></div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 relative z-10"
          >
            Practice smarter, <br className="hidden md:block"/>
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              get hired.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 relative z-10"
          >
            Master your next interview with our AI-powered coach. Experience realistic scenarios,
            real-time feedback, and comprehensive analytics.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 relative z-10"
          >
            <Link href="/register" className="btn-primary text-lg px-8 py-3">
              Start Practicing Free
            </Link>
            <Link href="/login" className="btn-secondary text-lg px-8 py-3 bg-slate-800/50 backdrop-blur-sm">
              Sign In
            </Link>
          </motion.div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-slate-900/50 border-t border-slate-800/50 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Choose Domain", desc: "Select your field and desired difficulty level. Upload an optional resume for context." },
                { step: "2", title: "Answer Questions", desc: "Respond via webcam & mic. Our AI analyzes your voice and facial expressions in real-time." },
                { step: "3", title: "Get Feedback", desc: "Receive immediate semantic scoring, keyword gap analysis, and a comprehensive report." }
              ].map((item, i) => (
                <div key={i} className="glass-card rounded-2xl p-8 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
                  <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 font-bold text-xl mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Domains & Features */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={containerVars}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid lg:grid-cols-2 gap-16"
          >
            {/* Features */}
            <div>
              <h2 className="text-3xl font-bold mb-8 text-white">Supercharge Your Prep</h2>
              <div className="space-y-6">
                {features.map((feat, i) => (
                  <motion.div variants={itemVars} key={i} className="flex gap-4 p-4 rounded-xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700/50">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <feat.icon className="w-5 h-5 text-blue-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">{feat.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Domains */}
            <div>
              <h2 className="text-3xl font-bold mb-8 text-white">Supported Domains</h2>
              <div className="flex flex-wrap gap-3">
                {domains.map((domain, i) => (
                  <motion.div 
                    variants={itemVars}
                    key={i} 
                    className={`flex items-center gap-2 px-4 py-3 rounded-full border border-slate-700/50 ${domain.bg} backdrop-blur-sm cursor-default hover:border-slate-500/50 transition-colors`}
                  >
                    <domain.icon className={`w-4 h-4 ${domain.color}`} />
                    <span className="text-sm font-medium text-slate-200">{domain.name}</span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-12 glass-panel p-6 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Over 1M+ Questions</h4>
                  <p className="text-sm text-slate-400">Our LLMs generate contextual problems on the fly.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

      </main>
    </div>
  );
}
