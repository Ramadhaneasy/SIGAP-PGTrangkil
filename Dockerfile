# =========================================================
# Dockerfile untuk SIGAP (Sistem Informasi Gangguan & Pelaporan)
# PT Kebon Agung Pabrik Gula Trangkil
# Multi-Stage Build: Node.js 20 Alpine + Next.js Standalone + Prisma
# =========================================================

# ---------------------------------------------------------
# Stage 1: Base Runtime (Alpine + Prisma Requirements)
# ---------------------------------------------------------
FROM node:20-alpine AS base

# Install libc6-compat & openssl yang dibutuhkan Prisma ORM pada Alpine Linux
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# ---------------------------------------------------------
# Stage 2: Dependencies Installation
# ---------------------------------------------------------
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install seluruh dependencies dan generate Prisma client
RUN npm ci --legacy-peer-deps
RUN npx prisma generate

# ---------------------------------------------------------
# Stage 3: Source Code Build
# ---------------------------------------------------------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Konfigurasi environment build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Pastikan Prisma Client ter-generate untuk arsitektur target
RUN npx prisma generate

# Kompilasi aplikasi Next.js (menghasilkan folder .next/standalone)
RUN npm run build

# ---------------------------------------------------------
# Stage 4: Production Runner (Image Akhir yang Minimalis)
# ---------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Gunakan non-root user untuk keamanan container
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Salin aset publik (gambar, icon, dll.) dengan kepemilikan user nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
RUN chmod -R 755 ./public

# Setup direktori cache .next dengan hak akses user nextjs
RUN mkdir .next
RUN chown nextjs:nodejs .next
RUN chmod -R 755 .next

# Salin output standalone dan aset statis Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Salin schema Prisma untuk kebutuhan runtime jika diperlukan
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Salin entrypoint script & pastikan format line ending LF (bukan CRLF Windows)
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN sed -i 's/\r$//' ./docker-entrypoint.sh && chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
