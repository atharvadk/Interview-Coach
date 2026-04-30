"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react";

export function ScoreCard({ result, onProvideNext }) {
  if (!result) return null;

  const score    = result.composite_score   || 0;
  const semantic = result.semantic_score    || 0;
  const keywords = result.keyword_score     || 0;
  const missing  = result.missing_keywords  || [];
  const feedback = result.feedback          || "";

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 z-10 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
    >
      <div className="glass-card max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
        <div className={`p-6 border-b ${score >= 7.5 
          ? 'bg-emerald-500/10 border-emerald-500/20' 
          : score >= 6 
          ? 'bg-blue-500/10 border-blue-500/20' 
          : 'bg-red-500/10 border-red-500/20'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                Score: {score} <span className="text-slate-400 text-lg">/ 10</span>
              </h3>
              <p className="text-slate-300 font-medium">{feedback}</p>
            </div>
            {score >= 7.5 
              ? <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              : <AlertTriangle className={`w-12 h-12 ${score >= 6 ? 'text-blue-400' : 'text-red-400'}`} />
            }
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="text-slate-400">Semantic Match</span>
              <span className="text-white font-medium">{semantic}/10</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div className="bg-purple-500 h-full rounded-full" 
                style={{ width: `${(semantic / 10) * 100}%` }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="text-slate-400">Keywords Match</span>
              <span className="text-white font-medium">{keywords}/10</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div className="bg-blue-500 h-full rounded-full" 
                style={{ width: `${(keywords / 10) * 100}%` }}></div>
            </div>
          </div>

          {missing.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <p className="text-xs font-semibold text-orange-400 mb-2 uppercase tracking-wider">
                Missed Keywords
              </p>
              <div className="flex flex-wrap gap-2">
                {missing.map(word => (
                  <span key={word} 
                    className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={onProvideNext}
            className="w-full mt-6 btn-primary h-12 flex items-center justify-center gap-2"
          >
            Next Question <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}