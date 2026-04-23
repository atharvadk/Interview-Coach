"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Bot, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                AI Coach
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4 text-sm font-medium">
            {!loading && (
              user ? (
                <>
                  <div className="flex items-center gap-2 text-slate-300">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user.name}</span>
                  </div>
                  <button 
                    onClick={logout}
                    className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-slate-300 hover:text-white transition-colors">
                    Login
                  </Link>
                  <Link href="/register" className="btn-primary py-1.5 px-4 text-sm">
                    Get Started
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
