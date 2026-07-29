# BoostedBoiz – Tuning Stage Calculator

![Tests](https://github.com/LovaszyLeonard/BoostedBoiz/actions/workflows/test.yml/badge.svg)

A modern, motorsport-themed web application designed to calculate horsepower and torque gains across various automotive tuning stages. Select your make, model, and engine to explore stage upgrades—complete with hardware requirements, HUD telemetry, and interactive dyno charts.


---

## Features

* **Smart Searchable Comboboxes** – Deep link or share specific builds easily via state-synced URL parameters.
* **Hybrid Tuning Engine** – Combines real curated data for popular engines with intelligent algorithmic fallbacks for long-tail options.
* **Stage Performance Cards** – Detailed breakdowns of HP/torque gains, target boost levels, and required hardware upgrades.
* **HUD Telemetry Bar** – Instant snapshot of platform details, engine code, factory baseline specs, and peak potential.
* **Interactive Dyno Graph** – Dynamic visual comparison (powered by Recharts) comparing stock curves vs. staged power curves.
* **Race-Condition Safe** – Stale async requests are ignored, ensuring UI state always reflects the active target.
* **Sleek UI/UX** – Skeleton loaders for async operations wrapped in a dark, motorsport-inspired UI with carbon-fiber grid textures and high-contrast amber/emerald accents.

---

## Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Database** | PostgreSQL (Supabase) + Prisma ORM |
| **Data Viz** | Recharts |
| **Icons** | Lucide React |
| **Testing** | Vitest, React Testing Library |
| **CI/CD** | GitHub Actions, Vercel |

---

## Architecture & API Routes

Client (Next.js) ---> REST API (Route Handlers) ---> Prisma ORM ---> PostgreSQL (Supabase)

| Endpoint | Description |
| :--- | :--- |
| `GET /api/makes` | Returns all available vehicle makes |
| `GET /api/makes/:makeId/models` | Returns available models for a specific make |
| `GET /api/models/:modelId/engines` | Returns available engines for a specific model |
| `GET /api/engines/:engineId/stages` | Returns curated stage data or generated fallback estimates |

---

## Getting Started

### Prerequisites

* Node.js (v18+ recommended)
* npm, pnpm, or yarn

### 1. Installation

git clone https://github.com/LovaszyLeonard/BoostedBoiz.git
cd BoostedBoiz
npm install

### 2. Database Configuration

Create a .env file in the root directory:

DATABASE_URL="file:./dev.db"

Choose one of the database options below to seed and initialize:

#### Option A: Quick Start (Local SQLite)

# Push schema and run initial seed
npx prisma migrate dev --name init
npx prisma db seed

# (Optional) Seed extended dataset
npx ts-node prisma/seed-large.ts

# Start development server
npm run dev

#### Option B: Production Parity (Cloud PostgreSQL)

Update your .env with your PostgreSQL string:
DATABASE_URL="postgresql://user:password@host:6543/db"

Then run:
npx prisma migrate deploy
npx prisma db seed
npm run dev

Open http://localhost:3000 in your browser.

---

## Testing

Run the test suite (includes unit tests for API routes and component tests for selection workflows):

npm test

---

## Deployment

This project is deployed on Vercel with a Supabase PostgreSQL instance. Ensure the DATABASE_URL environment variable is configured in your Vercel project settings.

---

## Roadmap & Future Improvements

- User Accounts & Garage – Save custom garage builds to user profiles.
- Admin Portal – Graphical interface to manage and add curated engine specs.
- Dyno CSV Import – Upload real dyno run files to generate hyper-accurate custom curves.
- PWA Support – Offline capability and mobile app installation support.
