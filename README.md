# Manageable — Trello-style Kanban Board

A full-stack Kanban project management application inspired by Trello, built from scratch with Next.js and Node.js/Express.

🔗 **Live Demo:** *(deploy URL here)*
📦 **Repository:** https://github.com/panda220044/manageable

<img width="1919" height="846" alt="Screenshot 2026-04-20 094127" src="https://github.com/user-attachments/assets/329f9b80-47cd-4418-be33-6ed6237e7686" />
<img width="894" height="823" alt="Screenshot 2026-04-20 094145" src="https://github.com/user-attachments/assets/4db28037-4b18-4856-9896-8815dee8fcdb" />
<img width="1797" height="783" alt="Screenshot 2026-04-20 094204" src="https://github.com/user-attachments/assets/02274ad4-b626-46c3-be2a-61ecd0fb6b19" />
<img width="688" height="804" alt="Screenshot 2026-04-20 094219" src="https://github.com/user-attachments/assets/36c6d2f8-9600-41f3-bb82-32a834af874a" />
<img width="1219" height="745" alt="Screenshot 2026-04-20 094259" src="https://github.com/user-attachments/assets/fe17f4ec-8d67-4dd1-8475-feb42343d3fb" />




---

## ✨ Features

| Feature | Status |
|---|---|
| Kanban board with lists and cards | ✅ |
| Drag & drop to reorder lists | ✅ |
| Drag & drop to move/reorder cards | ✅ |
| Create, edit, delete lists | ✅ |
| Create, edit, delete cards | ✅ |
| Card labels (coloured tags) | ✅ |
| Card due dates | ✅ |
| Card checklists with progress bar | ✅ |
| Assign members to cards | ✅ |
| Card comments & activity log | ✅ |
| Search cards by title | ✅ |
| Filter by label / member / due date | ✅ |
| Board background customisation (8 themes) | ✅ |
| Multiple boards support | ✅ |
| No login required — default user auto-loaded | ✅ |
| Sample board with seed data pre-loaded | ✅ |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Drag & Drop** | @dnd-kit/core, @dnd-kit/sortable |
| **Icons** | lucide-react |
| **Backend** | Node.js, Express 5, TypeScript |
| **ORM** | Prisma ORM |
| **Database** | PostgreSQL (recommended for deployment) |
| **Auth** | JWT (auto-login for default user) |

---

## 🗄 Database Schema

```
User          -- team members assignable to cards
Board         -- top-level workspace with background theme
List          -- columns inside a board (ordered)
Card          -- task items inside a list (ordered)
Label         -- coloured tag attached to a card
ChecklistItem -- sub-task inside a card with completion state
CardMember    -- join table: card ↔ user assignment
Comment       -- text comment with author name + timestamp on a card
```

All relationships use cascading deletes — removing a board removes all its lists, cards, labels, etc.

---

## 🚀 Quick Setup Guide

This project runs in 3 parts:

- **Frontend**: Next.js app
- **Backend**: Express API
- **Database**: PostgreSQL

### Prerequisites

- Node.js 18+
- npm
- A PostgreSQL database

If you do not have PostgreSQL locally, the easiest option is to create a free hosted database on Neon, Supabase, Render Postgres, or Railway Postgres.

### 1. Clone the repository

```bash
git clone https://github.com/panda220044/manageable.git
cd manageable
```

### 2. Create backend environment file

Create `backend/.env` and paste:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/manageable?schema=public"
PORT=5000
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=optional
```

### 3. Start the backend

Open a terminal inside `backend/` and run:

```bash
npm install
npm run db:push
npm run seed
npm run dev
```

The backend will start on `http://localhost:5000`.

### 4. Create frontend environment file

Create `frontend/.env.local` and paste:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=optional
```

### 5. Start the frontend

Open a second terminal inside `frontend/` and run:

```bash
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`.

### 6. Use the app

Open **http://localhost:3000**

The app auto-logs in the default demo user and loads the seeded sample board, so you can immediately:

- create boards
- create/edit/delete lists
- create/edit/delete cards
- drag lists and cards
- add labels, due dates, checklists, members, and comments

---

## 🌱 Seed Data

Running `npm run seed` creates:
- **5 team members:** You, Alice Johnson, Bob Smith, Carol White, Dave Brown
- **1 sample board:** "🚀 Product Launch Q2" with galaxy background
- **4 lists:** Backlog, In Progress, In Review, Done
- **12 cards** with various labels, due dates, checklists, member assignments and comments

---

## 💡 Assumptions

1. **No login required** — the app automatically authenticates as a default user (`You`) on first load. Manual login/signup is still available for multi-user testing.
2. **PostgreSQL for persistence** — chosen so the app works reliably when deployed.
3. **Client-side filtering** — search and filter logic runs in the browser to keep the API simple and snappy.
4. **Drag & drop order persisted** — card and list `order` fields are updated via API on every drag-end event.
5. **Sample board is read-only in the demo** — live boards created by users are fully persistent.

---

## 📁 Project Structure

```
manageable/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     ← Database schema
│   │   ├── seed.ts           ← Sample data seeder
│   │   └── (DB created externally via `DATABASE_URL`)
│   └── src/
│       └── index.ts          ← All API routes (Express)
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx          ← Auto-login landing
        │   ├── dashboard/        ← Board list view
        │   └── board/[id]/       ← Individual board view
        └── components/
            ├── Board.tsx         ← Drag & drop board
            ├── List.tsx          ← List column
            ├── CardItem.tsx      ← Card preview
            └── CardModal.tsx     ← Full card detail modal
```

---

## 👤 Author

Built by **Eashita Mahajan** for the Scaler project assignment.

---
## 🚀 Deployment Recommendation

Because this project has a separate **Next.js frontend + Express/Prisma backend**, the best deployment setup is:

- **Frontend (Next.js)**: deploy on **Vercel**
- **Backend (Express + Prisma)**: deploy on **Render** (or **Railway**)
- **Database**: use **PostgreSQL** (Render Postgres / Railway Postgres)

### Frontend deployment: Vercel

Set this environment variable on Vercel:
- `NEXT_PUBLIC_API_URL=https://<your-backend-host>/api`

### Backend deployment: Render

Create a Render Web Service for the `backend` folder.

Set these environment variables:
- `DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/manageable?schema=public`
- `PORT=5000`
- `JWT_SECRET=...`
- `GOOGLE_CLIENT_ID=...` (optional, unless you use Google login)

Use:

- Root directory: `backend`
- Start command: `npm run start:prod`

### Recommended production stack

- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Render Postgres, Railway Postgres, Neon, or Supabase
