# DNA Music — Frontend

React + TypeScript + Vite + Tailwind CSS + PrimeReact.

## Requisitos

- Node.js 24.16+
- API backend corriendo en `http://localhost:3000`

## Configuración

```bash
cd web
npm install
cp .env.example .env
npm run dev
```

La app queda en `http://localhost:5173`.

## Variables de entorno

| Variable        | Descripción              | Default                      |
| --------------- | ------------------------ | ---------------------------- |
| `VITE_API_URL`  | Base URL de la API       | `http://localhost:3000/api`    |

## Seguridad del token

El JWT **no se guarda en `localStorage`**. Se mantiene en memoria (`tokenStore`) y Redux solo persiste el perfil del usuario autenticado. Esto reduce el riesgo de exfiltración por XSS, con el trade-off de que la sesión se pierde al recargar la página.

## Scripts

| Comando        | Descripción        |
| -------------- | ------------------ |
| `npm run dev`  | Servidor de desarrollo |
| `npm run build`| Build de producción |
| `npm run lint` | ESLint             |

## Módulos

- **Login** — `POST /api/auth/login`
- **Dashboard** — stats (solo ADMIN)
- **Usuarios** — CRUD (solo ADMIN)
- **Sedes** — CRUD (solo ADMIN)
- **Estudiantes** — CRUD (ADMIN todas las sedes, OPERADOR solo su sede)
