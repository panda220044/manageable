"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import BoardComponent from '@/components/Board';

const SAMPLE_DATA = {
  id: 'sample',
  title: '🗺️ Sample Project Roadmap',
  description: 'A demo board — drag cards between lists, add new ones, edit and delete!',
  lists: [
    {
      id: 'sample-l1',
      title: '📋 Backlog',
      order: 0,
      cards: [
        { id: 'sample-c1', title: 'User Research & Interviews', description: 'Interview 10 target users to understand pain points', order: 0, listId: 'sample-l1', labels: [], checklists: [], members: [] },
        { id: 'sample-c2', title: 'Competitor Analysis', description: 'Analyse top 5 competitors — features, pricing, UX', order: 1, listId: 'sample-l1', labels: [], checklists: [], members: [] },
        { id: 'sample-c3', title: 'Define MVP Scope', description: 'List must-have features for the first release', order: 2, listId: 'sample-l1', labels: [], checklists: [], members: [] },
      ],
    },
    {
      id: 'sample-l2',
      title: '🚀 In Progress',
      order: 1,
      cards: [
        { id: 'sample-c4', title: 'Design System Setup', description: 'Create colour tokens, typography, and component library', order: 0, listId: 'sample-l2', labels: [], checklists: [], members: [] },
        { id: 'sample-c5', title: 'Auth Flow — Login & Signup', description: 'Email + Google OAuth integration', order: 1, listId: 'sample-l2', labels: [], checklists: [], members: [] },
      ],
    },
    {
      id: 'sample-l3',
      title: '🔍 In Review',
      order: 2,
      cards: [
        { id: 'sample-c6', title: 'Dashboard UI', description: 'Welcome screen with board grid and create board modal', order: 0, listId: 'sample-l3', labels: [], checklists: [], members: [] },
        { id: 'sample-c7', title: 'Drag & Drop Cards', description: 'Implement @dnd-kit for card reordering across lists', order: 1, listId: 'sample-l3', labels: [], checklists: [], members: [] },
      ],
    },
    {
      id: 'sample-l4',
      title: '✅ Done',
      order: 3,
      cards: [
        { id: 'sample-c8', title: 'Project Kickoff', description: 'Aligned on vision, tech stack, and initial roadmap', order: 0, listId: 'sample-l4', labels: [], checklists: [], members: [] },
        { id: 'sample-c9', title: 'Backend API Setup', description: 'Express + Prisma + SQLite — all core endpoints live', order: 1, listId: 'sample-l4', labels: [], checklists: [], members: [] },
        { id: 'sample-c10', title: 'Database Schema Design', description: 'Boards, Lists, Cards, Labels, Checklists, Members', order: 2, listId: 'sample-l4', labels: [], checklists: [], members: [] },
      ],
    },
  ],
};

// Wrapped Board that intercepts API calls and uses local state only
function SampleBoard() {
  // We pass the sample data as initialData — all drag, edit, delete work purely in local state
  // API calls from List/CardModal will simply fail silently (network error)
  return <BoardComponent initialData={SAMPLE_DATA} />;
}

export default function SampleBoardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 overflow-hidden flex flex-col">
      {/* Header */}
      <header className="h-14 shrink-0 border-b border-white/10 bg-black/20 backdrop-blur-md flex items-center px-5 gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">{SAMPLE_DATA.title}</h1>
          <p className="text-xs text-white/40">{SAMPLE_DATA.description}</p>
        </div>
        <div className="ml-auto px-3 py-1.5 bg-indigo-500/20 border border-indigo-400/30 rounded-lg text-xs text-indigo-300 font-medium">
          Demo Board
        </div>
      </header>

      <main className="flex-1 overflow-x-auto overflow-y-hidden p-5">
        <SampleBoard />
      </main>
    </div>
  );
}
