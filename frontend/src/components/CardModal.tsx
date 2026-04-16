"use client";

import React, { useState, useEffect } from 'react';
import {
  X, CreditCard, AlignLeft, Trash2, Pencil, Check,
  Tag, CheckSquare, Clock, Users, Plus, Archive, MessageSquare, Send
} from 'lucide-react';
import api from '@/utils/api';

const LABEL_COLORS = [
  { name: 'Red',    value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green',  value: '#22c55e' },
  { name: 'Blue',   value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink',   value: '#ec4899' },
  { name: 'Teal',   value: '#14b8a6' },
];

export default function CardModal({ card: initialCard, onClose, setLists }: {
  card: any; onClose: () => void; setLists: any;
}) {
  const [card, setCard] = useState(initialCard);
  const [title, setTitle] = useState(initialCard.title || '');
  const [description, setDescription] = useState(initialCard.description || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [saving, setSaving] = useState(false);

  // Labels
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0].value);

  // Checklist
  const [newCheckItem, setNewCheckItem] = useState('');
  const [addingCheck, setAddingCheck] = useState(false);

  // Due date
  const [dueDate, setDueDate] = useState(
    initialCard.dueDate ? new Date(initialCard.dueDate).toISOString().slice(0, 16) : ''
  );

  // Members
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showMemberPicker, setShowMemberPicker] = useState(false);

  // Comments
  const [comments, setComments] = useState<any[]>(initialCard.comments || []);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    api.get('/users').then(r => setAllUsers(r.data)).catch(() => {});
    api.get(`/cards/${initialCard.id}/comments`).then(r => setComments(r.data)).catch(() => {});
  }, [initialCard.id]);

  const syncCard = (updated: any) => {
    setCard(updated);
    setLists((prev: any) => prev.map((l: any) => ({
      ...l,
      cards: l.cards.map((c: any) => c.id === updated.id ? updated : c)
    })));
  };

  const save = async (updates: any) => {
    setSaving(true);
    try {
      const res = await api.put(`/cards/${card.id}`, updates);
      syncCard(res.data);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const saveTitle = async () => {
    if (!title.trim()) return;
    await save({ title });
    setIsEditingTitle(false);
  };

  const saveDescription = async () => save({ description });

  const saveDueDate = async (val: string) => {
    setDueDate(val);
    await save({ dueDate: val ? new Date(val).toISOString() : null });
  };

  const deleteCard = async () => {
    if (!confirm('Delete this card?')) return;
    await api.delete(`/cards/${card.id}`);
    setLists((prev: any) => prev.map((l: any) => ({
      ...l, cards: l.cards.filter((c: any) => c.id !== card.id)
    })));
    onClose();
  };

  const archiveCard = async () => { await save({ completed: true }); onClose(); };

  /* ── Labels ── */
  const addLabel = async () => {
    if (!newLabelName.trim()) return;
    try {
      const res = await api.post(`/cards/${card.id}/labels`, { name: newLabelName, color: newLabelColor });
      syncCard({ ...card, labels: [...(card.labels || []), res.data] });
      setNewLabelName(''); setShowLabelPicker(false);
    } catch (e) { console.error(e); }
  };

  const removeLabel = async (labelId: string) => {
    try {
      await api.delete(`/labels/${labelId}`);
      syncCard({ ...card, labels: card.labels.filter((l: any) => l.id !== labelId) });
    } catch (e) { console.error(e); }
  };

  /* ── Checklists ── */
  const addCheckItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckItem.trim()) return;
    try {
      const res = await api.post(`/cards/${card.id}/checklists`, { title: newCheckItem });
      syncCard({ ...card, checklists: [...(card.checklists || []), res.data] });
      setNewCheckItem('');
    } catch (e) { console.error(e); }
  };

  const toggleCheckItem = async (item: any) => {
    try {
      const res = await api.put(`/checklists/${item.id}`, { isCompleted: !item.isCompleted });
      syncCard({ ...card, checklists: card.checklists.map((c: any) => c.id === item.id ? res.data : c) });
    } catch (e) { console.error(e); }
  };

  const deleteCheckItem = async (itemId: string) => {
    try {
      await api.delete(`/checklists/${itemId}`);
      syncCard({ ...card, checklists: card.checklists.filter((c: any) => c.id !== itemId) });
    } catch (e) { console.error(e); }
  };

  /* ── Members ── */
  const addMember = async (userId: string) => {
    try {
      const res = await api.post(`/cards/${card.id}/members`, { userId });
      syncCard({ ...card, members: [...(card.members || []), res.data] });
    } catch (e) { console.error(e); }
  };

  const removeMember = async (userId: string) => {
    try {
      await api.delete(`/cards/${card.id}/members/${userId}`);
      syncCard({ ...card, members: card.members.filter((m: any) => m.userId !== userId) });
    } catch (e) { console.error(e); }
  };

  /* ── Comments ── */
  const postComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPostingComment(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await api.post(`/cards/${card.id}/comments`, { text: newComment, authorName: user.name || 'You' });
      setComments(prev => [...prev, res.data]);
      setNewComment('');
    } catch (e) { console.error(e); }
    finally { setPostingComment(false); }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (e) { console.error(e); }
  };

  const memberIds = (card.members || []).map((m: any) => m.userId);
  const completedChecks = (card.checklists || []).filter((c: any) => c.isCompleted).length;
  const totalChecks = (card.checklists || []).length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto pt-10">
      <div className="bg-[#1a1a2e] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl text-white relative mb-10">

        {/* ── Header ── */}
        <div className="p-6 pb-4 pr-14 relative flex gap-3 border-b border-white/10">
          <CreditCard className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            {isEditingTitle ? (
              <div className="flex gap-2 items-start">
                <input
                  autoFocus value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setIsEditingTitle(false); }}
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button onClick={saveTitle} className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg"><Check className="w-4 h-4" /></button>
                <button onClick={() => setIsEditingTitle(false)} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h2 className="text-xl font-bold leading-tight flex-1">{title}</h2>
                <button onClick={() => setIsEditingTitle(true)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded-lg transition-all">
                  <Pencil className="w-3.5 h-3.5 text-white/50" />
                </button>
              </div>
            )}
            <p className="text-xs text-white/40 mt-1">in list <span className="text-white/60 font-medium">{card.list?.title || 'this board'}</span></p>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-6 flex flex-col md:flex-row gap-6">

          {/* Left / Main column */}
          <div className="flex-1 space-y-6 min-w-0">

            {/* Label chips */}
            {(card.labels || []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {card.labels.map((label: any) => (
                  <span
                    key={label.id}
                    onClick={() => removeLabel(label.id)}
                    style={{ backgroundColor: label.color }}
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white cursor-pointer hover:opacity-70 transition-opacity flex items-center gap-1"
                    title="Click to remove"
                  >
                    {label.name} <X className="w-3 h-3" />
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="flex gap-3">
              <AlignLeft className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-2 text-white/70 uppercase tracking-wider">Description</h3>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a more detailed description..."
                  rows={3}
                  className="w-full bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
                />
                <button onClick={saveDescription} disabled={saving} className="mt-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs rounded-lg font-medium transition-all">
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>

            {/* Checklist */}
            <div className="flex gap-3">
              <CheckSquare className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-2 text-white/70 uppercase tracking-wider">
                  Checklist {totalChecks > 0 && <span className="text-white/40 ml-1 normal-case">({completedChecks}/{totalChecks})</span>}
                </h3>
                {totalChecks > 0 && (
                  <div className="w-full h-1.5 bg-white/10 rounded-full mb-3 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${Math.round((completedChecks / totalChecks) * 100)}%` }} />
                  </div>
                )}
                <div className="space-y-1.5 mb-2">
                  {(card.checklists || []).map((item: any) => (
                    <div key={item.id} className="flex items-center gap-2.5 group">
                      <button
                        onClick={() => toggleCheckItem(item)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${item.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-white/30 hover:border-emerald-400'}`}
                      >
                        {item.isCompleted && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                      </button>
                      <span className={`text-sm flex-1 ${item.isCompleted ? 'line-through text-white/30' : 'text-white/80'}`}>{item.title}</span>
                      <button onClick={() => deleteCheckItem(item.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all">
                        <X className="w-3 h-3 text-white/40" />
                      </button>
                    </div>
                  ))}
                </div>
                {addingCheck ? (
                  <form onSubmit={addCheckItem} className="flex gap-2">
                    <input
                      autoFocus value={newCheckItem}
                      onChange={(e) => setNewCheckItem(e.target.value)}
                      placeholder="Add an item..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onKeyDown={(e) => { if (e.key === 'Escape') setAddingCheck(false); }}
                    />
                    <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold"><Check className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => setAddingCheck(false)} className="p-1.5 hover:bg-white/10 rounded-lg"><X className="w-4 h-4 text-white/40" /></button>
                  </form>
                ) : (
                  <button onClick={() => setAddingCheck(true)} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add an item
                  </button>
                )}
              </div>
            </div>

            {/* Comments */}
            <div className="flex gap-3">
              <MessageSquare className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-3 text-white/70 uppercase tracking-wider">Comments</h3>
                <div className="space-y-3 mb-3">
                  {comments.length === 0 && (
                    <p className="text-xs text-white/30 italic">No comments yet — be the first!</p>
                  )}
                  {comments.map((c: any) => (
                    <div key={c.id} className="flex gap-2.5 group">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {c.authorName?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white/80">{c.authorName}</span>
                          <span className="text-[10px] text-white/30">
                            {new Date(c.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-white/70 mt-0.5 break-words">{c.text}</p>
                      </div>
                      <button onClick={() => deleteComment(c.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all shrink-0">
                        <X className="w-3 h-3 text-white/30" />
                      </button>
                    </div>
                  ))}
                </div>
                <form onSubmit={postComment} className="flex gap-2">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment…"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button type="submit" disabled={postingComment || !newComment.trim()} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl text-sm transition-all">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

          </div>
          {/* End left column */}

          {/* Right / Sidebar */}
          <div className="w-full md:w-44 shrink-0 space-y-4">

            {/* Due Date */}
            <div>
              <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Due Date</h4>
              <input
                type="datetime-local" value={dueDate}
                onChange={(e) => saveDueDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 [color-scheme:dark]"
              />
              {dueDate && (
                <button onClick={() => saveDueDate('')} className="mt-1 text-xs text-white/30 hover:text-red-400 transition-colors">Clear date</button>
              )}
            </div>

            {/* Members */}
            <div>
              <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Members</h4>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(card.members || []).map((m: any) => (
                  <div
                    key={m.userId} onClick={() => removeMember(m.userId)}
                    title={`${m.user?.name} — click to remove`}
                    className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-red-600 transition-colors"
                  >
                    {m.user?.name?.[0]?.toUpperCase()}
                  </div>
                ))}
              </div>
              <button onClick={() => setShowMemberPicker(!showMemberPicker)} className="w-full py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/60 flex items-center justify-center gap-1.5 transition-all">
                <Plus className="w-3.5 h-3.5" /> Add member
              </button>
              {showMemberPicker && (
                <div className="mt-2 bg-[#12122a] border border-white/10 rounded-xl p-2 space-y-1 max-h-36 overflow-y-auto">
                  {allUsers.length === 0 && <p className="text-xs text-white/30 text-center py-1">No users found</p>}
                  {allUsers.map((u: any) => {
                    const assigned = memberIds.includes(u.id);
                    return (
                      <button
                        key={u.id}
                        onClick={() => assigned ? removeMember(u.id) : addMember(u.id)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all ${assigned ? 'bg-indigo-600/30 text-indigo-300' : 'hover:bg-white/5 text-white/60'}`}
                      >
                        <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0">{u.name?.[0]?.toUpperCase()}</div>
                        <span className="truncate flex-1 text-left">{u.name}</span>
                        {assigned && <Check className="w-3 h-3 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Labels */}
            <div>
              <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Labels</h4>
              <button onClick={() => setShowLabelPicker(!showLabelPicker)} className="w-full py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/60 flex items-center justify-center gap-1.5 transition-all">
                <Plus className="w-3.5 h-3.5" /> Add label
              </button>
              {showLabelPicker && (
                <div className="mt-2 bg-[#12122a] border border-white/10 rounded-xl p-3 space-y-2">
                  <input
                    autoFocus value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="Label name..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    onKeyDown={(e) => { if (e.key === 'Enter') addLabel(); }}
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {LABEL_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setNewLabelColor(c.value)}
                        style={{ backgroundColor: c.value }}
                        className={`w-6 h-6 rounded-full transition-all ${newLabelColor === c.value ? 'ring-2 ring-white ring-offset-1 ring-offset-[#12122a] scale-110' : ''}`}
                        title={c.name}
                      />
                    ))}
                  </div>
                  <button onClick={addLabel} className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold transition-all">
                    Add Label
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <button onClick={archiveCard} className="w-full flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white/80 rounded-xl text-xs font-medium transition-all">
                <Archive className="w-3.5 h-3.5" /> Archive Card
              </button>
              <button onClick={deleteCard} className="w-full flex items-center gap-2 px-3 py-2 bg-red-600/15 hover:bg-red-600/30 border border-red-500/20 text-red-400 hover:text-red-300 rounded-xl text-xs font-medium transition-all">
                <Trash2 className="w-3.5 h-3.5" /> Delete Card
              </button>
            </div>

          </div>
          {/* End sidebar */}

        </div>
        {/* End body */}

      </div>
    </div>
  );
}
