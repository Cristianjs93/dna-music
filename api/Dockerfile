# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# --- Install all dependencies (build + prisma CLI) ---
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --- Generate Prisma client and compile NestJS ---
FROM deps AS build
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build?schema=public"
COPY prisma ./prisma
COPY prisma.config.ts tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run db:generate
RUN npm run build

# --- Production dependencies only ---
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# --- Runtime image ---
FROM base AS runner
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY prisma.config.ts ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/generated ./generated
COPY --from=build /app/prisma ./prisma

USER node
EXPOSE 3000

CMD ["node", "dist/main.js"]
