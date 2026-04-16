"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { LayoutDashboard, Loader2 } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Already logged in — go straight to dashboard
      router.replace('/dashboard');
      return;
    }
    // Auto-login as the default user (no credentials required)
    api.get('/auth/auto-login')
      .then((res) => {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        router.replace('/dashboard');
      })
      .catch(() => {
        // Fallback: go to manual login
        router.replace('/login');
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col items-center justify-center gap-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-600/30 rounded-2xl border border-indigo-500/30">
          <LayoutDashboard className="w-8 h-8 text-indigo-300" />
        </div>
        <span className="text-3xl font-extrabold tracking-tight">Manageable</span>
      </div>
      <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      <p className="text-slate-400 text-sm">Loading your workspace…</p>
    </div>
  );
}
