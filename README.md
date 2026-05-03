# Gozolt Ride — Supplier Portal Frontend

Supplier-facing web portal for the **Gozolt Ride** platform, built by **PRIMOOO Global Ltd**. Transport company suppliers use this portal to manage their fleet, drivers, vehicles, documents, payouts, and subscriptions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS 4 |
| UI Components | shadcn/ui (New York style) |
| State Management | Zustand |
| HTTP Client | Axios |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | Sonner |
| Forms | React Hook Form + Zod |

## Features

- **Dashboard** — KPI cards, rides & revenue charts, active rides table, alerts, quick actions
- **Fleet Management** — Vehicle registry with add/edit/detail views, driver assignment
- **Driver Management** — Driver onboarding, credentials generation, status management, ride history
- **GPS Fleet Tracking** — Real-time fleet map with driver locations (Leaflet)
- **Document Center** — Company, vehicle & driver document upload and management (3 tabs)
- **Financials** — Revenue KPIs, trend charts, per-driver earnings, payout history with CSV export
- **Maintenance & Fuel** — Maintenance logs, fuel logs with add entry modal (2 tabs)
- **Analytics** — Rides, revenue, driver performance charts, system distribution donut
- **Subscription** — Plan comparison, billing history, rate pricing, plan switching
- **Settings** — Company profile, notifications, team users, language, privacy (5 tabs)

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, Register, Forgot Password
│   ├── (dashboard)/      # All authenticated pages
│   │   ├── dashboard/
│   │   ├── fleet/
│   │   ├── drivers/
│   │   ├── gps-tracking/
│   │   ├── documents/
│   │   ├── financials/
│   │   ├── maintenance-fuel/
│   │   ├── analytics/
│   │   ├── subscription/
│   │   ├── payouts/
│   │   └── settings/
│   └── api/auth/         # Auth API routes (login, logout, me, refresh)
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Sidebar, Topbar
│   ├── dashboard/        # Dashboard-specific components
│   ├── fleet/            # Fleet components
│   ├── drivers/          # Driver components
│   ├── documents/        # Document center components
│   ├── financials/       # Financial components
│   ├── maintenance-fuel/ # Maintenance & fuel components
│   ├── analytics/        # Analytics chart components
│   ├── subscription/     # Subscription components
│   └── settings/         # Settings tab components
├── services/             # API service layer (with DevBypass support)
├── stores/               # Zustand stores (auth, sidebar)
├── hooks/                # Custom hooks (useAuth)
├── lib/                  # Utilities, API client, constants, mock data
└── types/                # TypeScript interfaces and enums
```

## Getting Started

### Prerequisites

- Node.js >= 20
- npm

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_DEV_BYPASS=true
NEXT_PUBLIC_API_URL=http://localhost:3000
AUTH_SECRET=your-secret-key
```

Set `NEXT_PUBLIC_DEV_BYPASS=true` to use mock data without a backend.

### Development

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## DevBypass Mode

When `NEXT_PUBLIC_DEV_BYPASS=true`, all API calls return mock data from `src/lib/mock-data.ts`. This allows full frontend development without a running backend. Settings and preferences persist to `localStorage`.

## License

Proprietary — PRIMOOO Global Ltd. All rights reserved.
