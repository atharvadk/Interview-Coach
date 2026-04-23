"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { mockApi } from "@/utils/api";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PlayCircle, TrendingUp, Trophy, Target, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, sessionsData, chart] = await Promise.all([
          mockApi.users.getStats(),
          mockApi.users.getSessions(),
          mockApi.users.getChartData()
        ]);
        setStats(statsData);
        setSessions(sessionsData);
        setChartData(chart);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              <p className="text-slate-400">Loading your profile...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Welcome back, {user?.name.split(' ')[0]} <span className="inline-block animate-wave">👋</span>
              </h1>
              <p className="text-slate-400">Ready for your next mock interview?</p>
            </div>
            <Link href="/setup" className="btn-primary w-fit flex items-center gap-2 px-6 py-3">
              <PlayCircle className="w-5 h-5" />
              Start New Interview
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Target className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Total Sessions</p>
                <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
              </div>
            </div>
            
            <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <TrendingUp className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Avg Score</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-bold text-emerald-400">{stats?.avgScore || 0}</p>
                  <span className="text-sm text-slate-500">/ 10</span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <Trophy className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Best Domain</p>
                <p className="text-2xl font-bold text-purple-400">{stats?.bestDomain || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Score Trend (Last 10 Sessions)</h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 10]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '0.5rem', color: '#fff' }}
                      itemStyle={{ color: '#3b82f6' }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Domain Performance */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Domain Performance</h2>
              <div className="space-y-6">
                {[
                  { domain: "ML", score: 8.1, color: "bg-purple-500" },
                  { domain: "DSA", score: 6.3, color: "bg-blue-500" },
                  { domain: "OS", score: 5.8, color: "bg-emerald-500" }
                ].map((d, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-slate-300">{d.domain}</span>
                      <span className="text-sm font-bold text-white">{d.score} / 10</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${d.color} rounded-full`} style={{ width: `${(d.score / 10) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Past Sessions Table */}
          <div className="mt-8 glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Past Sessions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/50 text-slate-400 text-sm">
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Domain</th>
                    <th className="px-6 py-4 font-medium">Score</th>
                    <th className="px-6 py-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {sessions.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-slate-300">{s.date}</td>
                      <td className="px-6 py-4 text-slate-300">{s.domain}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          s.score >= 7.5 ? 'bg-emerald-500/10 text-emerald-400' : 
                          s.score >= 6.0 ? 'bg-blue-500/10 text-blue-400' : 
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {s.score}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/report?sessionId=${s.id}`} className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm font-medium transition-colors">
                          View Report <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {sessions.length === 0 && (
                     <tr>
                       <td colSpan="4" className="text-center py-8 text-slate-500">No past sessions found. Start an interview to see data here.</td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
