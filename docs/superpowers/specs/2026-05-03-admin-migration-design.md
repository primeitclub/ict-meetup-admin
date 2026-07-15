# Design: Migrate Admin to Standalone `ict-meetup-admin` Repo

**Date:** 2026-05-03  
**Status:** Approved

---

## Overview

Extract the admin dashboard from `ict-frontend/src/admin/` into a fully standalone Vite + React + TypeScript project in `ict-meetup-admin/`. All shared dependencies (api layer, shared utils, layout) are copied into the new repo. The `/admin` route prefix is removed — routes are served from root.

---

## Target Folder Structure

```
ict-meetup-admin/
├── src/
│   ├── components/      # admin/components/ (form-field, table, navigation)
│   ├── constants/       # admin/constants/
│   ├── hooks/           # admin/hooks/
│   ├── layouts/         # AdminLayout.tsx (was ict-frontend/src/client/layouts/)
│   ├── lib/             # ict-frontend/src/lib/ (api-client, query, routes, types)
│   ├── pages/           # admin/pages/
│   ├── providers/       # AppProvider + ErrorBoundary (was global-wrappers/)
│   ├── routes/          # admin/routes/, admin-route.tsx → app-route.tsx
│   ├── shared/          # ict-frontend/src/shared/ (cn, design-components)
│   ├── store/           # admin/store/
│   ├── types/           # admin/types/
│   ├── App.tsx          # renders AppRouter at /* directly
│   ├── main.tsx         # entry point
│   └── index.css        # copied from ict-frontend
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tailwind.config.js
├── postcss.config.js
└── eslint.config.js
```

---

## Route Changes

All routes drop the `/admin` prefix:

| Old (in ict-frontend) | New (standalone) |
|---|---|
| `/admin/login` | `/login` |
| `/admin/home/*` | `/home/*` |
| `/admin/content-management/*` | `/content-management/*` |
| `/admin/people/*` | `/people/*` |
| `/admin/sponsors/*` | `/sponsors/*` |
| `/admin/settings/*` | `/settings/*` |

Default redirect: `/` → `/home/dashboard`

`App.tsx` renders `<AppRouter />` directly at `/*`. No client routing tree.

`AdminLayout` sidebar nav links updated from `/admin/*` → `/*`.

---

## Dependencies

**Package manager:** yarn

**Keep from ict-frontend:**
- `@tanstack/react-query`, `@tanstack/react-table`
- `clsx`, `tailwind-merge`
- `lucide-react`
- `react`, `react-dom`, `react-router-dom`
- `react-hook-form`, `react-hot-toast`, `react-select`
- `react-datepicker`, `@types/react-datepicker`
- `zustand`, `radix-ui`

**Drop (client-only, not used in admin):**
- `gsap`, `swiper`, `vevet`, `framer-motion`, `motion`

**Dev deps:** unchanged (vite, typescript, eslint, tailwind, postcss, autoprefixer)

---

## Environment

`.env` requires:
```
VITE_API_BASE_URL="http://localhost:4000/api"
```
(Matches what `src/lib/api-client.ts` reads via `import.meta.env.VITE_API_BASE_URL`)

Vite proxy: `/api` → `http://localhost:4000`

---

## Path Alias

`@/*` → `src/*` (configured in `tsconfig.app.json` and `vite.config.ts`)

---

## Import Path Updates Required

After copying files, these imports need updating:

- `admin-route.tsx` → `app-route.tsx`: remove `/admin` from all route `path` props and `Navigate to` values
- `AdminLayout.tsx`: update `useAuth` import path (`../../admin/hooks/use-auth` → `../hooks/use-auth`), `Toast` import (`../../shared/...` → `../shared/...`)
- All files importing from `../../shared/`, `../../lib/`, `../../../lib/` etc. — paths shift because the `src/admin/` nesting is gone
- `providers/AppProvider.tsx`: update ErrorBoundary import paths
