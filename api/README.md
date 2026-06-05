# DNA Music API

NestJS backend for the DNA Music technical assessment. It exposes a REST API to manage users, branches, and students with role-based access (ADMIN / OPERATOR).

All routes are prefixed with `/api`. Interactive documentation is available at `/api/docs` when the server is running.

## Requirements

- Node.js 20+
- PostgreSQL
- npm

## Quick start

```bash
npm install
cp .env.example .env
# Set DATABASE_URL in .env

npm run db:setup    # generate client + migrate + seed
npm run start:dev   # http://localhost:3000
```

Swagger UI: `http://localhost:3000/api/docs`

## Environment variables

| Variable         | Description                          | Example                                              |
| ---------------- | ------------------------------------ | ---------------------------------------------------- |
| `PORT`           | HTTP port                            | `3000`                                               |
| `DATABASE_URL`   | PostgreSQL connection string         | `postgresql://postgres:postgres@localhost:5432/dna_music?schema=public` |
| `JWT_SECRET`     | Secret for JWT signing               | `change-me-in-production-use-long-random-string`     |
| `JWT_EXPIRES_IN` | Token lifetime                       | `1h`                                                 |

## Database scripts

| Command                     | Description                              |
| --------------------------- | ---------------------------------------- |
| `npm run db:generate`       | Generate Prisma client                   |
| `npm run db:migrate`        | Run migrations (dev)                     |
| `npm run db:migrate:deploy` | Apply migrations (production)            |
| `npm run db:seed`           | Load sample data                         |
| `npm run db:setup`          | Generate + migrate + seed in one step    |
| `npm run db:reset`          | Reset database and re-run migrations     |
| `npm run db:studio`         | Open Prisma Studio                       |

## Seed data

Running `npm run db:seed` creates:

- 3 branches: Bogotá, Medellín, Cali
- 1 admin user and 2 operator users
- 6 sample students

| Role     | Email                    | Password  |
| -------- | ------------------------ | --------- |
| ADMIN    | admin@dnamusic.co        | Admin123! |
| OPERATOR | operador.bog@dnamusic.co | Oper123!  |
| OPERATOR | operador.med@dnamusic.co | Oper123!  |

## Available endpoints

### Auth (`/api/auth`)

| Method | Path             | Auth required | Description                         |
| ------ | ---------------- | ------------- | ----------------------------------- |
| `POST` | `/api/auth/login`  | No          | Login with email + password → JWT   |
| `GET`  | `/api/auth/me`     | Yes         | Current authenticated user profile |

There is **no public registration endpoint**. User accounts are provisioned by an ADMIN.

All other routes require a valid `Authorization: Bearer <token>` header.

### Users (`/api/users`)

| Method   | Path             | Auth required | Description                              |
| -------- | ---------------- | ------------- | ---------------------------------------- |
| `POST`   | `/api/users`     | Yes (ADMIN*)  | Create a user (admin-only — guard planned) |
| `GET`    | `/api/users`     | Yes           | List active users                        |
| `GET`    | `/api/users/:id` | Yes           | Get user by ID                           |
| `PATCH`  | `/api/users/:id` | Yes           | Update a user                            |
| `DELETE` | `/api/users/:id` | Yes           | Soft-delete a user                       |

\*Role guard not yet enforced; any authenticated user can hit these routes until `RolesGuard` is added.

More modules (branches, students, stats) will be added as development continues. Check Swagger for the latest contract.

## Development commands

```bash
npm run start:dev    # watch mode
npm run build        # compile to dist/
npm run start:prod   # run compiled app
npm run lint         # ESLint
npm run test         # unit tests
npm run test:e2e     # end-to-end tests
```

## Project layout

```text
src/
├── auth/             # Login, JWT strategy, guards, decorators
├── prisma/           # Prisma module (global DB access)
├── users/            # Users CRUD module
├── util/             # Shared helpers (errors, swagger, parsing)
├── app.module.ts
└── main.ts
prisma/
├── schema.prisma     # Data model
├── migrations/       # SQL migrations
└── seed.ts           # Sample data
```

## Data model (overview)

- **User** — ADMIN or OPERATOR; operators are linked to one branch
- **Headquarter** — branch / campus (Bogotá, Medellín, Cali)
- **Student** — belongs to a branch; statuses include ACTIVO, INACTIVO, RETIRADO

Users, branches, and students support soft delete via `deletedAt`.

## Implementation status

| Feature            | Status      |
| ------------------ | ----------- |
| Users CRUD         | Done        |
| JWT auth + guard   | Done        |
| Role-based guards  | Planned     |
| Branches CRUD      | Planned     |
| Students CRUD      | Planned     |
| `GET /api/stats`   | Planned     |
| Swagger            | Done        |

See the root [README](../README.md) for the full monorepo overview and deployment notes.
