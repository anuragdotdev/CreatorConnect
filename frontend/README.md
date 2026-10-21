# CreatorConnect — Frontend

The web interface of CreatorConnect, built with **Next.js 16 (App Router)**,
**React 19**, **TypeScript** and **Tailwind CSS 4**.

```bash
npm install
npm run dev      # http://localhost:3000
```

The frontend talks to the CreatorConnect API. By default it expects the API on
`http://localhost:4000`; set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` to
point somewhere else.

```bash
npm run build      # production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # Vitest + React Testing Library
```

For the full project setup, the API reference and the documentation index, see
the [repository README](../README.md).
