# EstateFlow

Project-scoped estate inventory: land, units, developments, sales, payments, and audit.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind · Prisma · PostgreSQL · Auth.js credentials

UI follows the **Precision Executive** design system: Plus Jakarta Sans, Precision Blue `#031635`, surface `#f8f9ff`, 4px radius, container-first layout.

## Setup

```bash
copy .env.example .env   # Windows
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Local development uses SQLite (`prisma/dev.db`). `docker-compose.yml` is included if you later switch `DATABASE_URL` to PostgreSQL.

Seed login: `owner@estateflow.dev` / `Password123!`

## Scripts

- `npm run dev` — local app
- `npm test` — domain + permission matrix
- `npm run ci` — lint, typecheck, test, build

See [checklist.md](./checklist.md) for phase status and [docs/BACKUP.md](./docs/BACKUP.md) for restore notes.
