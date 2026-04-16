"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { Plus, LayoutDashboard, Pencil, Trash2, X, Check, LogOut, Map, Palette } from 'lucide-react';

type Board = {
  id: string;
  title: string;
  description?: string;
  background?: string;
};

type User = { name: string; email: string };

const SAMPLE_ROADMAP = {
  id: 'sample',
  title: '🗺️ Sample Project Roadmap',
  description: 'A demo board to get you started. Create your own boards below!',
};

// Board background presets — key stored in DB, value is the CSS
export const BOARD_BACKGROUNDS: Record<string, { label: string; css: string; preview: string }> = {
  ocean:    { label: 'Ocean',    css: 'from-blue-900 via-cyan-900 to-slate-900',      preview: 'from-blue-500 to-cyan-400' },
  sunset:   { label: 'Sunset',   css: 'from-rose-900 via-orange-900 to-amber-900',   preview: 'from-rose-500 to-orange-400' },
  forest:   { label: 'Forest',   css: 'from-emerald-900 via-teal-900 to-green-950',  preview: 'from-emerald-500 to-teal-400' },
  galaxy:   { label: 'Galaxy',   css: 'from-indigo-900 via-purple-900 to-slate-900', preview: 'from-indigo-500 to-violet-400' },
  midnight: { label: 'Midnight', css: 'from-slate-900 via-slate-800 to-zinc-900',    preview: 'from-slate-600 to-zinc-500' },
  aurora:   { label: 'Aurora',   css: 'from-green-900 via-teal-800 to-indigo-900',   preview: 'from-green-400 to-indigo-400' },
  candy:    { label: 'Candy',    css: 'from-pink-900 via-fuchsia-900 to-violet-900', preview: 'from-pink-500 to-fuchsia-400' },
  volcano:  { label: 'Volcano',  css: 'from-red-900 via-rose-900 to-orange-900',     preview: 'from-red-500 to-orange-400' },
};

const DEFAULT_BG = 'galaxy';

export default function Dashboard() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newBg, setNewBg] = useState(DEFAULT_BG);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    api.get<Board[]>('/boards').then((res) => setBoards(res.data)).catch(console.error);
  }, []);

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingBoard(null);
    setNewTitle('');
    setNewDesc('');
    setNewBg(DEFAULT_BG);
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/boards', { title: newTitle, description: newDesc, background: newBg });
      setBoards((prev) => [...prev, res.data]);
      closeModal();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleEdit = async () => {
    if (!editingBoard || !newTitle.trim()) return;
    setLoading(true);
    try {
      const res = await api.put(`/boards/${editingBoard.id}`, { title: newTitle, description: newDesc, background: newBg });
      setBoards((prev) => prev.map((b) => b.id === editingBoard.id ? res.data : b));
      closeModal();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/boards/${id}`);
      setBoards((prev) => prev.filter((b) => b.id !== id));
      setDeletingId(null);
    } catch (e) { console.error(e); }
  };

  const openEdit = (board: Board) => {
    setEditingBoard(board);
    setNewTitle(board.title);
    setNewDesc(board.description || '');
    setNewBg(board.background || DEFAULT_BG);
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  const getBg = (bg?: string) => BOARD_BACKGROUNDS[bg || DEFAULT_BG] ?? BOARD_BACKGROUNDS[DEFAULT_BG];

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white relative overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-violet-700/20 rounded-full filter blur-[100px]" />
        <div className="absolute top-[50%] left-[40%] w-[300px] h-[300px] bg-blue-600/10 rounded-full filter blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Topbar */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 rounded-xl border border-indigo-500/30">
              <LayoutDashboard className="w-6 h-6 text-indigo-300" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Manageable</span>
          </div>
          <button
            onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/'); }}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-300 transition-all"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">{firstName}!</span>
          </h1>
          <p className="text-slate-400 text-lg">Here are your workspaces. Let's get organized.</p>
        </div>

        {/* Sample Board */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Map className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Sample Board</h2>
          </div>
          <Link href="/board/sample">
            <div className="relative h-40 rounded-2xl overflow-hidden cursor-pointer group shadow-xl hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-indigo-600 to-purple-700 border border-indigo-500/30">
              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold">{SAMPLE_ROADMAP.title}</h3>
                  <p className="text-sm text-white/70 mt-1">{SAMPLE_ROADMAP.description}</p>
                </div>
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-1/2 h-full bg-white/60 group-hover:w-3/4 transition-all duration-700 rounded-full" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* My Boards */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <LayoutDashboard className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">My Boards</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {boards.map((board) => {
              const bg = getBg(board.background);
              return (
                <div key={board.id} className="relative group">
                  <Link href={`/board/${board.id}`}>
                    <div className={`h-40 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br ${bg.css} border border-white/10`}>
                      <div className="p-5 flex flex-col h-full justify-between">
                        <div>
                          <h3 className="text-lg font-bold leading-tight">{board.title}</h3>
                          {board.description && (
                            <p className="text-xs text-white/60 mt-1 line-clamp-2">{board.description}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="w-4/5 h-1 bg-white/20 rounded-full overflow-hidden">
                            <div className="w-1/3 h-full bg-white/50 group-hover:w-2/3 transition-all duration-500 rounded-full" />
                          </div>
                          <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">{bg.label}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => { e.preventDefault(); openEdit(board); }}
                      className="p-1.5 bg-black/40 hover:bg-black/70 rounded-lg backdrop-blur-sm transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); setDeletingId(board.id); }}
                      className="p-1.5 bg-black/40 hover:bg-red-600/80 rounded-lg backdrop-blur-sm transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Create Board Card */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="h-40 border-2 border-dashed border-white/10 hover:border-indigo-400/60 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 hover:bg-indigo-600/5 group"
            >
              <div className="p-3 bg-white/5 group-hover:bg-indigo-600/20 rounded-full transition-colors border border-white/10 group-hover:border-indigo-400/30">
                <Plus className="w-6 h-6 text-white/40 group-hover:text-indigo-300 transition-colors" />
              </div>
              <span className="text-sm font-medium text-white/40 group-hover:text-indigo-300 transition-colors">New Board</span>
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(showCreateModal || editingBoard) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-md bg-[#1a1a2e] border border-white/10 rounded-3xl p-8 shadow-2xl">
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>

            <h3 className="text-2xl font-bold mb-1">{editingBoard ? 'Edit Board' : 'Create New Board'}</h3>
            <p className="text-slate-400 text-sm mb-6">
              {editingBoard ? 'Update your board details.' : 'Give your board a name, description and a background.'}
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Board Name *</label>
                <input
                  type="text" autoFocus
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="e.g. Q2 Product Roadmap"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') editingBoard ? handleEdit() : handleCreate(); }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description <span className="text-slate-500">(optional)</span></label>
                <textarea
                  rows={2}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                  placeholder="What is this board about?"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>

              {/* Background picker */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" /> Board Background
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(BOARD_BACKGROUNDS).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNewBg(key)}
                      className={`relative h-12 rounded-xl bg-gradient-to-br ${val.preview} transition-all ${newBg === key ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a2e] scale-105' : 'hover:scale-105 opacity-70 hover:opacity-100'}`}
                      title={val.label}
                    >
                      {newBg === key && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow" strokeWidth={3} />
                        </div>
                      )}
                      <span className="absolute bottom-1 right-1.5 text-[9px] text-white/80 font-medium">{val.label}</span>
                    </button>
                  ))}
                </div>
                {/* Preview */}
                <div className={`mt-2 h-10 w-full rounded-lg bg-gradient-to-br ${BOARD_BACKGROUNDS[newBg]?.css} opacity-80 border border-white/10 transition-all`} />
              </div>

              <button
                onClick={editingBoard ? handleEdit : handleCreate}
                disabled={loading || !newTitle.trim()}
                className="w-full py-3 mt-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {loading ? 'Saving...' : editingBoard ? 'Save Changes' : 'Create Board'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeletingId(null)} />
          <div className="relative w-full max-w-sm bg-[#1a1a2e] border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Delete Board?</h3>
            <p className="text-slate-400 text-sm mb-6">This will permanently delete the board and all its lists and cards. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all">Cancel</button>
              <button onClick={() => handleDelete(deletingId)} className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-semibold transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
