"use client";

import { useEffect, useState } from "react";
import { Zap, CheckCircle2, Loader } from "lucide-react";

export function PrepareLoader({ totalQuestions, domain, difficulty }) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [step, setStep] = useState("preparing"); // preparing, ready

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadedCount((prev) => {
        if (prev < totalQuestions) {
          return prev + 1;
        }
        setStep("ready");
        return prev;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [totalQuestions]);

  const progress = (loadedCount / totalQuestions) * 100;
  const isComplete = loadedCount === totalQuestions;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 mb-6 animate-pulse">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Preparing Your Interview
            </h1>
            <p className="text-slate-400">
              Getting everything ready for you
            </p>
          </div>

          {/* Config Summary */}
          <div className="glass-card p-4 rounded-xl mb-8 space-y-2 border border-slate-700/50">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Domain</span>
              <span className="text-white font-medium capitalize">{domain}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Difficulty</span>
              <span className="text-white font-medium capitalize">{difficulty}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Questions</span>
              <span className="text-white font-medium">{totalQuestions}</span>
            </div>
          </div>

          {/* Questions Loading */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">
                Generating Questions
              </h3>
              <span className="text-xs text-blue-400 font-medium">
                {loadedCount}/{totalQuestions}
              </span>
            </div>

            {/* Main Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden mb-6 border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300 ease-out shadow-lg shadow-blue-500/50"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Question Items */}
            <div className="space-y-2">
              {Array.from({ length: totalQuestions }).map((_, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                    idx < loadedCount
                      ? "bg-emerald-500/10 border border-emerald-500/30"
                      : idx === loadedCount
                        ? "bg-blue-500/10 border border-blue-500/30"
                        : "bg-slate-800/50 border border-slate-700/30"
                  }`}
                >
                  {idx < loadedCount ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  ) : idx === loadedCount ? (
                    <Loader className="w-5 h-5 text-blue-400 flex-shrink-0 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-600 flex-shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${
                    idx < loadedCount
                      ? "text-emerald-300"
                      : idx === loadedCount
                        ? "text-blue-300"
                        : "text-slate-500"
                  }`}>
                    Question {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Status */}
          <div className="text-center">
            {isComplete ? (
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/50">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-sm text-emerald-300 font-medium">
                  Ready to begin!
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                This typically takes 10-20 seconds...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
