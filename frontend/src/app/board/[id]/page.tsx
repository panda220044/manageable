"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import BoardComponent from '@/components/Board';
import { ArrowLeft, Loader2, Palette } from 'lucide-react';
import { BOARD_BACKGROUNDS } from '@/app/dashboard/page';

const DEFAULT_BG = 'galaxy';

export default function BoardPage() {
  const { id } = useParams();
  const router = useRouter();
  const [board, setBoard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [savingBg, setSavingBg] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/boards/${id}`)
      .then((res) => { setBoard(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const changeBg = async (key: string) => {
    setShowBgPicker(false);
    setSavingBg(true);
    try {
      const res = await api.put(`/boards/${board.id}`, { background: key });
      setBoard((prev: any) => ({ ...prev, background: res.data.background }));
    } catch (e) { console.error(e); }
    finally { setSavingBg(false); }
  };

  const bgKey = board?.background || DEFAULT_BG;
  const bgCss = BOARD_BACKGROUNDS[bgKey]?.css ?? BOARD_BACKGROUNDS[DEFAULT_BG].css;

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
    <div className={`min-h-screen bg-gradient-to-br ${bgCss} overflow-hidden flex flex-col font-sans transition-all duration-700`}>
      <header className="h-14 shrink-0 border-b border-white/10 bg-black/20 backdrop-blur-md flex items-center px-5 gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1">
          <h1 className="text-lg font-bold text-white">{board.title}</h1>
          {board.description && <p className="text-xs text-white/40">{board.description}</p>}
        </div>

        {/* Background changer */}
        <div className="relative">
          <button
            onClick={() => setShowBgPicker(!showBgPicker)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs text-white/70 hover:text-white transition-all"
            title="Change board background"
          >
            <Palette className="w-3.5 h-3.5" />
            {savingBg ? 'Saving…' : BOARD_BACKGROUNDS[bgKey]?.label ?? 'Background'}
          </button>

          {showBgPicker && (
            <div className="absolute top-full right-0 mt-2 z-50 bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl p-3 w-56">
              <p className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wider">Choose background</p>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(BOARD_BACKGROUNDS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => changeBg(key)}
                    className={`h-10 rounded-lg bg-gradient-to-br ${val.preview} transition-all hover:scale-105 relative ${bgKey === key ? 'ring-2 ring-white ring-offset-1 ring-offset-[#1a1a2e]' : 'opacity-70 hover:opacity-100'}`}
                    title={val.label}
                  >
                    <span className="absolute bottom-0.5 right-1 text-[8px] text-white/80 font-medium">{val.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {showBgPicker && (
        <div className="fixed inset-0 z-40" onClick={() => setShowBgPicker(false)} />
      )}

      <main className="flex-1 overflow-x-auto overflow-y-hidden p-5">
        <BoardComponent initialData={board} />
      </main>
    </div>
  );
}
