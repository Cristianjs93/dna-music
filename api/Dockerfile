# syntax=docker/dockerfile:1.7

# --- Stage 1: Alpine Base with optimized caching ---
FROM node:24-alpine AS base
ENV DIR=/app
WORKDIR $DIR
# Instalamos libc6-compat porque Prisma la requiere para los binarios del motor en Alpine
RUN apk add --no-cache libc6-compat

# --- Stage 2: Development and Production Dependency Installer ---
FROM base AS deps
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

# --- Stage 3: Artifact Generation and Compilation ---
FROM base AS build
# Copying dependencies from the previous stage
COPY --from=deps $DIR/node_modules ./node_modules
# Copying the Prisma schema first to take advantage of Docker caching
COPY prisma ./prisma/
# Fake variable required by prisma.config.ts at compile time
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build?schema=public"
RUN npx prisma generate

# Copy the rest of the source code to compile NestJS
COPY tsconfig*.json nest-cli.json prisma.config.ts ./
COPY src ./src/
RUN npm run build

# --- Stage 4: Exclusive preparation of production dependencies ---
FROM base AS prod-deps
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# --- Stage 5: Ultralight final runtime environment ---
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000

# Copy production dependencies and generated Prisma client
COPY --from=prod-deps $DIR/node_modules ./node_modules
COPY --from=build $DIR/dist ./dist
COPY --from=build $DIR/node_modules/.prisma ./node_modules/.prisma
COPY --from=build $DIR/node_modules/@prisma/client ./node_modules/@prisma/client

USER node
EXPOSE $PORT

CMD ["node", "dist/main.js"]
