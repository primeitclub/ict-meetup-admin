# Admin Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract `ict-frontend/src/admin/` into a standalone Vite + React + TypeScript project in `ict-meetup-admin/` with routes served from `/` instead of `/admin/*`.

**Architecture:** Copy admin source, shared lib, and layout files from `ict-frontend` into a clean folder structure under `src/`, then fix all cross-boundary import paths and route strings. Entry point renders `<AppRouter />` directly at `/*`.

**Tech Stack:** React 19, Vite 7, TypeScript 5.9, Tailwind CSS 3, React Query 5, Zustand 5, React Hook Form 7, react-router-dom 7, yarn

---

## File Map

| Destination | Source |
|---|---|
| `src/components/` | `ict-frontend/src/admin/components/` |
| `src/constants/` | `ict-frontend/src/admin/constants/` |
| `src/hooks/` | `ict-frontend/src/admin/hooks/` |
| `src/pages/` | `ict-frontend/src/admin/pages/` |
| `src/routes/` | `ict-frontend/src/admin/routes/` |
| `src/store/` | `ict-frontend/src/admin/store/` |
| `src/types/` | `ict-frontend/src/admin/types/` |
| `src/lib/` | `ict-frontend/src/lib/` |
| `src/shared/` | `ict-frontend/src/shared/` |
| `src/layouts/AdminLayout.tsx` | `ict-frontend/src/client/layouts/AdminLayout.tsx` |
| `src/providers/AppProvider.tsx` | `ict-frontend/src/global-wrappers/AppProvider.tsx` |
| `src/providers/ErrorBounds.tsx` | `ict-frontend/src/global-wrappers/ErrorBounds.tsx` |
| `src/assets/logo.svg` | `ict-frontend/src/assets/logo.svg` |
| `src/assets/icons/EmptyCart.tsx` | `ict-frontend/src/assets/icons/EmptyCart.tsx` |
| `src/index.css` | `ict-frontend/src/index.css` |

**Files created new:** `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`, `eslint.config.js`, `index.html`, `.env.sample`, `src/main.tsx`, `src/App.tsx`, `src/providers/ErrorFallback.tsx`

**Files modified after copy:**
- `src/routes/app-route.tsx` — rename + fix AdminLayout import + fix Navigate path
- `src/routes/protected-route.tsx` — fix `/admin/login` → `/login`
- `src/layouts/AdminLayout.tsx` — fix 2 imports + 5 nav link paths
- `src/hooks/use-auth.ts` — fix 2 imports + 2 navigate calls
- `src/pages/content-management/Hero.tsx` — fix `../../../lib` → `../../lib`
- `src/pages/content-management/HeroForm.tsx` — fix `../../../lib` → `../../lib`
- `src/pages/home/Versions.tsx` — fix `../../../lib` → `../../lib`
- `src/pages/home/VersionForm.tsx` — fix `../../../lib` → `../../lib`
- `src/pages/auth/Login.tsx` — fix `../../../assets` → `../../assets`
- `src/components/table/Table.tsx` — fix `../../../assets` → `../../assets`

---

## Task 1: Create project config files

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `eslint.config.js`
- Create: `index.html`
- Create: `.env.sample`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "ict-meetup-admin",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.90.12",
    "@tanstack/react-table": "^8.21.3",
    "@types/react-datepicker": "^7.0.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.562.0",
    "radix-ui": "^1.4.3",
    "react": "^19.2.0",
    "react-datepicker": "^9.1.0",
    "react-dom": "^19.2.0",
    "react-hook-form": "^7.72.1",
    "react-hot-toast": "^2.6.0",
    "react-router-dom": "^7.11.0",
    "react-select": "^5.10.2",
    "tailwind-merge": "^3.4.0",
    "zustand": "^5.0.9"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@types/node": "^24.10.1",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "autoprefixer": "^10.4.23",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.46.4",
    "vite": "^7.2.4"
  },
  "packageManager": "yarn@1.22.22"
}
```

- [ ] **Step 2: Create `vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },
});
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

- [ ] **Step 4: Create `tsconfig.app.json`**

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "types": ["node"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 6: Create `tailwind.config.js`** — copy the full config from `ict-frontend/tailwind.config.js` (remove the unused `transform` import at the top)

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        'primary': '#020919',
        'primary-cyan': '#3571F0',
        'primary-cyan-dark': '#0099cc',
        'secondary': '#212121',
        'admin-primary': '#01060A',
        'admin-secondary': '#39BFF2',
        'accent-light': '#3B82F6',
        'accent-dark': '#1D4ED8',
        'btn-primary': '#3571F0',
        'btn-primary-hover': '#184EBF',
        'btn-secondary': '#02369E',
        'btn-secondary-hover': '#12306C',
        'glow-primary': '#0956F9',
        'glow-secondary': '#DBF5FF',
        'glow-tertiary': '#02369B',
      },
      fontFamily: {
        sans: ['"Mona Sans"', 'sans-serif'],
        hubot: ['"Hubot Sans"', 'sans-serif'],
      },
      textColor: {
        'success': '#10B981',
        'error': '#EF4444',
        'warning': '#D19A66',
        'info': '#3B82F6',
        'primary': '#F5F5F5',
        'secondary': '#D4D4D4',
        'tertiary': '#A3A3A3',
        'nav-default': '#F5F5F5',
        'nav-hover': '#A3A3A3',
        'nav-active': '#3B82F6',
      },
      spacing: {
        'page-margin': '2rem',
      },
      fontWeight: {
        light: '300',
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shine': 'shine 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shine: {
          '0%, 100%': { transform: 'translateX(-100%) skewX(12deg)' },
          '50%, 100%': { transform: 'translateX(200%) skewX(12deg)' },
        },
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 7: Create `postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 8: Create `eslint.config.js`**

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-explicit-any': 'error',
      'prefer-const': 'error',
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
```

- [ ] **Step 9: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Mona+Sans:ital,wght@0,200..900;1,200..900&display=swap"
      rel="stylesheet"
    />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ICT Admin</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 10: Create `.env.sample`**

```
VITE_API_BASE_URL="http://localhost:4000/api"
```

- [ ] **Step 11: Commit**

```bash
git add package.json vite.config.ts tsconfig*.json tailwind.config.js postcss.config.js eslint.config.js index.html .env.sample
git commit -m "feat: scaffold project config files"
```

---

## Task 2: Copy source files

**Files:** All copy operations from `ict-frontend` into `ict-meetup-admin/src/`

Working directory for all commands: `ict-meetup-admin/`

- [ ] **Step 1: Create required directories**

```bash
mkdir -p src/layouts src/providers src/assets/icons
```

- [ ] **Step 2: Copy admin source tree (flattens `src/admin/` → `src/`)**

```bash
cp -r ../ict-frontend/src/admin/components src/
cp -r ../ict-frontend/src/admin/constants src/
cp -r ../ict-frontend/src/admin/hooks src/
cp -r ../ict-frontend/src/admin/pages src/
cp -r ../ict-frontend/src/admin/routes src/
cp -r ../ict-frontend/src/admin/store src/
cp -r ../ict-frontend/src/admin/types src/
```

- [ ] **Step 3: Copy lib and shared**

```bash
cp -r ../ict-frontend/src/lib src/
cp -r ../ict-frontend/src/shared src/
```

- [ ] **Step 4: Copy AdminLayout**

```bash
cp ../ict-frontend/src/client/layouts/AdminLayout.tsx src/layouts/
```

- [ ] **Step 5: Copy providers (AppProvider + ErrorBounds)**

```bash
cp ../ict-frontend/src/global-wrappers/AppProvider.tsx src/providers/
cp ../ict-frontend/src/global-wrappers/ErrorBounds.tsx src/providers/
```

- [ ] **Step 6: Copy required assets**

```bash
cp ../ict-frontend/src/assets/logo.svg src/assets/
cp ../ict-frontend/src/assets/icons/EmptyCart.tsx src/assets/icons/
cp ../ict-frontend/src/assets/favicon.svg src/assets/ 2>/dev/null || true
```

- [ ] **Step 7: Copy index.css**

```bash
cp ../ict-frontend/src/index.css src/
```

- [ ] **Step 8: Rename admin-route.tsx to app-route.tsx**

```bash
mv src/routes/admin-route.tsx src/routes/app-route.tsx
```

- [ ] **Step 9: Commit**

```bash
git add src/
git commit -m "feat: copy source files from ict-frontend"
```

---

## Task 3: Create entry point files

**Files:**
- Create: `src/main.tsx`
- Create: `src/App.tsx`

- [ ] **Step 1: Create `src/main.tsx`**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import AppProvider from "./providers/AppProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
);
```

- [ ] **Step 2: Create `src/App.tsx`**

```tsx
import { Routes, Route } from "react-router-dom";
import AppRouter from "./routes/app-route";

function App() {
  return (
    <Routes>
      <Route path="/*" element={<AppRouter />} />
    </Routes>
  );
}

export default App;
```

- [ ] **Step 3: Commit**

```bash
git add src/main.tsx src/App.tsx
git commit -m "feat: add entry point files"
```

---

## Task 4: Create admin ErrorFallback

The copied `ErrorFallback.tsx` from `global-wrappers/` imports client-only `Navbar` and `Footer` components that don't exist in this repo. Replace it with a simple admin fallback.

**Files:**
- Create: `src/providers/ErrorFallback.tsx`

- [ ] **Step 1: Write `src/providers/ErrorFallback.tsx`**

```tsx
const ErrorFallback = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-admin-primary text-white">
      <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong.</h2>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-admin-secondary rounded hover:opacity-80 transition"
      >
        Reload page
      </button>
    </div>
  );
};

export default ErrorFallback;
```

- [ ] **Step 2: Commit**

```bash
git add src/providers/ErrorFallback.tsx
git commit -m "feat: add admin-specific ErrorFallback"
```

---

## Task 5: Fix app-route.tsx

Two changes: (1) AdminLayout import path, (2) default redirect path.

**Files:**
- Modify: `src/routes/app-route.tsx`

- [ ] **Step 1: Replace the full file content**

```tsx
import { Navigate, Route, Routes } from "react-router-dom";
import { Login, HomeRouter } from "../pages";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./protected-route";

import ContentManagementRouter from "../pages/content-management/ContentMngRoute";
import PeopleRouter from "../pages/people/PeopleRoute";
import SettingsRouter from "../pages/settings/SettingsRoute";
import SponsorsRouter from "../pages/sponsors/SponsorsRoute";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <Routes>
              <Route element={<AdminLayout />}>
                <Route
                  index
                  element={<Navigate to="/home/dashboard" replace />}
                />
                <Route path="home/*" element={<HomeRouter />} />
                <Route
                  path="content-management/*"
                  element={<ContentManagementRouter />}
                />
                <Route path="people/*" element={<PeopleRouter />} />
                <Route path="sponsors/*" element={<SponsorsRouter />} />
                <Route path="settings/*" element={<SettingsRouter />} />
              </Route>
            </Routes>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/app-route.tsx
git commit -m "fix: rename admin-route to app-route, remove /admin prefix from routes"
```

---

## Task 6: Fix protected-route.tsx

Change the redirect from `/admin/login` to `/login`.

**Files:**
- Modify: `src/routes/protected-route.tsx`

- [ ] **Step 1: Replace the full file content**

```tsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { useAuth } from "../hooks/use-auth";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  useAuth();

  const { isAuthenticated, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/protected-route.tsx
git commit -m "fix: update protected-route redirect to /login"
```

---

## Task 7: Fix AdminLayout.tsx

Two import paths change (AdminLayout moved from `src/client/layouts/` to `src/layouts/`) and five nav link paths drop the `/admin` prefix.

**Files:**
- Modify: `src/layouts/AdminLayout.tsx`

- [ ] **Step 1: Replace the full file content**

```tsx
import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Handshake,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import Toast from "../shared/design-components/toast/Toast";

export default function AdminLayout() {
  const { logout, isLoggingOut } = useAuth();
  const links = [
    { label: "Home", path: "/home", icon: LayoutDashboard },
    { label: "Content Management", path: "/content-management", icon: FileText },
    { label: "People", path: "/people", icon: Users },
    { label: "Sponsors", path: "/sponsors", icon: Handshake },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-admin-primary text-white">
      <div className="flex flex-1">
        <aside className="w-64 bg-admin-primary border-r border-gray-800 p-4 flex flex-col">
          <header className="p-4 bg-admin-primary border-b border-gray-800 mb-4">
            <h1 className="font-bold text-xl">ICT Meetup</h1>
          </header>
          <nav className="flex flex-col space-y-2 flex-1">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-3 rounded transition-colors ${
                      isActive
                        ? "bg-admin-secondary text-white font-medium"
                        : "text-gray-400 hover:bg-admin-secondary/50 hover:text-white"
                    }`
                  }
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-gray-800">
            <button
              onClick={logout}
              disabled={isLoggingOut}
              className="flex items-center space-x-3 p-3 rounded text-red-400 hover:bg-red-500/10 transition-colors w-full disabled:opacity-50"
            >
              <LogOut size={20} />
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        </aside>
        <main className="flex-1 p-6">
          <Toast />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/AdminLayout.tsx
git commit -m "fix: update AdminLayout import paths and nav links"
```

---

## Task 8: Fix use-auth.ts

Two import paths shorten by one `../` (file moved from `src/admin/hooks/` to `src/hooks/`). Two `navigate()` calls drop the `/admin` prefix.

**Files:**
- Modify: `src/hooks/use-auth.ts`

- [ ] **Step 1: Fix the import lines (lines 19–21)**

Change:
```ts
import { useApiMutation } from "../../lib/use-api-mutation";
import { useAuthStore, type AuthUser } from "../store/auth.store";
import type { ApiError } from "../../lib";
```

To:
```ts
import { useApiMutation } from "../lib/use-api-mutation";
import { useAuthStore, type AuthUser } from "../store/auth.store";
import type { ApiError } from "../lib";
```

- [ ] **Step 2: Fix navigate calls in the `useEffect`**

Change:
```ts
navigate("/admin/login");
```
To:
```ts
navigate("/login");
```

- [ ] **Step 3: Fix navigate calls in `onSuccess` / `onError` of login and logout mutations**

In the login `onSuccess`:
```ts
navigate("/");
```
(was `navigate("/admin")`)

In the logout `onSuccess`:
```ts
navigate("/login");
```
(was `navigate("/admin/login")`)

In the logout `onError`:
```ts
navigate("/login");
```
(was `navigate("/admin/login")`)

- [ ] **Step 4: Commit**

```bash
git add src/hooks/use-auth.ts
git commit -m "fix: update use-auth import paths and navigate routes"
```

---

## Task 9: Fix page cross-boundary imports

Files in `src/pages/**` that used `../../../lib/` (3 levels up through `admin/`) now need `../../lib/` (2 levels up from `src/`). Similarly `../../../assets/` becomes `../../assets/`.

**Files:**
- Modify: `src/pages/content-management/Hero.tsx`
- Modify: `src/pages/content-management/HeroForm.tsx`
- Modify: `src/pages/home/Versions.tsx`
- Modify: `src/pages/home/VersionForm.tsx`
- Modify: `src/pages/auth/Login.tsx`
- Modify: `src/components/table/Table.tsx`

- [ ] **Step 1: Fix `src/pages/content-management/Hero.tsx`**

Change all occurrences of `"../../../lib` to `"../../lib` in this file.

There are 2 import lines to update:
```ts
import { useApiQuery } from "../../lib";
import { useApiMutation } from "../../lib/use-api-mutation";
```

- [ ] **Step 2: Fix `src/pages/content-management/HeroForm.tsx`**

Change all occurrences of `"../../../lib` to `"../../lib`:
```ts
import useGetVersions from "../../lib/hooks/use-get-versions";
import useCreateHeroSection from "../../lib/hooks/use-create-hero-section";
import { useApiQuery } from "../../lib";
import { useApiMutation } from "../../lib/use-api-mutation";
```

- [ ] **Step 3: Fix `src/pages/home/Versions.tsx`**

Change all occurrences of `"../../../lib` to `"../../lib`:
```ts
import { useApiQuery } from "../../lib/use-api-query";
import { useApiMutation } from "../../lib/use-api-mutation";
```

- [ ] **Step 4: Fix `src/pages/home/VersionForm.tsx`**

Change all occurrences of `"../../../lib` to `"../../lib`:
```ts
import { useApiMutation } from "../../lib/use-api-mutation";
import { ApiError } from "../../lib/api-client";
import { useApiQuery } from "../../lib/use-api-query";
```

- [ ] **Step 5: Fix `src/pages/auth/Login.tsx`**

Change:
```ts
import logo from "../../../assets/logo.svg";
```
To:
```ts
import logo from "../../assets/logo.svg";
```

- [ ] **Step 6: Fix `src/components/table/Table.tsx`**

Change:
```ts
import EmptyCart from "../../../assets/icons/EmptyCart";
```
To:
```ts
import EmptyCart from "../../assets/icons/EmptyCart";
```

- [ ] **Step 7: Commit**

```bash
git add src/pages/ src/components/
git commit -m "fix: update cross-boundary import paths in pages and components"
```

---

## Task 10: Install dependencies and verify build

- [ ] **Step 1: Install dependencies**

Run from `ict-meetup-admin/`:
```bash
yarn install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 2: Run TypeScript check**

```bash
yarn build
```

Expected output ends with lines like:
```
✓ built in Xs
```

If you see TypeScript errors, they will name the file and line. Common issues:
- Import not found → check the path was updated in Tasks 5–9
- Module has no exported member → verify the export name in the source file

- [ ] **Step 3: Smoke-test dev server**

```bash
yarn dev
```

Open `http://localhost:5173` — should redirect to `/login`. Log in and verify the dashboard loads.

- [ ] **Step 4: Create `.env` from sample**

```bash
cp .env.sample .env
```

Edit `.env` to set the correct API base URL if different from the default.

- [ ] **Step 5: Final commit**

```bash
git add yarn.lock
git commit -m "feat: add yarn.lock after dependency install"
```
