# DNA Music API

NestJS REST backend for branch-scoped student management. All routes are prefixed with `/api`. Interactive documentation: `/api/docs` (when the server is running).

For project context and business domain, see the [root README](../README.md).

## Requirements

- Node.js **24.16.0** (`nvm use` at repo root reads `.nvmrc`)
- PostgreSQL (local or Neon)
- npm

## Quick start

```bash
cd api
npm install
cp .env.example .env
# Edit DATABASE_URL and other variables

npm run db:setup    # generate client + migrate + seed
npm run start:dev   # http://localhost:3000/api
```

Swagger UI: `http://localhost:3000/api/docs`

## Environment variables

Copy `.env.example` to `.env`. Never commit `.env`.

| Variable          | Description                                           | Example                                                                 |
| ----------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| `PORT`            | HTTP port                                             | `3000`                                                                  |
| `DATABASE_URL`    | PostgreSQL connection string                          | `postgresql://postgres:postgres@localhost:5432/dna_music?schema=public` |
| `JWT_SECRET`      | JWT signing secret (long random string in production) | —                                                                       |
| `JWT_EXPIRES_IN`  | Token lifetime                                        | `1h`                                                                    |
| `CORS_ORIGINS`    | Allowed browser origins (comma-separated)             | `http://localhost:5173,http://localhost:3000`                           |
| `BODY_SIZE_LIMIT` | JSON/urlencoded body cap                              | `100kb`                                                                 |
| `THROTTLE_TTL_MS` | Rate-limit window (ms)                                | `60000`                                                                 |
| `THROTTLE_LIMIT`  | Max requests per window                               | `100`                                                                   |

For CI, only `DATABASE_URL` is required as a GitHub Actions secret (see [CI/CD](#cicd)).

## Scripts

| Command                     | Description                                 |
| --------------------------- | ------------------------------------------- |
| `npm run start:dev`         | Dev server with watch                       |
| `npm run start:prod`        | Run compiled `dist/main`                    |
| `npm run build`             | Compile to `dist/`                          |
| `npm run lint`              | ESLint                                      |
| `npm run test`              | Unit tests (Jest)                           |
| `npm run test:cov`          | Coverage report                             |
| `npm run test:e2e`          | E2E tests (local only; not in CI)           |
| `npm run db:generate`       | Generate Prisma client                      |
| `npm run db:migrate`        | Apply migrations (dev)                      |
| `npm run db:migrate:deploy` | Apply migrations (production)               |
| `npm run db:seed`           | Load sample data (upserts — safe to re-run) |
| `npm run db:setup`          | `generate` + `migrate deploy` + `seed`      |
| `npm run db:reset`          | Reset DB and re-run migrations              |
| `npm run db:studio`         | Prisma Studio GUI                           |

## Architecture

Modular NestJS design. Each feature is an isolated module with controller, service, DTOs, and constants.

```text
src/
├── auth/             # Login, JWT strategy, guards, decorators
├── users/            # User CRUD + RBAC rules
├── headquarters/     # Branch CRUD + status toggle
├── students/         # Student CRUD + branch scoping
├── stats/            # Aggregated dashboard metrics (ADMIN)
├── prisma/           # Global PrismaModule / PrismaService
├── config/           # Security (helmet, CORS, body limit), Swagger
├── util/             # Domain errors, Prisma error mapping, parsing
├── app.module.ts
└── main.ts
prisma/
├── schema.prisma
├── migrations/
└── seed.ts
```

### Cross-cutting concerns

| Concern       | Implementation                                                             |
| ------------- | -------------------------------------------------------------------------- |
| Auth          | Global `JwtAuthGuard`; `@Public()` for login                               |
| RBAC          | Global `RolesGuard`; `@Roles(Role.ADMIN)` on handlers                      |
| Rate limiting | Global `ThrottlerGuard`; stricter limit on `POST /auth/login`              |
| Validation    | Global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`)              |
| Errors        | `domainException()` for business rules; `rethrowPrismaKnownError()` for DB |
| Soft delete   | `deletedAt` on User, Headquarter, Student                                  |
| Logging       | NestJS `Logger` per service class                                          |
| Helmet        | Global helmet() middleware                                                 |
| CORS          | Global enableCors() restricted via environment variables (ALLOWED_ORIGINS) |

### Import aliases (`tsconfig.json`)

| Alias               | Maps to                 |
| ------------------- | ----------------------- |
| `#/*`               | `src/*`                 |
| `#generated/prisma` | Generated Prisma client |
| `#util/*`           | `src/util/*`            |
| `#db/*`             | `prisma/*`              |

## Data model

PostgreSQL via Prisma. Client output: `generated/prisma`.

### Enums

- `Role`: `ADMIN`, `OPERADOR`
- `StudentStatus`: `ACTIVO`, `INACTIVO`, `RETIRADO`

### Models

| Model           | Key fields                                                                         | Notes                                                |
| --------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **User**        | `email`, `password`, `role`, `headquarterId?`                                      | Operators require a branch; admins must not have one |
| **Headquarter** | `name`, `city`, `address`, `isActive`                                              | Unique name; soft delete                             |
| **Student**     | `fullName`, `email`, `phone`, `identityCard`, `program`, `status`, `headquarterId` | Unique contact fields; belongs to one branch         |

All three models include audit fields (`createdById`, `updatedById`) and `deletedAt` for soft delete.

### Database diagram

```mermaiderDiagram
    User ||--o| Headquarter : "assigned to (OPERADOR)"
    Headquarter ||--o{ User : "has operators"
    Headquarter ||--o{ Student : "enrolls"
    Student }o--|| Headquarter : "belongs to"
    User ||--o{ User : "created/updated by"
    User ||--o{ Headquarter : "created/updated by"
    User ||--o{ Student : "created/updated by"

    User {
        uuid id PK
        string name
        string email UK
        string password
        enum role "ADMIN | OPERADOR"
        uuid headquarter_id FK "nullable for ADMIN"
        uuid created_by_id FK
        uuid updated_by_id FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "soft delete"
    }

    Headquarter {
        uuid id PK
        string name UK
        string city
        string address
        boolean is_active
        uuid created_by_id FK
        uuid updated_by_id FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    Student {
        uuid id PK
        string full_name
        string email UK
        string phone UK
        string identity_card UK
        string program
        enum status "ACTIVO | INACTIVO | RETIRADO"
        date enrollment_date
        uuid headquarter_id FK
        uuid created_by_id FK
        uuid updated_by_id FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }
```

**Relationship rules:**

- `ADMIN` users have `headquarter_id = NULL`; `OPERADOR` users must have one.
- Every `Student` belongs to exactly one `Headquarter`.
- Audit FKs (`created_by_id`, `updated_by_id`) reference `User` and are nullable for seed/bootstrap rows.
- Active queries always filter `deleted_at IS NULL`.

## Technical decisions

### Why NestJS?

NestJS provides a structured, opinionated backend framework with built-in dependency injection, modular architecture, and first-class TypeScript support. For an assessment that must demonstrate **security, RBAC, and clean separation of concerns**, its guard/decorator model maps directly to JWT auth and role checks without boilerplate.

### Why Prisma + PostgreSQL?

- **Prisma** — type-safe queries, migration workflow, and schema-as-code fit the CRUD + aggregation requirements (`groupBy`, relations).
- **PostgreSQL** — reliable ACID semantics, strong indexing, and Neon hosting for zero-ops remote DB with GitHub Actions deploy.

### Architecture and patterns

| Pattern                   | Application                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| **Modular monolith**      | One NestJS module per domain (`auth`, `users`, `headquarters`, `students`, `stats`).           |
| **Layered design**        | Controller → Service → Prisma. No DB access in controllers.                                    |
| **Global guards**         | `ThrottlerGuard` → `JwtAuthGuard` → `RolesGuard` applied via `APP_GUARD`.                      |
| **Decorator-driven RBAC** | `@Public()`, `@Roles()`, `@CurrentUser()` keep handlers declarative.                           |
| **DTO validation**        | `class-validator` input DTOs + dedicated `*-response.dto.ts` (password never exposed).         |
| **Domain errors**         | `domainException()` for business rules; `rethrowPrismaKnownError()` for DB constraint mapping. |
| **Soft delete**           | `deletedAt` timestamp instead of hard deletes — preserves audit trail.                         |
| **DB-side aggregation**   | Stats via Prisma `groupBy` / `$queryRaw` — no full-table loads into Node memory.               |
| **Upsert seed**           | Idempotent `prisma/seed.ts` safe for CI re-runs.                                               |

### Why Docker on Render?

Multi-stage Dockerfile ensures reproducible production builds (Prisma generate + Nest compile). Render free tier provides HTTPS and env-var injection without managing a VPS. Migrations run in GitHub Actions, not at container boot — faster, predictable deploys.

## API surface

Base path: `/api`. All routes except `POST /auth/login` require `Authorization: Bearer <token>`.

### Auth (`/api/auth`)

| Method | Path          | Access        | Description                     |
| ------ | ------------- | ------------- | ------------------------------- |
| `POST` | `/auth/login` | Public        | Login → `{ accessToken, user }` |
| `GET`  | `/auth/me`    | Authenticated | Current user profile            |

No public registration endpoint.

### Users (`/api/users`) — ADMIN (except self-update)

| Method   | Path         | Access                                      | Description       |
| -------- | ------------ | ------------------------------------------- | ----------------- |
| `POST`   | `/users`     | ADMIN                                       | Create user       |
| `GET`    | `/users`     | ADMIN                                       | List active users |
| `GET`    | `/users/:id` | ADMIN                                       | Get by ID         |
| `PATCH`  | `/users/:id` | ADMIN; OPERADOR (self only, `name`/`email`) | Update user       |
| `DELETE` | `/users/:id` | ADMIN                                       | Soft-delete       |

### Headquarters (`/api/headquarters`) — ADMIN only

| Method   | Path                       | Description       |
| -------- | -------------------------- | ----------------- |
| `POST`   | `/headquarters`            | Create branch     |
| `GET`    | `/headquarters`            | List branches     |
| `GET`    | `/headquarters/:id`        | Get by ID         |
| `PATCH`  | `/headquarters/:id`        | Update branch     |
| `PATCH`  | `/headquarters/:id/status` | Toggle `isActive` |
| `DELETE` | `/headquarters/:id`        | Soft-delete       |

### Students (`/api/students`) — branch-scoped for OPERADOR

| Method   | Path                   | Description                            |
| -------- | ---------------------- | -------------------------------------- |
| `POST`   | `/students`            | Create student                         |
| `GET`    | `/students`            | List (filtered by branch for OPERADOR) |
| `GET`    | `/students/:id`        | Get by ID (scope-checked)              |
| `PATCH`  | `/students/:id`        | Update student                         |
| `PATCH`  | `/students/:id/status` | Set active/inactive                    |
| `DELETE` | `/students/:id`        | Soft-delete (retired)                  |

### Stats (`/api/stats`) — ADMIN only

| Method | Path     | Description                                                          |
| ------ | -------- | -------------------------------------------------------------------- |
| `GET`  | `/stats` | Aggregated counts per branch and status (Prisma `groupBy` / raw SQL) |

Full request/response schemas: Swagger at `/api/docs`.

## Seed data

`npm run db:seed` creates:

| Entity              | Detail                                  |
| ------------------- | --------------------------------------- |
| Branches            | Bogotá, Medellín, Cali (active)         |
| ADMIN               | `admin@dnamusic.co` / `Admin123!`       |
| OPERATOR (Bogotá)   | `operador.bog@dnamusic.co` / `Oper123!` |
| OPERATOR (Medellín) | `operador.med@dnamusic.co` / `Oper123!` |
| Students            | 6 records across branches and statuses  |

Passwords are bcrypt-hashed in seed.

## Testing

Co-located `*.spec.ts` files. Jest: `jest.config.ts` + `tsconfig.jest.json`.

| Area     | File                                | Coverage                                     |
| -------- | ----------------------------------- | -------------------------------------------- |
| Auth     | `auth/auth.service.spec.ts`         | Login success, generic `Invalid credentials` |
| RBAC     | `auth/guards/roles.guard.spec.ts`   | Role allow/deny                              |
| Students | `students/students.service.spec.ts` | OPERADOR branch scoping                      |
| Stats    | `stats/stats.service.spec.ts`       | Aggregation response mapping                 |

```bash
npm run test        # unit tests (runs in CI)
npm run test:cov    # with coverage
npm run test:e2e    # local only — not in CI yet
```

## CI/CD

Workflows in `.github/workflows/`. Node **24.16.0**.

### API CI (`api-ci.yml`)

Triggers on push/PR to `main` when `api/**` changes (also `workflow_dispatch`).

```text
npm ci → db:generate → lint → build → test
```

Uses a placeholder `DATABASE_URL` so Prisma config loads; no real DB connection.

### Database setup (`db-setup.yml`)

Triggers on push to `main` when Prisma schema, migrations, `prisma.config.ts`, or API lockfile change (also `workflow_dispatch`).

```text
npm ci → db:generate → db:migrate:deploy → db:seed
```

Requires GitHub secret **`DATABASE_URL`**: direct Neon URL with `?sslmode=require`.

### Local CI parity

```bash
npm ci && npm run db:generate && npm run lint && npm run build && npm run test
npm run db:setup   # same as Database setup workflow
```

## Deployment

API runs as a **Docker** container on [Render](https://render.com) (free tier) against an external **Neon** database. Migrations run via GitHub Actions — not at container startup.

| Artifact          | Purpose                                       |
| ----------------- | --------------------------------------------- |
| `Dockerfile`      | Multi-stage production image (Node 24 Alpine) |
| `render.yaml`     | Optional Render Blueprint                     |
| `GET /api/health` | Liveness check                                |

### Render setup (one-time)

1. **New → Web Service** → connect repo.
2. Settings:

   | Field             | Value         |
   | ----------------- | ------------- |
   | Root Directory    | `api`         |
   | Runtime           | Docker        |
   | Health Check Path | `/api/health` |

3. Environment variables:

   | Variable          | Value                                                              |
   | ----------------- | ------------------------------------------------------------------ |
   | `DATABASE_URL`    | Neon URL (`?sslmode=require`; pooled URL for runtime if available) |
   | `JWT_SECRET`      | Long random string                                                 |
   | `JWT_EXPIRES_IN`  | `1h`                                                               |
   | `CORS_ORIGINS`    | Frontend URL(s)                                                    |
   | `BODY_SIZE_LIMIT` | `100kb`                                                            |
   | `THROTTLE_TTL_MS` | `60000`                                                            |
   | `THROTTLE_LIMIT`  | `100`                                                              |

   Do not override `PORT` unless Render docs require it.

4. Verify:

   ```bash
   curl https://<service>.onrender.com/api/health
   # {"status":"ok"}
   ```

### Local Docker (optional)

```bash
docker build -t dna-music-api .
docker run --rm -p 3000:3000 --env-file .env dna-music-api
```

## Deployment URLs

| Resource         | URL                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| **API base**     | [https://dna-music-lrfa.onrender.com/api](https://dna-music-lrfa.onrender.com/api)               |
| **Swagger**      | [https://dna-music-lrfa.onrender.com/api/docs](https://dna-music-lrfa.onrender.com/api/docs)     |
| **Health check** | [https://dna-music-lrfa.onrender.com/api/health](https://dna-music-lrfa.onrender.com/api/health) |
| **Frontend**     | [https://dna-music-nine.vercel.app](https://dna-music-nine.vercel.app)                           |

Production `CORS_ORIGINS` must include the Vercel frontend URL. The web app sets `VITE_API_URL=https://dna-music-lrfa.onrender.com/api` at build time.
