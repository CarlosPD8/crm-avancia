"use server";

import { PrismaClient } from "@prisma/client";

const globalForPrismaT = globalThis as unknown as { prismaT: PrismaClient };

export const prismaT =
  globalForPrismaT.prismaT ??
  new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_TELEGRAM_URL } },
  });

if (process.env.NODE_ENV !== "production") globalForPrismaT.prismaT = prismaT;
