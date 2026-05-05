"use client";

import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useInterview } from "@/context/InterviewContext";
import { sessionApi } from "@/utils/api";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Upload } from "lucide-react";

export default function Setup() {
  const router = useRouter();
  const { startSession } = useInterview();
  const [domain, setDomain] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionsCount, setQuestionsCount] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resume, setResume] = useState(null);
  const [resumeName, setResumeName] = useState("");
  const fileInputRef = useRef();

  const domains = [
    { id: "ai", label: "Artificial Intelligence" },
    { id: "ml", label: "Machine Learning" },
    { id: "dsa", label: "Data Structures & Algorithms" },
    { id: "os", label: "Operating Systems" },
    { id: "java", label: "Java Programming" },
    { id: "fullstack", label: "Full Stack Web" },
    { id: "hr", label: "HR & Behavioral" },
  ];

  const handleStart = async () => {
    if (!domain) return;
    setIsSubmitting(true);
    try {
      // Upload resume if provided
      let resumeUrl = null;
      if (resume) {
        const formData = new FormData();
        formData.append("resume", resume);
        const uploadRes = await sessionApi.uploadResume(formData);
        if (uploadRes?.resumeUrl) {
          resumeUrl = uploadRes.resumeUrl;
        }
      }

      // Start session on backend
      const res = await sessionApi.start({
        domain,
        difficulty,
        totalQuestions: questionsCount,
        ...(resumeUrl && { resumeUrl }),
      });

      // Save to context — NO question generation here
      startSession({
        sessionId: res.sessionId,
        domain,
        difficulty,
        totalQuestions: questionsCount,
      });

      // Navigate — interview/page.js will handle question generation
      router.push("/interview");
    } catch (e) {
      console.error("Setup error:", e);
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />

        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Configure Your Interview
            </h1>
            <p className="text-slate-400">
              Tailor the mock interview to your specific needs.
            </p>
          </div>

          <div className="space-y-8">
            {/* Domain Selection */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-lg font-semibold text-white mb-4">
                1. Select Domain <span className="text-red-500">*</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {domains.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDomain(d.id)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      domain === d.id
                        ? "bg-blue-600/20 border-blue-500 text-blue-400 font-medium"
                        : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-lg font-semibold text-white mb-4">
                2. Select Difficulty
              </h2>
              <div className="flex gap-4">
                {["easy", "medium", "hard"].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`flex-1 py-3 rounded-xl border text-center transition-all ${
                      difficulty === diff
                        ? "bg-blue-600 border-blue-500 text-white font-medium shadow-lg shadow-blue-500/25"
                        : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-lg font-semibold text-white mb-4">
                3. Number of Questions
              </h2>
              <div className="flex gap-4">
                {[5, 10, 15].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => setQuestionsCount(cnt)}
                    className={`flex-1 py-3 rounded-xl border text-center transition-all ${
                      questionsCount === cnt
                        ? "bg-blue-600 border-blue-500 text-white font-medium shadow-lg shadow-blue-500/25"
                        : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {cnt} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Resume Upload */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-lg font-semibold text-white mb-4">
                4. Upload Resume{" "}
                <span className="text-slate-500 text-sm font-normal">
                  (optional)
                </span>
              </h2>
              <input
                type="file"
                accept="application/pdf"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setResume(e.target.files[0]);
                    setResumeName(e.target.files[0].name);
                  }
                }}
              />
              <div
                className="border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-slate-500 transition-colors cursor-pointer bg-slate-800/20"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="bg-slate-800 p-4 rounded-full mb-4">
                  <Upload className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-300 font-medium mb-1">
                  Click to browse or drag & drop
                </p>
                <p className="text-slate-500 text-sm">
                  PDF only, max 5MB
                </p>
                {resumeName && (
                  <span className="mt-3 text-sm text-emerald-400 font-medium">
                    ✓ {resumeName}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleStart}
                disabled={!domain || isSubmitting}
                className={`btn-primary flex items-center justify-center gap-2 h-14 px-8 text-lg ${
                  !domain || isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    Start Interview <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}