import { PrismaClient } from '@prisma/client';
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.ghostPrisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.ghostPrisma = prisma;
