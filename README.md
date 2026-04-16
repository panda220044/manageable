# Trello Clone - Full Stack Project Management App

A beautiful, functional Trello clone built with Next.js (App Router), Node.js/Express, and PostgreSQL (via Prisma).

## Features
- **Board Management**: Minimal UI for viewing workspaces.
- **Kanban Lists**: Create, rename, delete and reorder lists horizontally.
- **Drag & Drop Cards**: Move cards vertically in a list and horizontally across lists using `@dnd-kit`.
- **Card Details**: Add rich descriptions, interact with checklists, manage task members.
- **Glassmorphic UI**: High-end modern UI powered by Tailwind CSS.

---

## 🚀 Quick Setup Guide

Because you mentioned you are not a software engineer, I have designed this set of instructions to be as copy-paste friendly as possible! You will run this application in two pieces: the Backend API and the Frontend Interface.

### Step 1: Getting a Database
This app requires **PostgreSQL**. If you don't have it installed locally, the easiest way is to get a free cloud database (takes 2 minutes).
1. Go to [Neon.tech](https://neon.tech/) and create a free account.
2. Follow their portal to create a new "Project" / Database.
3. Once created, copy the **Connection String** they give you. (It looks something like `postgresql://user:pass@ep-cool-db.us-east-1.aws.neon.tech/neondb?sslmode=require`).

Open the file `backend/.env` in your editor, and replace the `DATABASE_URL` with your new connection string.
*(If you happen to use Docker, you can simply open a terminal in the root folder and run `docker-compose up -d` instead of Neon!)*

### Step 2: Set up the Backend
Open up a terminal (Command Prompt or PowerShell) and run the following commands:
```bash
cd backend
npx prisma db push
npx ts-node prisma/seed.ts
npm run dev
```
*Note: `db push` will magically set up all your database tables, `seed.ts` populates a fake Trello board with some tasks, and `npm run dev` starts the API that powers the game!*
**Keep this terminal open!**

### Step 3: Set up the Frontend
Open up a **second, brand new terminal** (leaving the old one running) and run:
```bash
cd frontend
npm run dev
```
This boots up the User Interface!

### Step 4: Use the App
Open your web browser and navigate to:
**👉 http://localhost:3000**

You will see your newly seeded default board waiting for you! Click on the board, drag some cards around, click a card to open its details, and modify your tasks!

---

## Deployment Recommendations
- **Frontend**: [Vercel](https://vercel.com). Simply drag and drop your `frontend` folder or connect via GitHub. Add `NEXT_PUBLIC_API_URL` to point to your live backend.
- **Backend**: [Render](https://render.com) or [Railway](https://railway.app). Connect to GitHub, set Root Directory to `backend`, Build Command to `npm install && npx prisma db push && tsc`, and Start Command to `npm start`. Add `DATABASE_URL` in their environment variables settings.
- **Database**: The Neon or Supabase URI you used locally can remain your production database, or you can provision a new one specifically for production!
