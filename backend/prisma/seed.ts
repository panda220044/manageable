import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Avoid wiping the database on every restart.
  // We only seed if the sample board doesn't exist (unless explicitly forced).
  const sampleBoardExists = await prisma.board
    .findUnique({ where: { id: 'sample' } })
    .then(() => true)
    .catch(() => false);

  if (sampleBoardExists && process.env.SEED_FORCE !== 'true') {
    console.log('ℹ️ Seed already present — skipping');
    return;
  }

  // Clean slate
  await prisma.comment.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.label.deleteMany();
  await prisma.cardMember.deleteMany();
  await prisma.card.deleteMany();
  await prisma.list.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();

  // ── Members ────────────────────────────────────────────────
  const alice   = await prisma.user.create({ data: { email: 'alice@team.com',   name: 'Alice Johnson' } });
  const bob     = await prisma.user.create({ data: { email: 'bob@team.com',     name: 'Bob Smith'    } });
  const carol   = await prisma.user.create({ data: { email: 'carol@team.com',   name: 'Carol White'  } });
  const dave    = await prisma.user.create({ data: { email: 'dave@team.com',    name: 'Dave Brown'   } });
  const _default = await prisma.user.create({ data: { email: 'default@manageable.app', name: 'You' } });

  console.log('✅ Created 5 team members');

  // ── Sample Board ────────────────────────────────────────────
  const board = await prisma.board.create({
    data: {
      id: 'sample',
      title: '🚀 Product Launch Q2',
      description: 'End-to-end tracking for the Q2 product launch — design, dev, QA & ship.',
      background: 'galaxy',
      lists: {
        create: [
          // ── List 1: Backlog ────────────────────────────────
          {
            title: '📋 Backlog',
            order: 0,
            cards: {
              create: [
                {
                  title: 'User Research & Interviews',
                  description: 'Interview 10 target users to understand pain points',
                  order: 0,
                  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                  labels: { create: [{ name: 'Research', color: '#a855f7' }] },
                  members: { create: [{ userId: alice.id }] },
                  checklists: {
                    create: [
                      { title: 'Create interview script', isCompleted: true },
                      { title: 'Schedule 10 interviews', isCompleted: true },
                      { title: 'Conduct interviews', isCompleted: false },
                      { title: 'Synthesize findings', isCompleted: false },
                    ]
                  },
                  comments: {
                    create: [{ authorName: 'Alice Johnson', text: 'Interview guide drafted and shared with the team!' }]
                  }
                },
                {
                  title: 'Competitor Analysis',
                  description: 'Analyse top 5 competitors — pricing, features, UX',
                  order: 1,
                  labels: { create: [{ name: 'Research', color: '#a855f7' }] },
                  members: { create: [{ userId: bob.id }] },
                },
                {
                  title: 'Define MVP Scope',
                  description: 'List must-have features for the first release',
                  order: 2,
                  dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                  labels: { create: [{ name: 'Planning', color: '#f97316' }] },
                  members: { create: [{ userId: _default.id }, { userId: alice.id }] },
                },
              ]
            }
          },

          // ── List 2: In Progress ────────────────────────────
          {
            title: '🔥 In Progress',
            order: 1,
            cards: {
              create: [
                {
                  title: 'Design System Setup',
                  description: 'Create component library, colour tokens and typography scale',
                  order: 0,
                  dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                  labels: { create: [{ name: 'Design', color: '#3b82f6' }] },
                  members: { create: [{ userId: carol.id }] },
                  checklists: {
                    create: [
                      { title: 'Colour palette', isCompleted: true },
                      { title: 'Typography', isCompleted: true },
                      { title: 'Button variants', isCompleted: true },
                      { title: 'Form components', isCompleted: false },
                      { title: 'Icon set', isCompleted: false },
                    ]
                  }
                },
                {
                  title: 'Auth Flow — Email + Google',
                  description: 'Email/password signup, login, JWT tokens, Google OAuth',
                  order: 1,
                  labels: { create: [{ name: 'Backend', color: '#ef4444' }] },
                  members: { create: [{ userId: bob.id }, { userId: dave.id }] },
                  checklists: {
                    create: [
                      { title: 'Email signup endpoint', isCompleted: true },
                      { title: 'JWT middleware', isCompleted: true },
                      { title: 'Google OAuth', isCompleted: false },
                      { title: 'Password reset flow', isCompleted: false },
                    ]
                  },
                  comments: {
                    create: [
                      { authorName: 'Bob Smith', text: 'JWT middleware is done. Google OAuth next.' },
                      { authorName: 'Dave Brown', text: 'I can take the OAuth part — will push a PR tomorrow.' },
                    ]
                  }
                },
                {
                  title: 'Kanban Drag & Drop',
                  description: 'Implement @dnd-kit for reordering cards and lists',
                  order: 2,
                  labels: { create: [{ name: 'Frontend', color: '#22c55e' }] },
                  members: { create: [{ userId: _default.id }] },
                },
              ]
            }
          },

          // ── List 3: Review ─────────────────────────────────
          {
            title: '🔍 In Review',
            order: 2,
            cards: {
              create: [
                {
                  title: 'Landing Page Design',
                  description: 'Hero, features, pricing, CTA — Figma to Next.js',
                  order: 0,
                  labels: { create: [{ name: 'Design', color: '#3b82f6' }, { name: 'Frontend', color: '#22c55e' }] },
                  members: { create: [{ userId: carol.id }, { userId: alice.id }] },
                  comments: {
                    create: [{ authorName: 'Carol White', text: 'Designs handed off! Feedback welcome before I merge.' }]
                  }
                },
                {
                  title: 'API Documentation',
                  description: 'Document all REST endpoints with request/response examples',
                  order: 1,
                  labels: { create: [{ name: 'Docs', color: '#eab308' }] },
                  members: { create: [{ userId: dave.id }] },
                },
              ]
            }
          },

          // ── List 4: Done ───────────────────────────────────
          {
            title: '✅ Done',
            order: 3,
            cards: {
              create: [
                {
                  title: 'Project Kickoff & Setup',
                  description: 'Repo init, branch strategy, CI pipeline, team onboarding',
                  order: 0,
                  completed: true,
                  labels: { create: [{ name: 'Setup', color: '#14b8a6' }] },
                },
                {
                  title: 'Database Schema Design',
                  description: 'Prisma schema for Users, Boards, Lists, Cards, Labels, Checklists, Members',
                  order: 1,
                  completed: true,
                  labels: { create: [{ name: 'Backend', color: '#ef4444' }] },
                  members: { create: [{ userId: bob.id }] },
                },
                {
                  title: 'Tech Stack Decision',
                  description: 'Next.js frontend, Node/Express backend, SQLite with Prisma ORM',
                  order: 2,
                  completed: true,
                  labels: { create: [{ name: 'Planning', color: '#f97316' }] },
                },
              ]
            }
          },
        ]
      }
    }
  });

  console.log('✅ Seeded sample board:', board.id);
  console.log('🎉 Database is ready!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
