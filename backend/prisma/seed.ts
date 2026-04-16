import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();
  await prisma.board.deleteMany();

  const user1 = await prisma.user.create({ data: { email: 'eash@example.com', name: 'Eash Mahajan' } });
  const user2 = await prisma.user.create({ data: { email: 'john@example.com', name: 'John Doe' } });

  const board = await prisma.board.create({
    data: {
      title: 'Project Roadmap',
      lists: {
        create: [
          {
            title: 'To Do',
            order: 0,
            cards: {
              create: [
                {
                  title: 'Setup Database',
                  description: 'Initialize PostgreSQL and Prisma schema',
                  order: 0,
                  labels: { create: [{ name: 'Backend', color: '#f87171' }] }
                },
                {
                  title: 'Design Kanban Board UI',
                  description: 'Design the Trello clone using Tailwind CSS',
                  order: 1,
                  labels: { create: [{ name: 'Frontend', color: '#60a5fa' }] }
                }
              ]
            }
          },
          {
            title: 'In Progress',
            order: 1,
            cards: {
              create: [
                {
                  title: 'Drag and Drop Implementation',
                  description: 'Wire up @dnd-kit',
                  order: 0,
                  labels: { create: [{ name: 'Feature', color: '#34d399' }] },
                  members: { create: [{ userId: user1.id }] }
                }
              ]
            }
          },
          {
            title: 'Done',
            order: 2,
            cards: {
              create: [
                {
                  title: 'Project Initialization',
                  description: 'Setup Next.js and Express apps',
                  order: 0
                }
              ]
            }
          }
        ]
      }
    }
  });

  console.log('Seeded database with default board:', board.id);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
