# DNA Music — Frontend

React single-page application for the DNA Music internal panel. Connects to the NestJS API for login, dashboard statistics, and CRUD on users, branches, and students.

For project context and business domain, see the [root README](../README.md). For API contracts and RBAC rules, see [api/README.md](../api/README.md).

## Requirements

- Node.js **24.16.0** (`nvm use` at repo root)
- API backend running (default `http://localhost:3000/api`)

## Quick start

```bash
cd web
npm install
cp .env.example .env
npm run dev
```

App: `http://localhost:5173`

Ensure `CORS_ORIGINS` in `api/.env` includes `http://localhost:5173`.

## Environment variables

| Variable       | Description                           | Default                     |
| -------------- | ------------------------------------- | --------------------------- |
| `VITE_API_URL` | API base URL (includes `/api` prefix) | `http://localhost:3000/api` |

## Scripts

| Command           | Description                         |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Vite dev server with HMR            |
| `npm run build`   | TypeScript check + production build |
| `npm run lint`    | ESLint                              |
| `npm run preview` | Serve production build locally      |

## Technology stack

| Layer      | Choice                                       |
| ---------- | -------------------------------------------- |
| Framework  | React 19 + TypeScript                        |
| Build      | Vite 6                                       |
| Styling    | Tailwind CSS 4                               |
| UI kit     | PrimeReact + PrimeIcons                      |
| Routing    | React Router 7                               |
| Forms      | React Hook Form                              |
| HTTP       | Axios                                        |
| Auth state | Redux Toolkit (`authSlice` only)             |
| Toasts     | PrimeReact Toast via `ToastProvider` context |

## Architecture

Layered design separating UI, state orchestration, data access, and API transport.

```text
src/
├── pages/              # Route-level composition (thin)
├── components/
│   ├── auth/           # ProtectedRoute
│   ├── layout/         # AppLayout, Sidebar
│   ├── common/         # FormField, PageHeader, TableSearchInput
│   ├── crud/           # CrudDataTable, TableActionsColumn, tableFilters
│   ├── providers/      # ToastProvider
│   ├── ui/             # DnaButton, DnaInputText, DnaDropdown, etc.
│   ├── users/          # UserFormDialog
│   ├── headquarters/   # HeadquarterFormDialog
│   └── students/       # StudentFormDialog
├── hooks/
│   ├── common/         # useResourceList, useMutationAction
│   ├── users/          # useUserQueries, useUserMutations
│   ├── headquarters/   # useHeadquarterQueries, useHeadquarterMutations
│   ├── students/       # useStudentQueries, useStudentMutations
│   └── (root)          # useAuthContext, useActiveHeadquarters, useLogin, useStats
├── repositories/       # IUserRepository interfaces + service adapters
├── services/           # Axios HTTP calls (api.ts, *.service.ts)
├── mappers/            # Form values → API payloads
├── types/              # Domain types split by entity (user, student, etc.)
├── context/            # toast.context.ts
├── store/              # Redux auth slice + tokenStore
└── utils/              # validationRules, errorMessages, format, confirmDelete
```

### Data flow

```text
Page → Hook (queries/mutations) → Repository → Service → Axios → API
                ↓
         ToastProvider (global feedback)
                ↓
         Redux (auth session only)
```

1. **Pages** compose layout, table, and form dialog. No direct API calls.
2. **Hooks** own loading/saving state, fetch on mount, and mutation feedback.
3. **Repositories** wrap services behind interfaces (`IUserRepository`, etc.).
4. **Services** perform HTTP with the shared Axios instance and JWT interceptor.
5. **Mappers** translate form state to `Create*Payload` / `Update*Payload` types.
6. **Types** are split per domain (`types/user.types.ts`, etc.) with a barrel `types/index.ts`.

### Hook conventions

- `useResourceList` — generic list fetch with stable fetcher refs.
- `useMutationAction` — wraps create/update/delete with toast feedback and `saving` state.
- `useAuthContext` — exposes `currentUser`, `isAdmin`, `headquarterId`.
- `useActiveHeadquarters` — shared branch list for dropdowns (skips fetch when `enabled=false`).

## Routes and access

| Path            | Page             | Access                                                       |
| --------------- | ---------------- | ------------------------------------------------------------ |
| `/login`        | LoginPage        | Public (redirects if authenticated)                          |
| `/`             | DashboardPage    | Authenticated; stats for ADMIN only                          |
| `/students`     | StudentsPage     | Authenticated; ADMIN (all branches) or OPERADOR (own branch) |
| `/users`        | UsersPage        | ADMIN only                                                   |
| `/headquarters` | HeadquartersPage | ADMIN only                                                   |

Route guards: `ProtectedRoute` (auth) and `ProtectedRoute adminOnly` (ADMIN routes). Sidebar hides admin-only links for operators.

## Feature modules

### Login

- `POST /api/auth/login` via `useLogin` → Redux `setCredentials` + in-memory token.
- Inline error display (no toast on login failure).

### Dashboard

- `GET /api/stats` via `useStats(enabled)` where `enabled = isAdmin`.
- Cards: students per branch, per status, top active branch.

### Users (ADMIN)

- List with search, pagination, edit/delete actions.
- Create/edit dialog: name, email, password (create only), role, branch (operators only).
- Validation: shared `requiredRule`, `emailRule`, `passwordRule`.

### Headquarters (ADMIN)

- CRUD table with active/inactive status toggle in the form.
- Soft-delete with confirmation dialog.

### Students

- **ADMIN**: all branches; branch selector enabled.
- **OPERADOR**: own branch only; selector disabled, list pre-filtered by API.
- Status changes on edit may trigger a separate `PATCH /students/:id/status` call.

## Authentication and token storage

| Concern      | Approach                                                           |
| ------------ | ------------------------------------------------------------------ |
| JWT storage  | In-memory only (`utils/tokenStore.ts`) — **not** `localStorage`    |
| User profile | Redux `authSlice` (name, email, role, branch)                      |
| HTTP auth    | Axios request interceptor attaches `Authorization: Bearer <token>` |
| Session loss | Full page reload clears the token (user must log in again)         |

Trade-off: reduced XSS exfiltration risk vs. no persistent sessions across reloads.

## Technical decisions

### Why React + Vite?

React is the most common choice for internal admin panels with complex forms and tables. **Vite** provides fast HMR and a lean production build — important when iterating quickly on CRUD screens during the assessment.

### Why PrimeReact + Tailwind?

- **PrimeReact** — production-ready DataTable (pagination, filters, sorting), Dialog, Toast, and form controls out of the box. Avoids building table infrastructure from scratch.
- **Tailwind CSS** — utility-first styling for layout, spacing, and custom `Dna*` component wrappers without a heavy design system.

### Why Redux only for auth?

Server state (lists, mutations) lives in custom hooks — not Redux. Redux Toolkit is used **only** for `authSlice` (user profile + `isAuthenticated`) because it is read across routes and layout. This avoids Redux boilerplate for CRUD data that is already managed per-module in hooks.

### Architecture and patterns

| Pattern                             | Application                                                                                     |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Layered data flow**               | Page → Hook → Repository → Service → Axios. Pages never call the API directly.                  |
| **Repository interfaces**           | `IUserRepository`, etc. decouple hooks from HTTP transport — easier to mock and swap.           |
| **Query / mutation split**          | `useUserQueries` + `useUserMutations` per domain — single responsibility per hook file.         |
| **Shared primitives**               | `useResourceList`, `useMutationAction` — DRY fetch and mutation feedback logic.                 |
| **Mappers**                         | Form values → API payloads (`user.mapper.ts`, etc.) — keeps hooks free of DTO shaping.          |
| **Domain types**                    | Split `types/` by entity (`user.types.ts`, `student.types.ts`) with barrel export.              |
| **Composition over monolith pages** | `CrudDataTable`, `*FormDialog`, `TableActionsColumn` — pages stay ~120 lines.                   |
| **Global toast context**            | `ToastProvider` + `useToastContext()` — no per-page `<Toast />` refs.                           |
| **Stable fetcher refs**             | `useResourceList` uses repository method references + `ref` to prevent infinite re-fetch loops. |
| **Route guards**                    | `ProtectedRoute` + `adminOnly` mirror API RBAC in the router and sidebar.                       |

### Why in-memory JWT (not localStorage)?

For an internal panel handling student PII, reducing XSS token exfiltration surface was prioritised over session persistence across reloads. See root [Security decisions](../README.md#security-decisions).

### Why Vercel for hosting?

Static SPA output (`npm run build` → `dist/`) deploys cleanly to Vercel with automatic HTTPS, preview deployments, and env-var injection for `VITE_API_URL` at build time.

## UI conventions

- **Dna\*** components wrap PrimeReact with consistent height, borders, and variants.
- **FormField** renders label + control + validation error below the input.
- **CrudDataTable** provides paginator, global search, and row filters.
- **ToastProvider** at app root; hooks use `useToastContext()` — pages do not mount `<Toast />`.
- API errors translated to Spanish in `utils/errorMessages.ts`.

## Local quality checks

```bash
npm run lint
npm run build
```

Run both before pushing frontend changes. There is no dedicated `web` CI workflow yet — parity is manual.

## Deployment

Production build:

```bash
npm run build   # output in dist/
```

### Deployment URLs

| Resource                         | URL                                                                                |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| **Web app**                      | [https://dna-music-nine.vercel.app](https://dna-music-nine.vercel.app)             |
| **API** (consumed at build time) | [https://dna-music-lrfa.onrender.com/api](https://dna-music-lrfa.onrender.com/api) |

### Vercel configuration

| Setting          | Value                                                  |
| ---------------- | ------------------------------------------------------ |
| Root directory   | `web`                                                  |
| Build command    | `npm run build`                                        |
| Output directory | `dist`                                                 |
| Env var          | `VITE_API_URL=https://dna-music-lrfa.onrender.com/api` |

Ensure the API's `CORS_ORIGINS` includes `https://dna-music-nine.vercel.app`.
