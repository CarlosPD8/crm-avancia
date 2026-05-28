import { PrismaClient } from "@prisma/client";

let _client: PrismaClient | null = null;

export function getPrismaTelegram(): PrismaClient | null {
  if (!process.env.DATABASE_TELEGRAM_URL) return null;
  if (_client) return _client;
  _client = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_TELEGRAM_URL } },
  });
  return _client;
}
