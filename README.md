# Credora — Credit Appraisal Workspace

A web workspace for credit analysts to onboard clients, capture KYC, debt, valuations and CMA financials, and generate appraisal reports.

## Tech stack

- **React 18 + TypeScript** with [Vite](https://vitejs.dev) for fast HMR and builds
- **Tailwind CSS** + **shadcn/ui** (Radix primitives) for the design system
- **React Router v6** for routing
- **TanStack Query** for server state
- **React Hook Form + Zod** for forms and validation
- **Vitest + Testing Library** for unit tests

## Getting started

```bash
# Install dependencies
npm install

# Copy and edit environment
cp .env.example .env

# Start the dev server (http://localhost:5173)
npm run dev
```

## Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start the Vite dev server                |
| `npm run build`   | Production build to `dist/`              |
| `npm run preview` | Preview the production build locally     |
| `npm run lint`    | Run ESLint                               |
| `npm test`        | Run the Vitest suite once                |
| `npm run test:watch` | Run Vitest in watch mode              |

## Environment

| Variable        | Description                          | Example                        |
| --------------- | ------------------------------------ | ------------------------------ |
| `VITE_API_URL`  | Base URL of the backend REST API     | `http://localhost:5000/api`    |

## Project structure

```
src/
  components/    # Reusable UI primitives (shadcn/ui + app components)
    layout/      # AppShell, Sidebar, Topbar
    ui/          # shadcn-generated primitives
  contexts/      # React context providers (auth, etc.)
  hooks/         # Shared hooks
  integrations/  # API client and external integrations
  lib/           # Utilities
  pages/         # Top-level routes
```

## License

Proprietary. All rights reserved.
