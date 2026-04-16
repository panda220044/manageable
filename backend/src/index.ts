import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey123';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy');

app.use(cors());
app.use(express.json());

// Auth
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
  
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || (!user.password && password)) return res.status(400).json({ error: 'Invalid credentials' });
    
    const valid = user.password ? await bcrypt.compare(password, user.password) : false;
    if (!valid && user.password) return res.status(400).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.name) {
       return res.status(400).json({ error: 'Invalid Google token payload' });
    }
    
    let user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) {
        user = await prisma.user.create({
            data: { email: payload.email, name: payload.name }
        });
    }
    
    const ourToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token: ourToken, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Google authentication failed. Have you configured your GOOGLE_CLIENT_ID?' });
  }
});

// Users
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Boards
app.get('/api/boards', async (req, res) => {
  const boards = await prisma.board.findMany();
  res.json(boards);
});

app.post('/api/boards', async (req, res) => {
  const { title, description, background } = req.body;
  const board = await prisma.board.create({ data: { title, description, background } });
  res.status(201).json(board);
});

app.put('/api/boards/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, background } = req.body;
  const board = await prisma.board.update({ where: { id }, data: { title, description, background } });
  res.json(board);
});

app.delete('/api/boards/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.board.delete({ where: { id } });
  res.status(204).send();
});

app.get('/api/boards/:id', async (req, res) => {
  const { id } = req.params;
  const board = await prisma.board.findUnique({
    where: { id },
    include: {
      lists: {
        orderBy: { order: 'asc' },
        include: {
          cards: {
            orderBy: { order: 'asc' },
            include: { labels: true, checklists: true, members: { include: { user: true } }, comments: { orderBy: { createdAt: 'asc' } } },
          },
        },
      },
    },
  });
  if (!board) return res.status(404).json({ error: 'Board not found' });
  res.json(board);
});

// Lists
app.post('/api/lists', async (req, res) => {
  const { title, boardId, order } = req.body;
  const list = await prisma.list.create({ data: { title, boardId, order } });
  res.status(201).json(list);
});

app.put('/api/lists/:id', async (req, res) => {
  const { id } = req.params;
  const { title, order } = req.body;
  const list = await prisma.list.update({ where: { id }, data: { title, order } });
  res.json(list);
});

app.delete('/api/lists/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.list.delete({ where: { id } });
  res.status(204).send();
});

// Cards
app.post('/api/cards', async (req, res) => {
  const { title, listId, order, description } = req.body;
  const card = await prisma.card.create({
    data: { title, listId, order, description },
    include: { labels: true, checklists: true, members: { include: { user: true } } }
  });
  res.status(201).json(card);
});

app.put('/api/cards/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, order, listId, dueDate, completed } = req.body;
  const card = await prisma.card.update({
    where: { id },
    data: { title, description, order, listId, dueDate, completed },
    include: { labels: true, checklists: true, members: { include: { user: true } } }
  });
  res.json(card);
});

app.delete('/api/cards/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.card.delete({ where: { id } });
  res.status(204).send();
});

// Labels
app.post('/api/cards/:cardId/labels', async (req, res) => {
  const { cardId } = req.params;
  const { name, color } = req.body;
  const label = await prisma.label.create({ data: { cardId, name, color } });
  res.status(201).json(label);
});

app.delete('/api/labels/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.label.delete({ where: { id } });
  res.status(204).send();
});

// Checklists
app.post('/api/cards/:cardId/checklists', async (req, res) => {
  const { cardId } = req.params;
  const { title } = req.body;
  const item = await prisma.checklistItem.create({ data: { cardId, title } });
  res.status(201).json(item);
});

app.put('/api/checklists/:id', async (req, res) => {
  const { id } = req.params;
  const { isCompleted, title } = req.body;
  const item = await prisma.checklistItem.update({ where: { id }, data: { isCompleted, title } });
  res.json(item);
});

app.delete('/api/checklists/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.checklistItem.delete({ where: { id } });
  res.status(204).send();
});

// Card Members
app.post('/api/cards/:cardId/members', async (req, res) => {
  const { cardId } = req.params;
  const { userId } = req.body;
  try {
    const member = await prisma.cardMember.create({
      data: { cardId, userId },
      include: { user: true }
    });
    res.status(201).json(member);
  } catch {
    res.status(400).json({ error: 'Member already added or user not found' });
  }
});

app.delete('/api/cards/:cardId/members/:userId', async (req, res) => {
  const { cardId, userId } = req.params;
  await prisma.cardMember.delete({ where: { cardId_userId: { cardId, userId } } });
  res.status(204).send();
});

// Comments
app.get('/api/cards/:cardId/comments', async (req, res) => {
  const { cardId } = req.params;
  const comments = await prisma.comment.findMany({
    where: { cardId },
    orderBy: { createdAt: 'asc' }
  });
  res.json(comments);
});

app.post('/api/cards/:cardId/comments', async (req, res) => {
  const { cardId } = req.params;
  const { text, authorName } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'Comment text required' });
  const comment = await prisma.comment.create({ data: { cardId, text, authorName: authorName || 'Anonymous' } });
  res.status(201).json(comment);
});

app.delete('/api/comments/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.comment.delete({ where: { id } });
  res.status(204).send();
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
