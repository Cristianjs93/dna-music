# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS base
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# --- Install all dependencies (build + prisma CLI) ---
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --- Generate Prisma client and compile NestJS ---
FROM deps AS build
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build?schema=public"
COPY prisma ./prisma
COPY prisma.config.ts tsconfig.json tsconfig.build.json nest-cli.json .swcrc ./
COPY src ./src
RUN npm run db:generate
RUN test -f generated/prisma/index.js
RUN npm run build
RUN npm prune --omit=dev

# --- Runtime image ---
FROM base AS runner
ENV NODE_ENV=production

COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/generated ./generated

RUN test -f generated/prisma/index.js \
  && chown -R node:node /app

USER node
EXPOSE 3000

CMD ["node", "dist/main.js"]
