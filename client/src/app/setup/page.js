"use client";

import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useInterview } from "@/context/InterviewContext";
import { sessionApi, questionsApi } from "@/utils/api";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Upload } from "lucide-react";

export default function Setup() {
  const router = useRouter();
  const { startSession } = useInterview();
  const [domain, setDomain] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionsCount, setQuestionsCount] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resume, setResume] = useState(null);
  const [resumeName, setResumeName] = useState("");
  const fileInputRef = useRef();

  const domains = [
    { id: "AI", label: "Artificial Intelligence" },
    { id: "ML", label: "Machine Learning" },
    { id: "DSA", label: "Data Structures & Algorithms" },
    { id: "OS", label: "Operating Systems" },
    { id: "Java", label: "Java Programming" },
    { id: "FS", label: "Full Stack Web" },
    { id: "HR", label: "HR & Behavioral" },
  ];

  const handleStart = async () => {
    if (!domain) return;
    setIsSubmitting(true);
    try {
      // Start session
      let sessionPayload = { domain, difficulty, totalQuestions: questionsCount };
      // If resume is present, upload it first
      if (resume) {
        const formData = new FormData();
        formData.append('resume', resume);
        // You may need to adjust the endpoint below to match your backend
        const uploadRes = await sessionApi.uploadResume(formData);
        if (uploadRes && uploadRes.resumeUrl) {
          sessionPayload.resumeUrl = uploadRes.resumeUrl;
        }
      }
      const res = await sessionApi.start(sessionPayload);
      // Generate questions (pass sessionId from res)
      const sessionId = res._id || res.id || res.sessionId;
      const questions = await questionsApi.generate(domain, difficulty, sessionId);
      startSession({ ...res, domain, difficulty, totalQuestions: questionsCount, questions });
      router.push("/interview");
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Configure Your Interview</h1>
            <p className="text-slate-400">Tailor the mock interview to your specific needs.</p>
          </div>

          <div className="space-y-8">
            {/* Domain Selection */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-lg font-semibold text-white mb-4">1. Select Domain <span className="text-red-500">*</span></h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {domains.map(d => (
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
              <h2 className="text-lg font-semibold text-white mb-4">2. Select Difficulty</h2>
              <div className="flex gap-4">
                {["Easy", "Medium", "Hard"].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`flex-1 py-3 rounded-xl border text-center transition-all ${
                      difficulty === diff 
                      ? "bg-blue-600 border-blue-500 text-white font-medium shadow-lg shadow-blue-500/25" 
                      : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-lg font-semibold text-white mb-4">3. Number of Questions</h2>
              <div className="flex gap-4">
                {[5, 10, 15].map(cnt => (
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

            {/* Resume Upload - Working */}
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">4. Upload Resume (Optional)</h2>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Beta</span>
              </div>
              <input
                type="file"
                accept="application/pdf"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setResume(e.target.files[0]);
                    setResumeName(e.target.files[0].name);
                  }
                }}
              />
              <div
                className="border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-slate-500 transition-colors cursor-pointer bg-slate-800/20"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <div className="bg-slate-800 p-4 rounded-full mb-4">
                  <Upload className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-300 font-medium mb-1">Click to browse or drag & drop</p>
                <p className="text-slate-500 text-sm">PDF formatting only, max 5MB</p>
                {resumeName && (
                  <span className="mt-2 text-green-400">Selected: {resumeName}</span>
                )}
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                onClick={handleStart}
                disabled={!domain || isSubmitting}
                className={`btn-primary flex items-center justify-center gap-2 h-14 px-8 text-lg ${
                  !domain || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
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
