import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// In Prisma v7, we must explicitly create the connection adapter
const adapter = new PrismaMssql(process.env.DATABASE_URL!);

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter, // <--- This is the mandatory puzzle piece for Prisma v7
        log: ['query', 'info', 'warn', 'error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;