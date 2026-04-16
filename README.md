# Manageable — Trello-style Kanban Board

A full-stack Kanban project management application inspired by Trello, built from scratch with Next.js and Node.js/Express.

🔗 **Live Demo:** *(deploy URL here)*
📦 **Repository:** https://github.com/panda220044/manageable

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

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- npm

### 1. Clone the repo
```bash
git clone https://github.com/panda220044/manageable.git
cd manageable
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env        # or create .env manually (see below)
npm install
npm run db:push             # create schema in your DB
npm run seed                # seed sample board + members
npm run dev                 # starts on http://localhost:5000
```

**`backend/.env`**
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/manageable?schema=public"
PORT=5000
JWT_SECRET=your_jwt_secret_here
```

### 3. Frontend setup
```bash
cd frontend
cp .env.local.example .env.local  # or create manually
npm install
npm run dev                        # starts on http://localhost:3000
```

**`frontend/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Open the app
Visit **http://localhost:3000** — you will be automatically logged in as the default user and land directly on the dashboard with the sample board ready.

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

Built by **Eash Mahajan** for the Scaler project assignment.

---
## 🚀 Deployment Recommendation (Best)

Because this is a separate **Next.js frontend + Express/Prisma backend**, the best setup is:

- **Frontend (Next.js)**: deploy on **Vercel**
- **Backend (Express + Prisma)**: deploy on **Render** (or **Railway**)
- **Database**: use **PostgreSQL** (Render Postgres / Railway Postgres)

### Vercel (frontend) env var
Set:
- `NEXT_PUBLIC_API_URL=https://<your-backend-host>/api`

### Render (backend) env vars
Set:
- `DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/manageable?schema=public`
- `PORT=5000`
- `JWT_SECRET=...`
- `GOOGLE_CLIENT_ID=...` (optional, unless you use Google login)

On Render create the backend service using:
- Build/Start: run `npm run start:prod` inside `backend/`
