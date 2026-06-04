# CLAUDE.md - Core Project Hub

Welcome to the DNA Music ERP Mini-App repository. This project is a monorepo split into a NestJS backend and a React frontend.

## 📁 Repository Structure & Context Maps
- `api/` -> Backend service (NestJS + TypeScript + Prisma + PostgreSQL)
- `web/` -> Frontend application (React + TypeScript)
- `.cursor/rules/` -> Granular AI prompt instructions and constraints

## 🛠️ Global Orchestration Scripts
To manage development execution blocks, you can read commands directly via the execution guidelines under `.cursor/commands/`:
- **Run Backend**: Reference `.cursor/commands/dev-api`
- **Run Frontend**: Reference `.cursor/commands/dev-web`
- **Run Tests**: Reference `.cursor/commands/test` 
- **Run Documentation Suite**: Reference `.cursor/commands/swagger` 

## 🤖 AI Alignment & Modular Rules
Please read and closely adhere to our distinct rule manuals situated under `.cursor/rules/` before writing code modifications:
- **Git & Conventional Commits**: `.cursor/rules/commit.md`
- **Absolute Core Security**: `.cursor/rules/security.md` [cite: 29]
- **Backend Architecture & Database**: `.cursor/rules/api.md`
- **Frontend State & Roles Logic**: `.cursor/rules/web.md`
- **Unit Testing Guidelines**: `.cursor/rules/testing.md` 
- **Static Analysis & Formatting (Linter)**: `.cursor/rules/linter.md`