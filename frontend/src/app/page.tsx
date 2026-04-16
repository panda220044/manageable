"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    // If already logged in, go straight to dashboard
    const token = localStorage.getItem('token');
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative flex flex-col items-center justify-center overflow-hidden">
      {/* Decorative blurred blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/30 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70"></div>
      
      <div className="relative z-10 text-center max-w-3xl px-6">
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 drop-shadow-lg">
          Manageable
        </h1>
        <p className="text-xl md:text-3xl font-light text-slate-300 mb-12 tracking-wide">
          Organize anything, together.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/login" className="w-full sm:w-auto">
            <button className="w-full px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Log In
            </button>
          </Link>
          <Link href="/signup" className="w-full sm:w-auto">
            <button className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl text-lg font-semibold shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-blue-500/30 border border-transparent">
              Sign Up for Free
            </button>
          </Link>
        </div>
      </div>
      
      {/* Simple footer */}
      <div className="absolute bottom-6 text-sm text-slate-500">
        © {new Date().getFullYear()} Manageable. Built with Next.js & Express.
      </div>
    </div>
  );
}
