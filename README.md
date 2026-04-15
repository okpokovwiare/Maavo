# Vault — Budget Tracker v2

Live: **https://okpokovwiare.github.io/Maavo/**

A ground-up rewrite of the original `Budget APP` as a React + Vite + TypeScript SPA with Tailwind. All core features preserved, no PWA layer, no XSS footguns.

Three pages: **Home** (dashboard + balance), **Activity** (transactions, budgets, recurring, bills, debts), **Settings** (reports + config).

## Deploying

```bash
npm run deploy  # builds dist/ and pushes to the gh-pages branch
```

GitHub Pages is configured to serve from `gh-pages`. Deploy commit = whatever is in `dist/` at the time you run it.

## Stack

- **Vite 6** + **React 19** + **TypeScript 5.7**
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **React Router v7** for tab routing
- **Zustand v5** with `persist` middleware (replaces manual localStorage dance)
- **React Hook Form + Zod** for typed, inline-error forms
- **Recharts** for the donut + comparison charts
- **Framer Motion** for modal/page transitions
- **lucide-react** for icons, emojis for categories
- **date-fns** for all date math
- IDs are `crypto.randomUUID()` — no more `Date.now()` collisions

## Run it

```bash
cd budget-tracker-v2
npm install     # already done if you installed earlier
npm run dev     # http://localhost:5173
```

Other scripts:

```bash
npm run build      # type-check + production build → dist/
npm run preview    # preview the production build
npm run typecheck  # tsc --noEmit
```

## Features

- Transactions (income / expense) with search and type filter
- Per-category monthly budgets with progress bars (warn at 80%, danger at 100%)
- Recurring rules (daily / weekly / monthly) that auto-materialize on load
- Bills with partial payment + full payment history
- Debts (I owe / someone owes me) with partial payment + history
- Reports: spending-by-category donut, 6-month income/expense comparison
- Currency toggle NGN ↔ USD with live exchange rate (open.er-api.com, no API key)
- Dark mode
- Import / Export JSON — **backups from the original app import cleanly**; legacy IDs are normalized to UUIDs on the way in
- Editable category list in Settings (the originals had personal names baked in)

## What's deliberately not here

- PWA / offline / service worker (opted out per the rewrite brief)
- Cloud sync, auth, multi-device
- The "Naavo" home page with four cards — three of those led to 404 in the original

## Project layout

```
src/
├── App.tsx                 # router + FAB + recurring auto-materialization
├── main.tsx
├── types/                  # Transaction, Budget, Bill, Debt, Recurring, Currency
├── lib/                    # pure utilities: id, currency, date, recurring, etc.
├── stores/                 # six Zustand slices, each persisted
├── hooks/                  # useMonth, useMonthlySummary, useExchangeRate
├── components/
│   ├── layout/             # AppShell, Header, TabBar, Fab
│   ├── ui/                 # Button, Input, Modal, ConfirmDialog, …
│   ├── transaction/
│   ├── budget/
│   ├── recurring/
│   ├── bill/
│   ├── debt/
│   └── reports/            # Recharts donut + bar chart
├── routes/                 # Overview, Budgets, Recurring, Bills, Debts, Reports, Settings
└── styles/index.css        # Tailwind v4 tokens
```
