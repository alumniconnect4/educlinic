FROM node:24-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace & dependency manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy Prisma files and configuration
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Generate Prisma Client
RUN pnpm prisma generate

# Copy source code and build config
COPY tsconfig.json index.ts ./
COPY src ./src

# Build TypeScript to dist
RUN pnpm build

# Production Runner Stage
FROM node:24-alpine AS runner

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

ENV NODE_ENV=PRODUCTION
ENV PORT=4000
ENV HOST=0.0.0.0

# Copy node_modules, generated Prisma client, compiled output, prisma schema, and config
COPY package.json pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy || pnpm prisma migrate deploy || true; node dist/index.js"]
