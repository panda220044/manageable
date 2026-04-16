"use client";

import React, { useState, useMemo } from 'react';
import {
  DndContext, DragOverlay, closestCorners,
  KeyboardSensor, PointerSensor, useSensor, useSensors,
  DragStartEvent, DragOverEvent, DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, arrayMove,
  horizontalListSortingStrategy, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import List from './List';
import CardItem from './CardItem';
import api from '@/utils/api';
import { Plus, X, Check, Search, Tag, Users, Clock, ChevronDown } from 'lucide-react';
import CardModal from './CardModal';

export default function Board({ initialData }: { initialData: any }) {
  const [lists, setLists] = useState<any[]>(initialData.lists || []);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'list' | 'card' | null>(null);
  const [activeCardData, setActiveCardData] = useState<any>(null);
  const [activeCardOriginalListId, setActiveCardOriginalListId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  // ── Search & Filter state ──────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLabel, setFilterLabel] = useState<string | null>(null);
  const [filterMember, setFilterMember] = useState<string | null>(null);
  const [filterDue, setFilterDue] = useState<'overdue' | 'today' | 'week' | null>(null);
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const [showMemberMenu, setShowMemberMenu] = useState(false);

  // Derive unique labels + members from all cards
  const allLabels = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    lists.forEach(l => l.cards.forEach((c: any) =>
      (c.labels || []).forEach((lb: any) => map.set(lb.name + lb.color, lb))
    ));
    return Array.from(map.values());
  }, [lists]);

  const allMembers = useMemo(() => {
    const map = new Map<string, any>();
    lists.forEach(l => l.cards.forEach((c: any) =>
      (c.members || []).forEach((m: any) => map.set(m.userId, m.user))
    ));
    return Array.from(map.entries()).map(([id, u]) => ({ id, ...u }));
  }, [lists]);

  const hasFilter = !!(searchQuery || filterLabel || filterMember || filterDue);

  // Compute matched card IDs
  const matchedCardIds = useMemo(() => {
    if (!hasFilter) return null; // null = show all
    const now = new Date();
    const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);
    const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);

    const matched = new Set<string>();
    lists.forEach(l => l.cards.forEach((c: any) => {
      const q = searchQuery.toLowerCase();
      if (q && !c.title.toLowerCase().includes(q)) return;
      if (filterLabel && !(c.labels || []).some((lb: any) =>
        lb.name + lb.color === filterLabel)) return;
      if (filterMember && !(c.members || []).some((m: any) => m.userId === filterMember)) return;
      if (filterDue) {
        if (!c.dueDate) return;
        const due = new Date(c.dueDate);
        if (filterDue === 'overdue' && due >= now) return;
        if (filterDue === 'today' && (due < now || due > todayEnd)) return;
        if (filterDue === 'week' && (due < now || due > weekEnd)) return;
      }
      matched.add(c.id);
    }));
    return matched;
  }, [lists, searchQuery, filterLabel, filterMember, filterDue, hasFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterLabel(null);
    setFilterMember(null);
    setFilterDue(null);
  };

  // ── DnD ───────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findListByCardId = (cardId: string) =>
    lists.find(list => list.cards.some((card: any) => card.id === cardId));

  const handleDragStart = (event: DragStartEvent) => {
    const { id } = event.active;
    const list = lists.find(l => l.id === id);
    if (list) { setActiveType('list'); setActiveId(id as string); return; }
    const cardList = findListByCardId(id as string);
    if (cardList) {
      setActiveType('card'); setActiveId(id as string);
      setActiveCardOriginalListId(cardList.id);
      setActiveCardData(cardList.cards.find((c: any) => c.id === id));
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    if (activeType === 'card') {
      const activeList = findListByCardId(active.id as string);
      const overList = lists.find(l => l.id === over.id) || findListByCardId(over.id as string);
      if (!activeList || !overList || activeList.id === overList.id) return;
      setLists(prev => {
        const fi = prev.findIndex(l => l.id === activeList.id);
        const ti = prev.findIndex(l => l.id === overList.id);
        if (fi === -1 || ti === -1) return prev;
        const ai = prev[fi].cards.findIndex((c: any) => c.id === active.id);
        if (ai === -1) return prev;
        const oi = overList.id === over.id
          ? prev[ti].cards.length
          : prev[ti].cards.findIndex((c: any) => c.id === over.id);
        const newLists = prev.map(l => ({ ...l, cards: [...l.cards] }));
        const [moved] = newLists[fi].cards.splice(ai, 1);
        newLists[ti].cards.splice(oi >= 0 ? oi : newLists[ti].cards.length, 0, { ...moved, listId: overList.id });
        return newLists;
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const originalListId = activeCardOriginalListId;
    setActiveId(null); setActiveType(null); setActiveCardData(null); setActiveCardOriginalListId(null);
    const { active, over } = event;
    if (!over) return;
    if (activeType === 'list' && active.id !== over.id) {
      setLists(prev => {
        const oi = prev.findIndex(l => l.id === active.id);
        const ni = prev.findIndex(l => l.id === over.id);
        const reordered = arrayMove(prev, oi, ni);
        reordered.forEach((l, idx) => { if (l.order !== idx) api.put(`/lists/${l.id}`, { order: idx }); });
        return reordered.map((l, idx) => ({ ...l, order: idx }));
      });
    } else if (activeType === 'card') {
      if (active.id === over.id) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      setLists(prev => {
        const destinationList = prev.find(l => l.cards.some((c: any) => c.id === activeId));
        if (!destinationList) return prev;

        // `over` can be either a list drop target or another card.
        const overList =
          prev.find(l => l.id === overId) ||
          prev.find(l => l.cards.some((c: any) => c.id === overId)) ||
          null;
        if (!overList) return prev;

        // Case 1: reordering within the same list (ONLY when `over.id` is a card id)
        const isOverCardInDestination = destinationList.cards.some((c: any) => c.id === overId);
        if (destinationList.id === overList.id && isOverCardInDestination) {
          const li = prev.findIndex(l => l.id === destinationList.id);
          const list = prev[li];
          const oi = list.cards.findIndex((c: any) => c.id === activeId);
          const ni = list.cards.findIndex((c: any) => c.id === overId);
          if (oi === -1 || ni === -1 || oi === ni) return prev;

          const newCards = arrayMove(list.cards, oi, ni);
          newCards.forEach((c: any, idx: number) => api.put(`/cards/${c.id}`, { order: idx, listId: list.id }));

          const newLists = [...prev];
          newLists[li] = { ...list, cards: newCards };
          return newLists;
        }

        // Case 2: moving cards across lists
        const sourceList = originalListId
          ? prev.find(l => l.id === originalListId) || destinationList
          : destinationList;

        // Persist updated ordering for both affected lists
        sourceList.cards.forEach((c: any, idx: number) => {
          api.put(`/cards/${c.id}`, { order: idx, listId: sourceList.id });
        });
        destinationList.cards.forEach((c: any, idx: number) => {
          api.put(`/cards/${c.id}`, { order: idx, listId: destinationList.id });
        });

        // DragOver already updated UI state; no additional local mutation needed here.
        return prev;
      });
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    try {
      const res = await api.post('/lists', { title: newListTitle, boardId: initialData.id, order: lists.length });
      setLists([...lists, { ...res.data, cards: [] }]);
      setNewListTitle(''); setIsAddingList(false);
    } catch (e) { console.error(e); }
  };

  const DUE_OPTS: { key: 'overdue' | 'today' | 'week'; label: string }[] = [
    { key: 'overdue', label: 'Overdue' },
    { key: 'today', label: 'Due Today' },
    { key: 'week', label: 'Due This Week' },
  ];

  return (
    <div className="flex flex-col h-full w-full gap-3">

      {/* ── Search & Filter Bar ───────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 px-1 shrink-0">

        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cards…"
            className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg">
              <X className="w-3.5 h-3.5 text-white/40" />
            </button>
          )}
        </div>

        {/* Label filter */}
        <div className="relative">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => { setShowLabelMenu(!showLabelMenu); setShowMemberMenu(false); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border transition-all ${filterLabel ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-200' : 'bg-black/30 border-white/10 text-white/50 hover:text-white'}`}
          >
            <Tag className="w-3.5 h-3.5" />
            {filterLabel ? allLabels.find(l => l.name + l.color === filterLabel)?.name : 'Label'}
            <ChevronDown className="w-3 h-3" />
          </button>
          {showLabelMenu && (
            <div className="absolute top-full mt-1 left-0 z-20 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl p-2 min-w-[160px]">
              {allLabels.length === 0 && <p className="text-xs text-white/30 px-2 py-1">No labels on this board</p>}
              {allLabels.map(lb => (
                <button
                  key={lb.name + lb.color}
                  onClick={() => { setFilterLabel(filterLabel === lb.name + lb.color ? null : lb.name + lb.color); setShowLabelMenu(false); }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 text-sm"
                >
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: lb.color }} />
                  <span className="text-white/80">{lb.name}</span>
                  {filterLabel === lb.name + lb.color && <Check className="w-3 h-3 text-indigo-400 ml-auto" />}
                </button>
              ))}
              {filterLabel && <button onClick={() => { setFilterLabel(null); setShowLabelMenu(false); }} className="w-full text-xs text-white/30 hover:text-red-400 px-2 py-1 text-left">Clear</button>}
            </div>
          )}
        </div>

        {/* Member filter */}
        <div className="relative">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => { setShowMemberMenu(!showMemberMenu); setShowLabelMenu(false); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border transition-all ${filterMember ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-200' : 'bg-black/30 border-white/10 text-white/50 hover:text-white'}`}
          >
            <Users className="w-3.5 h-3.5" />
            {filterMember ? allMembers.find(m => m.id === filterMember)?.name?.split(' ')[0] : 'Member'}
            <ChevronDown className="w-3 h-3" />
          </button>
          {showMemberMenu && (
            <div className="absolute top-full mt-1 left-0 z-20 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl p-2 min-w-[160px]">
              {allMembers.length === 0 && <p className="text-xs text-white/30 px-2 py-1">No members assigned</p>}
              {allMembers.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setFilterMember(filterMember === m.id ? null : m.id); setShowMemberMenu(false); }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 text-sm"
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {m.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-white/80 truncate flex-1">{m.name}</span>
                  {filterMember === m.id && <Check className="w-3 h-3 text-indigo-400" />}
                </button>
              ))}
              {filterMember && <button onClick={() => { setFilterMember(null); setShowMemberMenu(false); }} className="w-full text-xs text-white/30 hover:text-red-400 px-2 py-1 text-left">Clear</button>}
            </div>
          )}
        </div>

        {/* Due date filter */}
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-white/30" />
          {DUE_OPTS.map(opt => (
            <button
              key={opt.key}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setFilterDue(filterDue === opt.key ? null : opt.key)}
              className={`px-2.5 py-1.5 rounded-lg text-xs border transition-all ${filterDue === opt.key ? 'bg-rose-600/30 border-rose-500/50 text-rose-200' : 'bg-black/30 border-white/10 text-white/40 hover:text-white'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Clear all */}
        {hasFilter && (
          <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white/50 hover:text-white transition-all">
            <X className="w-3 h-3" /> Clear all
          </button>
        )}

        {hasFilter && matchedCardIds && (
          <span className="text-xs text-white/30 ml-1">
            {matchedCardIds.size} card{matchedCardIds.size !== 1 ? 's' : ''} match
          </span>
        )}
      </div>

      {/* ── Board Canvas ──────────────────────────────────── */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 items-start pb-4 h-full">
            {/* Add List — first column */}
            {isAddingList ? (
              <form onSubmit={handleCreateList} className="shrink-0 w-72 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex flex-col gap-2">
                <input autoFocus value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)} placeholder="List name…"
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyDown={(e) => { if (e.key === 'Escape') { setIsAddingList(false); setNewListTitle(''); } }}
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Add List
                  </button>
                  <button type="button" onClick={() => { setIsAddingList(false); setNewListTitle(''); }} className="p-1.5 hover:bg-white/10 rounded-lg">
                    <X className="w-4 h-4 text-white/40" />
                  </button>
                </div>
              </form>
            ) : (
              <button onClick={() => setIsAddingList(true)} onPointerDown={(e) => e.stopPropagation()}
                className="shrink-0 w-72 bg-black/20 hover:bg-black/40 text-white/50 hover:text-white p-3 rounded-2xl flex items-center justify-center gap-2 backdrop-blur-md border border-dashed border-white/10 hover:border-white/30 transition-all h-14 self-start"
              >
                <Plus className="w-5 h-5" /> Add a list
              </button>
            )}

            <SortableContext items={lists.map(l => l.id)} strategy={horizontalListSortingStrategy}>
              {lists.map((list, idx) => (
                <List
                  key={list.id}
                  list={list}
                  setLists={setLists}
                  onCardClick={(card) => setSelectedCard(card)}
                  colorIndex={idx}
                  matchedCardIds={matchedCardIds}
                />
              ))}
            </SortableContext>
          </div>

          <DragOverlay>
            {activeId
              ? activeType === 'list'
                ? <div className="w-72 bg-gray-900 opacity-80 rounded-xl h-40" />
                : <CardItem card={activeCardData} isOverlay />
              : null}
          </DragOverlay>
        </DndContext>
      </div>

      {selectedCard && (
        <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} setLists={setLists} />
      )}
    </div>
  );
}
