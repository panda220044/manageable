# Trello Clone - Project Implementation Summary

## Overview
The project is a full-stack Trello clone Kanban application. We have successfully implemented a robust backend using Node.js/Express and Prisma (with SQLite), alongside a modern Next.js frontend featuring drag-and-drop functionality and a glassmorphic UI.

---

## 1. Backend Implementation (`/backend`)
The backend is a RESTful API built with **Express** and **Prisma ORM**.

### Database Schema
Leveraging **SQLite** for development (as configured in `schema.prisma`), the database consists of the following core models:
- **User**: Stores user details (`id`, `email`, `name`).
- **Board**: A container for lists (`id`, `title`).
- **List**: Represents columns in the board, with ordering (`id`, `title`, `order`, `boardId`).
- **Card**: Represents the individual tasks in a list (`id`, `title`, `description`, `order`, `listId`, `dueDate`).
- **Additional Entities**: `Label`, `ChecklistItem`, and `CardMember` to provide deeper card features such as colorful tags, checklists, and assigned users.

### API Endpoints Implemented
- **Boards**: 
  - `GET /api/boards` - Fetch all boards.
  - `GET /api/boards/:id` - Fetch a specific board populated with its associated lists, cards, labels, etc.
  - `POST /api/boards` - Create a new board.
- **Lists**:
  - `POST /api/lists` - Create a new list/column.
  - `PUT /api/lists/:id` - Update list details (e.g., reordering or renaming).
  - `DELETE /api/lists/:id` - Delete a list.
- **Cards**:
  - `POST /api/cards` - Create a new card under a list.
  - `PUT /api/cards/:id` - Update a card (handling horizontal/vertical drag-and-drop or content updates).
  - `DELETE /api/cards/:id` - Delete a card.

### Utilities
- `seed.ts` script to populate the local database with an initial default board with sample content.

---

## 2. Frontend Implementation (`/frontend`)
The frontend is a **Next.js (App Router)** application styled with **Tailwind CSS**.

### Core Components Built
- **Board Component (`Board.tsx`)**: The main Kanban interface handling rendering of multiple lists side-by-side. 
- **List Component (`List.tsx`)**: Renders a vertical column that contains multiple cards. Supports renaming lists and adding new underlying tasks.
- **Card Item (`CardItem.tsx`)**: The individual draggable task blocks displayed inside lists.
- **Card Modal (`CardModal.tsx`)**: A detailed view overlaid on the screen when a user clicks a card, allowing users to read descriptions, view members, adjust due dates, etc.
- **Drag & Drop**: Powered by `@dnd-kit`, we've integrated both horizontal dragging (lists) and horizontal/vertical dragging (cards across lists).

---

## 3. Current Running State
Both the backend and frontend are currently **active and running on your machine**.

To begin using the application right now:
1. Open your web browser.
2. Navigate to **[http://localhost:3000](http://localhost:3000)**.
3. You will be greeted by the seeded default board. You can immediately drag cards, click on them to edit, and interact with the full Trello-like interface.

*(The backend API is running behind the scenes on `http://localhost:5000` connected to your local `dev.db` database).*
