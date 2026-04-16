"use client";

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, X, Check, GripVertical, Pencil } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import CardItem from './CardItem';
import api from '@/utils/api';

const LIST_COLORS = [
  'from-indigo-600 to-indigo-700',
  'from-blue-600 to-blue-700',
  'from-violet-600 to-purple-700',
  'from-emerald-600 to-teal-700',
  'from-rose-600 to-pink-700',
  'from-amber-600 to-orange-700',
];

export default function List({ list, setLists, onCardClick, colorIndex = 0, matchedCardIds }: {
  list: any, setLists: any, onCardClick: (card: any) => void, colorIndex?: number, matchedCardIds?: Set<string> | null
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list.id,
    data: { type: 'list', list }
  });

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDesc, setNewCardDesc] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const color = LIST_COLORS[colorIndex % LIST_COLORS.length];

  const deleteList = async () => {
    if (!confirm(`Delete list "${list.title}" and all its cards?`)) return;
    await api.delete(`/lists/${list.id}`);
    setLists((prev: any) => prev.filter((l: any) => l.id !== list.id));
  };

  const saveListTitle = async () => {
    if (!listTitle.trim()) return;
    await api.put(`/lists/${list.id}`, { title: listTitle });
    setLists((prev: any) => prev.map((l: any) => l.id === list.id ? { ...l, title: listTitle } : l));
    setIsEditingTitle(false);
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    try {
      const res = await api.post('/cards', {
        title: newCardTitle,
        description: newCardDesc || undefined,
        listId: list.id,
        order: list.cards.length
      });
      setLists((prev: any) => prev.map((l: any) =>
        l.id === list.id ? { ...l, cards: [...l.cards, res.data] } : l
      ));
      setNewCardTitle('');
      setNewCardDesc('');
      setIsAddingCard(false);
    } catch (err) { console.error(err); }
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-72 shrink-0 bg-white/5 rounded-2xl h-40 border-2 border-dashed border-white/20 opacity-50"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-72 shrink-0 flex flex-col max-h-[calc(100vh-120px)] bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg"
    >
      {/* List Header */}
      <div className={`bg-gradient-to-r ${color} rounded-t-2xl px-4 py-3 flex items-center gap-2`}>
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded-lg transition-colors shrink-0"
        >
          <GripVertical className="w-4 h-4 text-white/60" />
        </div>

        {isEditingTitle ? (
          <div className="flex-1 flex gap-1.5 items-center">
            <input
              autoFocus
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveListTitle(); if (e.key === 'Escape') setIsEditingTitle(false); }}
              className="flex-1 bg-white/20 border border-white/30 rounded-lg px-2 py-0.5 text-sm font-semibold focus:outline-none"
            />
            <button onClick={saveListTitle} className="p-1 bg-white/20 hover:bg-white/30 rounded-lg"><Check className="w-3.5 h-3.5" /></button>
            <button onClick={() => setIsEditingTitle(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-3.5 h-3.5" /></button>
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-1.5 group">
            <span className="font-semibold text-sm flex-1 truncate">{listTitle}</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full shrink-0">
              {list.cards.filter((c: any) => !c.completed).length}
            </span>
            <button onClick={() => setIsEditingTitle(true)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded-lg transition-all">
              <Pencil className="w-3 h-3" />
            </button>
            <button onClick={deleteList} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/40 rounded-lg transition-all">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 p-2 overflow-y-auto flex-1 min-h-[40px]">
        <SortableContext items={list.cards.map((c: any) => c.id)} strategy={verticalListSortingStrategy}>
          {list.cards.map((card: any) => {
            const dimmed = matchedCardIds !== null && matchedCardIds !== undefined && !matchedCardIds.has(card.id);
            return (
              <div key={card.id} className={`transition-opacity duration-200 ${dimmed ? 'opacity-20 pointer-events-none' : ''}`}>
                <CardItem card={card} onClick={() => onCardClick(card)} setLists={setLists} />
              </div>
            );
          })}
        </SortableContext>

        {/* Add Card Form */}
        {isAddingCard ? (
          <form onSubmit={handleCreateCard} className="mt-1 bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
            <input
              autoFocus
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Card title..."
              className="w-full bg-transparent text-sm text-white placeholder-white/30 focus:outline-none border-b border-white/10 pb-2"
              onKeyDown={(e) => { if (e.key === 'Escape') setIsAddingCard(false); }}
            />
            <textarea
              value={newCardDesc}
              onChange={(e) => setNewCardDesc(e.target.value)}
              placeholder="Description (optional)..."
              rows={2}
              className="w-full bg-transparent text-xs text-white/60 placeholder-white/20 focus:outline-none resize-none"
            />
            <div className="flex items-center gap-2 mt-1">
              <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold transition-colors">
                Add Card
              </button>
              <button type="button" onClick={() => { setIsAddingCard(false); setNewCardTitle(''); setNewCardDesc(''); }} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-4 h-4 text-white/40" />
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex items-center gap-2 px-3 py-2 text-white/40 hover:text-white/80 hover:bg-white/5 rounded-xl text-sm transition-all mt-1 border border-dashed border-white/10 hover:border-white/20"
          >
            <Plus className="w-4 h-4" />
            Add a card
          </button>
        )}
      </div>
    </div>
  );
}
