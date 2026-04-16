"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import api from '@/utils/api';
import BoardComponent from '@/components/Board';
import { BOARD_BACKGROUNDS } from '@/app/dashboard/page';

export default function SampleBoardPage() {
  const router = useRouter();
  const [board, setBoard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/boards/sample')
      .then((res) => setBoard(res.data))
      .catch(() => setBoard(null))
      .finally(() => setLoading(false));
  }, []);

  const bgKey = board?.background || 'galaxy';
  const bgCss = BOARD_BACKGROUNDS[bgKey]?.css ?? BOARD_BACKGROUNDS.galaxy.css;

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0f0f1a] text-white">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0f0f1a] text-white gap-4">
        <h1 className="text-3xl font-bold">Board not found</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgCss} overflow-hidden flex flex-col`}>
      {/* Header */}
      <header className="h-14 shrink-0 border-b border-white/10 bg-black/20 backdrop-blur-md flex items-center px-5 gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">{board.title}</h1>
          {board.description && <p className="text-xs text-white/40">{board.description}</p>}
        </div>
        <div className="ml-auto px-3 py-1.5 bg-indigo-500/20 border border-indigo-400/30 rounded-lg text-xs text-indigo-300 font-medium">
          Demo Board
        </div>
      </header>

      <main className="flex-1 overflow-x-auto overflow-y-hidden p-5">
        <BoardComponent initialData={board} />
      </main>
    </div>
  );
}
