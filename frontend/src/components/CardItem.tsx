"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlignLeft, GripVertical, Check } from 'lucide-react';
import api from '@/utils/api';

export default function CardItem({ card, onClick, isOverlay = false, setLists }: { card: any, onClick?: () => void, isOverlay?: boolean, setLists?: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card', card }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const toggleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newCompleted = !card.completed;
    // Optimistically update local state
    if (setLists) {
      setLists((prev: any) => prev.map((l: any) => ({
        ...l,
        cards: l.cards.map((c: any) => c.id === card.id ? { ...c, completed: newCompleted } : c)
      })));
    }
    // Persist to backend (silently fails for sample board)
    try {
      await api.put(`/cards/${card.id}`, { completed: newCompleted });
    } catch {}
  };

  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white/5 rounded-xl p-4 min-h-[60px] border-2 border-dashed border-white/20 opacity-40"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={onClick}
      className={`group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${isOverlay ? 'rotate-1 scale-105 shadow-2xl' : ''} ${card.completed ? 'opacity-50' : ''}`}
    >
      <div className={`bg-white/8 hover:bg-white/14 backdrop-blur-sm border rounded-xl p-3 cursor-pointer flex items-start gap-2.5 ${card.completed ? 'border-white/5' : 'border-white/10 hover:border-white/20'}`}>
        
        {/* Complete toggle circle */}
        <button
          onClick={toggleComplete}
          onPointerDown={(e) => e.stopPropagation()}
          className={`shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            card.completed
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-white/20 hover:border-emerald-400 hover:bg-emerald-500/10'
          }`}
        >
          {card.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </button>

        {/* Drag handle */}
        <div
          {...listeners}
          className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing touch-none p-0.5 rounded hover:bg-white/10 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 transition-colors" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-snug break-words ${card.completed ? 'line-through text-white/30' : 'text-white'}`}>
            {card.title}
          </p>
          {card.description && !card.completed && (
            <div className="flex items-center gap-1 mt-1.5">
              <AlignLeft className="w-3 h-3 text-white/30 shrink-0" />
              <p className="text-xs text-white/40 truncate">{card.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
