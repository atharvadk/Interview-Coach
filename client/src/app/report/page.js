"use client";

import { useEffect, useState, Suspense } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { reportApi } from "@/utils/api";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download, RefreshCcw, CheckCircle, XCircle, TrendingUp, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

function ReportContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQs, setExpandedQs] = useState({});

  useEffect(() => {
    if (!sessionId) {
      if (loading) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(false);
      }
      return;
    }
    const fetchReport = async () => {
      try {
        const data = await reportApi.get(sessionId);
        setReport(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [sessionId, loading]);

  const toggleQ = (id) => {
    setExpandedQs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
     return (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 rounded-full text-blue-500 animate-spin" />
            <p className="text-slate-400">Generating your comprehensive report...</p>
          </div>
        </div>
    );
  }

  if (!report) {
    return (
        <div className="flex-1 flex items-center justify-center">
           <div className="text-center">
             <h2 className="text-2xl font-bold text-white mb-2">Report Not Found</h2>
             <p className="text-slate-400 mb-6">We couldn&apos;t find the session you&apos;re looking for.</p>
             <Link href="/dashboard" className="btn-primary">Go to Dashboard</Link>
           </div>
        </div>
    );
  }

  // Create chart data from question breakdown
  const chartData = report.questionBreakdown.map((q, i) => ({
    name: `Q${i + 1}`,
    score: q.score,
    semantic: q.semantic,
    keywords: q.keywords
  }));

  return (
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Interview Report</h1>
              <p className="text-slate-400">Session ID: {sessionId}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2">
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <Link href="/setup" className="btn-primary flex items-center gap-2">
                <RefreshCcw className="w-4 h-4" /> Start New
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             {/* Score Card */}
             <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center col-span-1 border-emerald-500/20 bg-emerald-500/5">
                <div className="text-5xl font-black text-emerald-400 mb-2">{report.averageScore} <span className="text-xl text-emerald-600">/ 10</span></div>
                <div className="text-emerald-500 font-semibold mb-4 uppercase tracking-widest text-sm">Overall Score</div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-slate-300">
                    <span className="font-medium">Domain:</span> <span className="bg-slate-800 px-2 py-0.5 rounded">{report.domain}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-300">
                    <span className="font-medium">Questions:</span> <span className="bg-slate-800 px-2 py-0.5 rounded">{report.totalQuestions}</span>
                  </div>
                </div>
             </div>

             {/* Feedback */}
             <div className="glass-card rounded-2xl p-6 col-span-1 md:col-span-2">
               <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-400"/> Executive Summary</h3>
               <p className="text-slate-300 leading-relaxed mb-6">{report.overallFeedback}</p>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                    <h4 className="text-sm font-semibold text-emerald-400 mb-3 uppercase tracking-wider">Strengths</h4>
                    <ul className="space-y-2">
                      {report.strengths.map((str, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                 </div>
                 <div>
                    <h4 className="text-sm font-semibold text-red-400 mb-3 uppercase tracking-wider">Areas to Improve</h4>
                    <ul className="space-y-2">
                      {report.improvements.map((imp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                 </div>
               </div>
             </div>
          </div>

          <div className="mb-8 glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Performance Trajectory</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 10]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2 }} activeDot={{ r: 8 }} name="Overall" />
                  <Line type="monotone" dataKey="semantic" stroke="#8b5cf6" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Semantic" />
                  <Line type="monotone" dataKey="keywords" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Keywords" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4 mt-12">Per Question Breakdown</h3>
            {report.questionBreakdown.map((q, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-colors">
                <div 
                  className="p-5 flex items-center justify-between cursor-pointer select-none bg-slate-800/20"
                  onClick={() => toggleQ(q.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-mono ${
                      q.score >= 7.5 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {q.score}
                    </div>
                    <div>
                      <h4 className="text-white font-medium line-clamp-1 pr-4">Q{i+1}: {q.text}</h4>
                    </div>
                  </div>
                  <div>
                    {expandedQs[q.id] ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>
                
                {expandedQs[q.id] && (
                  <div className="p-5 border-t border-slate-700 bg-slate-900/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Feedback</p>
                          <p className="text-slate-200">{q.feedback}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Model Answer</p>
                          <p className="text-slate-300 italic text-sm border-l-2 border-blue-500 pl-3 py-1 bg-blue-500/5 rounded-r">
                            {q.modelAnswer}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-slate-800/50 p-3 rounded-lg">
                             <div className="text-xs text-slate-400 mb-1">Semantic Match</div>
                             <div className="font-bold text-purple-400">{q.semantic}/10</div>
                           </div>
                           <div className="bg-slate-800/50 p-3 rounded-lg">
                             <div className="text-xs text-slate-400 mb-1">Keywords Match</div>
                             <div className="font-bold text-blue-400">{q.keywords}/10</div>
                           </div>
                           <div className="bg-slate-800/50 p-3 rounded-lg">
                             <div className="text-xs text-slate-400 mb-1">Grammar</div>
                             <div className="font-bold text-white">{q.grammar}/10</div>
                           </div>
                           <div className="bg-slate-800/50 p-3 rounded-lg">
                             <div className="text-xs text-slate-400 mb-1">Predominant Emotion</div>
                             <div className="font-bold text-slate-200">{q.emoji} {q.emotion}</div>
                           </div>
                        </div>
                        
                        {(q.missing && q.missing.length > 0) && (
                          <div>
                            <p className="text-sm text-slate-400 mb-2">Missed Keywords</p>
                            <div className="flex flex-wrap gap-2">
                              {q.missing.map(word => (
                                <span key={word} className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-xs">
                                  {word}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

        </main>
  );
}

export default function Report() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          </div>
        }>
          <ReportContent />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
