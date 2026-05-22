# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl && \
    addgroup -S nodejs && adduser -S nextjs -G nodejs && \
    mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Include Prisma client and CLI for runtime + migrations
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/prisma ./prisma
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh && \
    chown -R nextjs:nodejs /app/node_modules/@prisma /app/node_modules/.prisma /app/node_modules/prisma

USER nextjs

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

CMD ["./docker-entrypoint.sh"]
