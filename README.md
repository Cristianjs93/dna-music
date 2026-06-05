# DNA Music — Branch-scoped student management

Internal ERP mini-app built for the [DNA Music](https://dnamusic.edu.co) technical assessment. It models how the institution manages users, branches (headquarters), and students with role-based access across multiple cities.

The goal is to demonstrate sound backend judgment, security awareness, code organization, and delivery practices — not visual polish or enterprise-scale infrastructure.

## Business domain

DNA Music operates across multiple branches. Two roles drive all behaviour:

| Role         | Scope                                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------------- |
| **ADMIN**    | Full visibility and management: users, branches, students, and dashboard statistics.                              |
| **OPERADOR** | Branch-scoped access only. Can manage students (and update their own profile) within their assigned headquarters. |

### Core entities

- **User** — internal staff account (`ADMIN` or `OPERADOR`). Operators must be linked to exactly one active branch; admins must not have a branch assigned.
- **Headquarter** — a physical branch/campus (name, city, address, active flag). Soft-deleted when removed.
- **Student** — enrolled learner tied to one branch. Statuses: `ACTIVO`, `INACTIVO`, `RETIRADO`. Unique email, phone, and identity card.

### Authentication model

- **Login only** — no public self-registration. New users are provisioned by an ADMIN.
- **JWT** — issued on login; required on all management endpoints.
- **Branch isolation** — enforced in the API for operators; reflected in the UI (hidden routes, disabled branch selectors).

## Monorepo layout

```text
/
├── api/                  # NestJS REST API (see api/README.md)
├── web/                  # React SPA (see web/README.md)
├── .github/workflows/    # GitHub Actions (API CI + remote DB setup)
├── .cursor/              # Cursor rules and commands for AI agents
├── analisis_tecnico.md   # Performance analysis (section 6)
├── git_respuestas.md     # Git workflow answers (section 7)
├── CLAUDE.mdc            # AI agent project hub
└── README.md             # This file — project overview only
```

Each package owns its own **run scripts**, **environment variables**, **architecture**, and **deployment** details. Do not duplicate them here.

| Document                                     | Scope                                                                   |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| [api/README.md](./api/README.md)             | Backend setup, scripts, API surface, Prisma model, tests, Render deploy |
| [web/README.md](./web/README.md)             | Frontend setup, scripts, layered architecture, routes, auth UX          |
| [analisis_tecnico.md](./analisis_tecnico.md) | Performance and scaling notes                                           |
| [git_respuestas.md](./git_respuestas.md)     | Version-control workflow answers                                        |

## Technology overview

| Layer             | Stack                                                               |
| ----------------- | ------------------------------------------------------------------- |
| API               | NestJS, TypeScript, Prisma, PostgreSQL                              |
| Web               | React 19, Vite, TypeScript, Tailwind CSS, PrimeReact, Redux Toolkit |
| Auth              | JWT (Bearer), bcrypt passwords, global guards + RBAC                |
| Docs              | Swagger / OpenAPI at `/api/docs`                                    |
| Database (remote) | Neon PostgreSQL                                                     |
| API hosting       | Render (Docker, free tier)                                          |
| CI                | GitHub Actions (`api-ci.yml`, `db-setup.yml`)                       |
| Runtime           | Node.js **24.16.0** (`.nvmrc`)                                      |

## Deployment URLs

| Service                | URL                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| **API** (Render)       | [https://dna-music-lrfa.onrender.com](https://dna-music-lrfa.onrender.com)                   |
| **API docs** (Swagger) | [https://dna-music-lrfa.onrender.com/api/docs](https://dna-music-lrfa.onrender.com/api/docs) |
| **Web** (Vercel)       | [https://dna-music-nine.vercel.app](https://dna-music-nine.vercel.app)                       |

Setup and environment details: [api/README.md](./api/README.md#deployment) · [web/README.md](./web/README.md#deployment).

## Test credentials

Preloaded by the API seed (`npm run db:seed` in `api/`). Use these on both local and deployed environments:

| Role         | Email                      | Password    | Branch       |
| ------------ | -------------------------- | ----------- | ------------ |
| **ADMIN**    | `admin@dnamusic.co`        | `Admin123!` | All branches |
| **OPERADOR** | `operador.bog@dnamusic.co` | `Oper123!`  | Bogotá       |
| **OPERADOR** | `operador.med@dnamusic.co` | `Oper123!`  | Medellín     |

The seed also creates **3 branches** (Bogotá, Medellín, Cali) and **6 sample students** in mixed statuses (`ACTIVO`, `INACTIVO`, `RETIRADO`).

## Security decisions

Security is a first-class requirement for this assessment. Below is what was **implemented** and what is **consciously accepted** as a trade-off.

### Implemented

| Area                  | Decision                                                                                                                                      |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Authentication**    | Login-only flow. No public self-registration; users are provisioned by ADMIN.                                                                 |
| **Password storage**  | bcrypt hashing (12 salt rounds). Plain-text passwords never stored.                                                                           |
| **Login errors**      | Generic `"Invalid credentials"` only — no email/password distinction (anti-enumeration).                                                      |
| **Timing attacks**    | Dummy bcrypt compare when email is unknown, so failed logins take similar time.                                                               |
| **JWT**               | Signed with `JWT_SECRET` from env; expiry via `JWT_EXPIRES_IN` (default `1h`). Re-validated on every request (user exists, not soft-deleted). |
| **Authorization**     | Global `JwtAuthGuard` + `RolesGuard`. Branch scoping enforced in services for OPERADOR.                                                       |
| **HTTP hardening**    | `helmet` security headers, explicit `CORS_ORIGINS` (no wildcard with credentials), JSON body size limit (`BODY_SIZE_LIMIT`).                  |
| **Rate limiting**     | Global `@nestjs/throttler` + stricter limit on `POST /auth/login`.                                                                            |
| **Input validation**  | Global `ValidationPipe` with `whitelist` and `forbidNonWhitelisted` on all DTOs.                                                              |
| **Soft delete**       | `deletedAt` on users, branches, and students — records are not physically removed.                                                            |
| **Secrets**           | All secrets in `.env` / platform env vars. `DATABASE_URL` as GitHub Actions secret only.                                                      |
| **Frontend token**    | JWT held **in memory only** (`tokenStore`) — not in `localStorage` (reduces XSS token theft).                                                 |
| **UI access control** | Admin routes hidden in sidebar; branch selectors disabled for OPERADOR.                                                                       |

### Known trade-offs

| Area                       | Trade-off                                           | Rationale                                                                               |
| -------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Session persistence**    | Token lost on page reload                           | In-memory storage chosen over `localStorage` XSS risk.                                  |
| **Internal UUIDs exposed** | API returns database UUIDs to the frontend          | Acceptable for an internal admin panel; would use public IDs in production (see below). |
| **No refresh tokens**      | Single access token with fixed expiry               | Simpler model for assessment scope; users re-login after expiry.                        |
| **No web CI**              | Frontend lint/build not automated in GitHub Actions | Manual checks before deploy; API CI covers backend.                                     |
| **Render free tier**       | Cold starts after ~15 min inactivity                | Acceptable for demo; first request may take 30–60s.                                     |

Full security policies for agents: `.cursor/rules/security.mdc`.

## Git commands used

Representative commands from this project's development workflow (atomic commits, feature branches off `main`):

```bash
# Environment
nvm use                                    # Node 24.16.0 from .nvmrc

# Daily workflow
git status
git diff
git add <files>
git commit -m "feat(api): add students module with branch scope"
git log --oneline -10

# Branching
git checkout -b feature/students-crud
git checkout main
git merge feature/students-crud

# History inspection
git log --oneline
git diff main...HEAD                       # changes since diverging from main

# Remote
git push -u origin main
git pull origin main
```

Commit style follows **Conventional Commits** (`feat`, `fix`, `refactor`, `docs`, `chore`, `test`). The history was built incrementally — one logical change per commit (schema → module → tests → frontend layer, etc.).

Extended Git workflow answers: [git_respuestas.md](./git_respuestas.md) (if present in submission).

## Project status

| Area                                     | Status |
| ---------------------------------------- | ------ |
| Users CRUD + RBAC                        | Done   |
| JWT auth + security hardening            | Done   |
| Headquarters CRUD                        | Done   |
| Students CRUD + branch scope             | Done   |
| Dashboard stats (`GET /api/stats`)       | Done   |
| Swagger / OpenAPI                        | Done   |
| Unit tests (auth, RBAC, students, stats) | Done   |
| React frontend (all CRUD modules)        | Done   |
| Remote database (Neon)                   | Done   |
| GitHub Actions CI + DB workflow          | Done   |
| API deploy (Render)                      | Done   |
| Web deploy (Vercel)                      | Done   |

## CI/CD (summary)

Workflows run on **push** and **pull requests** to `main` with path filters. Node **24.16.0** matches `.nvmrc`.

| Workflow                            | Trigger                                    | Purpose                         |
| ----------------------------------- | ------------------------------------------ | ------------------------------- |
| **API CI** (`api-ci.yml`)           | Changes under `api/**`                     | Lint, build, unit tests         |
| **Database setup** (`db-setup.yml`) | Prisma schema, migrations, or API lockfile | `migrate deploy` + seed on Neon |

Both support manual **Run workflow**. Full details, secrets, and local equivalents: [api/README.md — CI/CD](./api/README.md#cicd).

## Deployment (summary)

| Service  | Provider        | URL                                                                |
| -------- | --------------- | ------------------------------------------------------------------ |
| Database | Neon PostgreSQL | — (connection via env vars)                                        |
| API      | Render (Docker) | [dna-music-lrfa.onrender.com](https://dna-music-lrfa.onrender.com) |
| Web      | Vercel (static) | [dna-music-nine.vercel.app](https://dna-music-nine.vercel.app)     |

Step-by-step setup: [api/README.md — Deployment](./api/README.md#deployment) · [web/README.md — Deployment](./web/README.md#deployment).

## What I would do differently with more time

1. **Public IDs instead of internal UUIDs** — expose opaque, non-sequential identifiers (e.g. `usr_abc123`, `std_xyz789`) to the frontend and public API responses, keeping database UUIDs internal. This reduces information leakage, simplifies log correlation, and is safer if endpoints are ever exposed beyond the internal panel.

2. **Complete unit test coverage** — extend Jest suites to all services (users, headquarters, edge cases), add frontend tests (hook behaviour, form validation, route guards), and wire E2E tests into CI with a disposable test database.

3. **Refresh tokens + httpOnly cookies** — if persistent sessions are required, move to a short-lived access token + refresh flow with secure cookie storage instead of in-memory-only JWT.

4. **Web CI workflow** — add `web-ci.yml` (lint + build on `web/**` changes) to match API CI parity.

5. **API versioning and audit log** — `/api/v1` prefix and a dedicated `audit_events` table for sensitive mutations.

## AI-assisted development

Built with Cursor and Claude. Agent configuration lives in `CLAUDE.mdc` and `.cursor/`. All generated code is reviewed before delivery.

## Author

Technical assessment — DNA Inversiones SAS. Confidential use, hiring process.
