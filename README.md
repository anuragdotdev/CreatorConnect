# CreatorConnect

A professional networking and collaboration marketplace for creators, brands and
businesses. CreatorConnect lets people publish a profile and lets others find
them through search and filters.

This repository is an individual Software Engineering **Project-Based Learning
(PBL)** submission. It implements exactly two core functional modules:

1. **Profile Management** — create, view, edit, delete and list profiles.
2. **Creator/Brand Discovery and Search** — search profiles and filter them by
   account type and industry.

Everything runs locally: a Next.js frontend, an Express REST API, and a SQLite
database accessed through Prisma. No Docker, no external services, no accounts.

---

## 1. Problem statement

Creators, brands and small businesses need a lightweight way to publish who
they are and what they do, and a way for potential collaborators to find them.
Existing professional networks are heavyweight, require an account, and are
poorly suited to quick "who does this kind of work?" questions.

CreatorConnect addresses the narrow problem of **profile publishing and
discovery**: a directory where a profile can be created and maintained, and
where the directory can be searched and filtered to find a relevant
counterpart.

## 2. Objectives

- Deliver a working, locally runnable application with the two modules above.
- Validate input on both the server and the client, with clear field-level
  messages.
- Store all data in SQLite so the application is reproducible from scratch.
- Cover the behaviour with automated tests that assert the *correct* behaviour.
- Provide controlled, reproducible defects on a dedicated branch so that a
  defect-tracking workflow can be demonstrated in JIRA.
- Document the requirements, test cases, defects and a suggested JIRA plan.

## 3. Scope

### In scope

| Area | Detail |
| --- | --- |
| Module A — Profile Management | Create, view, list, edit and delete profiles with full field validation. |
| Module B — Discovery and Search | Database-backed keyword search, account-type filter, industry filter, combined filters, reset, empty/loading/error states. |
| API | REST endpoints for both modules, Zod validation, centralised error handling, CORS. |
| Persistence | SQLite via Prisma, with migrations and demo seed data. |
| Tests | Vitest + Supertest (API) and Vitest + React Testing Library (UI). |
| Documentation | README, requirements, test cases, demo bugs, JIRA plan. |

### Out of scope

- Authentication, authorisation and password handling (explicitly excluded).
- Messaging, reviews, ratings, payments, file uploads and notifications.
- Deployment, containers and CI/CD.
- Any third-party or paid service.

## 4. Architecture

```
CreatorConnect/
├── backend/          Express REST API (TypeScript) + Prisma + SQLite
│   ├── prisma/       schema, migrations and demo seed script
│   ├── src/          app factory, routes, controllers, services, middleware
│   └── tests/        Vitest + Supertest API tests (isolated test database)
├── frontend/         Next.js App Router UI (TypeScript + Tailwind CSS)
│   ├── app/          routes: discovery, profile detail, create, edit
│   ├── components/   reusable UI (cards, form, filters, dialog, states)
│   ├── lib/          API client, types, validation, formatting, cache
│   └── tests/        Vitest + React Testing Library component tests
├── docs/             requirements, test cases, demo bugs, JIRA plan
└── scripts/dev.mjs   starts the backend and frontend together
```

The frontend and backend are **separate applications** in one repository. The
frontend talks to the backend over HTTP using `NEXT_PUBLIC_API_URL`
(default `http://localhost:4000`); the backend allows the frontend origin
through CORS.

### Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Backend | Node.js, Express 4, TypeScript (run with `tsx`) |
| Database | SQLite with Prisma 6 |
| Validation | Zod 3 (server) and Zod 3 (client mirror) |
| Testing | Vitest, Supertest, React Testing Library, jsdom |
| Tooling | ESLint, TypeScript strict mode, Git |

### Request flow

```
Browser ──HTTP──▶ Next.js UI (Client Component)
                        │  fetch /api/profiles?q=&accountType=&industry=
                        ▼
                  Express API ──Prisma──▶ SQLite (dev.db)
                        ▲
                        │  { success, data } | { success:false, error:{code,message,details} }
                        └────────────────────
```

Every endpoint answers with a consistent envelope:

```jsonc
// success
{ "success": true, "data": { /* ... */ } }

// failure
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": { "fields": [ { "field": "email", "message": "..." } ] } } }
```

## 5. Prerequisites

- **Node.js 20 or newer** (developed and verified on Node 24.20.0)
- **npm 10 or newer** (developed and verified on npm 12.2.0)
- Git (only needed for the `demo-bugs` branch)

Check your versions:

```bash
node --version
npm --version
```

> **Note on npm 12+**: npm 12 blocks dependency install scripts by default.
> Prisma and esbuild need theirs to download their binaries. If `prisma` or
> `vitest` fails to start, approve the scripts once:
>
> ```bash
> npm --prefix backend install-scripts approve @prisma/client prisma @prisma/engines esbuild
> npm --prefix frontend install-scripts approve esbuild unrs-resolver
> npm --prefix backend install && npm --prefix frontend install
> ```

## 6. Installation and setup

From the repository root:

```bash
npm run setup
```

This installs the backend and frontend dependencies, creates the SQLite
database, applies the Prisma migration and seeds the demo profiles.

If you prefer to run the steps yourself:

```bash
npm run install:all      # installs backend/ and frontend/ dependencies
npm run db:migrate       # creates backend/prisma/dev.db and applies migrations
npm run db:seed          # inserts 10 realistic demo profiles
```

## 7. Environment variables

### Backend — `backend/.env` (copy from `backend/.env.example`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `4000` | Port the Express API listens on. |
| `NODE_ENV` | `development` | Runtime mode. |
| `DATABASE_URL` | `file:./dev.db` | SQLite file, relative to `backend/prisma/`. |
| `CORS_ORIGIN` | `http://localhost:3000` | Comma-separated list of allowed browser origins. |

### Frontend — `frontend/.env.local` (optional)

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Base URL of the CreatorConnect API. |

## 8. Database migration and seeding

```bash
npm run db:migrate     # prisma migrate dev — creates/updates dev.db
npm run db:seed        # prisma db seed  — inserts the demo profiles
npm run db:reset       # prisma migrate reset --force — drops and recreates
```

The seed script is idempotent: it upserts on the email address, so running it
twice does not create duplicates.

The seed data includes a profile named **"Creator Studio"**, which is the
profile used by the BUG-1 reproduction steps in `docs/demo-bugs.md`.

## 9. Running the application

Start both applications together:

```bash
npm run dev
```

Or run them separately in two terminals:

```bash
npm run dev:backend     # http://localhost:4000
npm run dev:frontend    # http://localhost:3000
```

Then open <http://localhost:3000>.

Production build of the frontend:

```bash
npm run build
npm --prefix frontend run start
```

## 10. Commands

| Command | Description |
| --- | --- |
| `npm run setup` | Install everything, migrate and seed. |
| `npm run dev` | Start the backend and frontend together. |
| `npm run dev:backend` / `npm run dev:frontend` | Start one application. |
| `npm run build` | Production build of the frontend. |
| `npm run typecheck` | Type-check both applications. |
| `npm run lint` | Lint both applications. |
| `npm test` | Run all backend and frontend tests. |
| `npm run test:backend` / `npm run test:frontend` | Run one test suite. |
| `npm run test:e2e` | Browser walkthrough of the running application (see below). |
| `npm run db:migrate` / `npm run db:seed` / `npm run db:reset` | Database commands. |

### Browser walkthrough

`scripts/e2e-check.mjs` drives the running application with a real browser and
checks the behaviour that the unit tests cannot cover: the discovery page, the
keyword search, both filters, the reset button, the empty state, the profile
detail view, the edit flow, the delete confirmation dialog, the create form,
the field-level validation messages and the mobile card layout.

```bash
# with the application running in another terminal
npm install --no-save playwright
npx playwright install chromium
npm run test:e2e
```

The script creates and then deletes its own test profile, so the demo data is
left unchanged. It exits with a non-zero status if any check fails.

## 11. API endpoint reference

Base URL: `http://localhost:4000/api`

| Method | Endpoint | Description | Success | Errors |
| --- | --- | --- | --- | --- |
| `GET` | `/health` | Service health check. | `200` | — |
| `POST` | `/profiles` | Create a profile. | `201` | `422` validation, `409` duplicate email |
| `GET` | `/profiles` | List profiles with optional filters. | `200` | `422` invalid query |
| `GET` | `/profiles/industries` | Distinct industries, alphabetically. | `200` | — |
| `GET` | `/profiles/:id` | Full details of one profile. | `200` | `404` not found |
| `PUT` | `/profiles/:id` | Update a profile. | `200` | `422` validation, `404` not found, `409` duplicate email |
| `DELETE` | `/profiles/:id` | Delete a profile. | `200` | `404` not found |

### Query parameters for `GET /api/profiles`

| Parameter | Type | Description |
| --- | --- | --- |
| `q` | string | Keyword matched against display name, bio and skills. Case-insensitive. |
| `accountType` | `CREATOR` \| `BRAND` \| `BUSINESS` | Filters by account type. |
| `industry` | string | Filters by industry. Case-insensitive. |

All three can be combined. An unmatched combination returns `200` with an empty
array.

### Profile fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | auto | Unique identifier. |
| `displayName` | string | yes | Max 120 characters, cannot be whitespace only. |
| `email` | string | yes | Valid email format, unique across profiles. |
| `accountType` | enum | yes | `CREATOR`, `BRAND` or `BUSINESS`. |
| `industry` | string | yes | Max 120 characters. |
| `bio` | string | yes | Max 2000 characters. |
| `skills` | string | yes | Comma-separated list, max 500 characters. |
| `portfolioUrl` | string | no | Must be a valid `http`/`https` URL. |
| `twitterUrl` | string | no | Must be a valid `http`/`https` URL. |
| `instagramUrl` | string | no | Must be a valid `http`/`https` URL. |
| `linkedinUrl` | string | no | Must be a valid `http`/`https` URL. |
| `createdAt` | ISO date | auto | Set on creation. |
| `updatedAt` | ISO date | auto | Updated on every write. |

### Example requests

```bash
# Create
curl -X POST http://localhost:4000/api/profiles \
  -H "Content-Type: application/json" \
  -d '{"displayName":"Creator Studio","email":"studio@example.com","accountType":"CREATOR","industry":"Digital Media","bio":"A production studio.","skills":"Video, Photography"}'

# Search and filter
curl "http://localhost:4000/api/profiles?q=creator&accountType=CREATOR&industry=Digital%20Media"
```

## 12. Tests

```bash
npm test
```

**Backend** — `backend/tests/`, Vitest + Supertest against an isolated
`backend/prisma/test.db`. The test database is created and reset by
`backend/tests/setup.ts`, so the demo data in `dev.db` is never touched.

**Frontend** — `frontend/tests/`, Vitest + React Testing Library + jsdom.
Covers form validation messages, the search/filter reset behaviour, the
discovery states and the delete confirmation dialog.

Both suites assert the *correct* behaviour, which is what makes them useful as
regression tests against the defects on the `demo-bugs` branch.

**Browser walkthrough** — `scripts/e2e-check.mjs`, driven by Playwright against
the running application. See the section above for how to run it.

## 13. Branches

| Branch | Contents |
| --- | --- |
| `main` | The stable, correct implementation. |
| `demo-bugs` | The same application with three controlled, reproducible defects. |

```bash
git branch -a                # list the branches
git checkout main            # the stable version
git checkout demo-bugs       # the version with the defects
```

See `docs/demo-bugs.md` for the reproduction steps, expected and actual
behaviour, severity and suggested fix of each defect.

## 14. Known limitations

- **No authentication.** Every profile is publicly readable and writable. This
  is deliberate: authentication is out of scope for the two modules.
- **Search is a simple substring match.** It uses `instr` over SQLite rather
  than a full-text index, so it suits a demo dataset rather than millions of
  rows.
- **The in-memory profile cache lives for one browser session.** A profile
  changed in another tab is picked up when the detail view is refreshed or the
  page is reloaded.
- **The frontend requires the backend to be running.** There is no offline or
  mock mode.
- **No pagination.** `GET /api/profiles` returns every matching profile.
- **SQLite is single-writer.** It is the right choice for a local demo, not for
  a deployed multi-user service.

## 15. Screenshots

| Screen | Image |
| --- | --- |
| Discovery page with search, filters and the card grid | [`docs/screenshots/discovery.png`](docs/screenshots/discovery.png) |
| Profile detail view | [`docs/screenshots/profile-detail.png`](docs/screenshots/profile-detail.png) |
| Profile form with field-level validation messages | [`docs/screenshots/validation.png`](docs/screenshots/validation.png) |

## 16. Documentation

| Document | Contents |
| --- | --- |
| [`docs/requirements.md`](docs/requirements.md) | Functional and non-functional requirements, user stories, acceptance criteria. |
| [`docs/test-cases.md`](docs/test-cases.md) | Manual test case table with execution status. |
| [`docs/demo-bugs.md`](docs/demo-bugs.md) | The three intentional defects, with reproduction steps. |
| [`docs/jira-plan.md`](docs/jira-plan.md) | Suggested epics, stories, tasks and bug reports to create in JIRA. |
