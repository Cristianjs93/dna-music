# DNA Music — Student management by branch

A small application built as part of the [DNA Music](https://dnamusic.edu.co) technical assessment. It simulates a slice of the institution's internal ERP: managing users, branches, and students based on each person's role.

The goal is to demonstrate sound backend judgment, security awareness, code organization, and delivery practices — not visual polish or a full enterprise architecture.

## What does this project do?

DNA Music operates across multiple cities with different user profiles:

- An **administrator** can view and manage everything, including creating new users.
- An **operator** only works with data from their assigned branch.

This repository implements that logic step by step: a REST API, a PostgreSQL database, and (coming soon) a frontend to tie both layers together.

## Repository structure

```text
/
├── .github/workflows/    # GitHub Actions (CI + remote DB setup)
├── api/                  # Backend (NestJS + Prisma + PostgreSQL)
├── web/                  # Frontend (React — work in progress)
├── analisis_tecnico.md   # Performance analysis (section 6)
├── git_respuestas.md     # Git workflow answers (section 7)
└── README.md
```

## Stack

| Layer    | Technology         |
| -------- | ------------------ |
| Backend  | NestJS, TypeScript |
| Database | PostgreSQL, Prisma |
| API docs | Swagger (OpenAPI)  |
| Frontend | React (pending)    |
| CI/CD    | GitHub Actions     |

## Running the project locally

### Requirements

- Node.js 24.16 (`nvm use` reads `.nvmrc`)
- PostgreSQL running locally
- npm

### 1. Backend (`api/`)

```bash
cd api
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL if needed

npm run db:generate
npm run db:migrate
npm run db:seed
npm run start:dev
```

The API is available at `http://localhost:3000/api`.

**Interactive API docs (Swagger):** `http://localhost:3000/api/docs`

### 2. Frontend (`web/`)

_Pending — instructions will be added once the web module is ready._

## Test credentials

Loaded automatically by the seed script (`npm run db:seed`):

| Role     | Email                    | Password  | Branch   |
| -------- | ------------------------ | --------- | -------- |
| ADMIN    | admin@dnamusic.co        | Admin123! | All      |
| OPERATOR | operador.bog@dnamusic.co | Oper123!  | Bogotá   |
| OPERATOR | operador.med@dnamusic.co | Oper123!  | Medellín |

The seed also creates **3 branches** (Bogotá, Medellín, Cali) and **6 sample students** in different statuses.

## Authentication flow

1. **Login** — `POST /api/auth/login` with email and password. Returns a JWT and the authenticated user profile. This is the only public auth endpoint.
2. **Protected routes** — Send `Authorization: Bearer <token>` on all management endpoints.
3. **User creation** — There is no public registration. New users are created by an **ADMIN** via `POST /api/users` (role-based guard planned).

## Current development status

| Module              | Status            |
| ------------------- | ----------------- |
| Users (CRUD API)    | Implemented       |
| JWT authentication  | Implemented       |
| Swagger / OpenAPI   | Implemented       |
| Role-based guards   | Implemented       |
| Branches (CRUD API) | Implemented       |
| Students (API)      | Implemented       |
| Statistics          | Implemented       |
| React frontend      | Pending           |
| Remote database     | Neon (PostgreSQL) |
| GitHub Actions CI   | Implemented       |
| API / Web deploy    | Pending           |

## CI/CD (GitHub Actions)

Workflows run on **push** and **pull requests** to `main` (path filters avoid unrelated runs). Node **24.16.0** matches `.nvmrc`.

| Workflow           | File                             | Trigger                                                       | What it does                                                                                               |
| ------------------ | -------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **API CI**         | `.github/workflows/api-ci.yml`   | Changes under `api/**`                                        | `npm ci` → Prisma generate → **lint** → **build** → **unit tests** (`--passWithNoTests` until specs exist) |
| **Database setup** | `.github/workflows/db-setup.yml` | Changes under `api/prisma/**`, Prisma config, or API lockfile | Applies **`db:migrate:deploy`** and **`db:seed`** against the remote database                              |

Both workflows support **Run workflow** manually (`workflow_dispatch`).

### GitHub secret (database workflow)

Add in the repository: **Settings → Secrets and variables → Actions → New repository secret**

| Secret         | Value                                                                     |
| -------------- | ------------------------------------------------------------------------- |
| `DATABASE_URL` | Direct Neon PostgreSQL URL (not the pooler), including `?sslmode=require` |

The database workflow does **not** run on every API code change — only when schema, migrations, or related dependencies change. After editing Prisma, push to `main` or trigger the workflow manually.

Check run status under the repository **Actions** tab.

## Deployment URLs

| Service | URL       |
| ------- | --------- |
| API     | _Pending_ |
| Web     | _Pending_ |

## Environment variables

Copy `api/.env.example` to `api/.env`. Main variables:

- `PORT` — server port (default `3000`)
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — secret for signing tokens
- `JWT_EXPIRES_IN` — token lifetime (default `1h`)
- `CORS_ORIGINS` — allowed frontend origins (comma-separated)

Do not commit `.env` files to the repository. For CI, only `DATABASE_URL` is required as a GitHub Actions secret (see [CI/CD](#cicd-github-actions)).

## AI-assisted development

This project is built with AI tooling (Cursor, Claude). Agent configuration lives in `CLAUDE.mdc` and `.cursor/`. All code is reviewed and understood before delivery.

## Additional documentation

- **Technical analysis** → `analisis_tecnico.md`
- **Git and version control** → `git_respuestas.md`
- **API details, DB scripts & workflows** → `api/README.md`

## Author

Technical assessment — DNA Inversiones SAS. Confidential use, hiring process.
