# Conca — Real Estate CRM

All-in-one CRM and operating system for small real estate investment firms. Manage deals, contacts, properties, and asset management in one place.

## Tech Stack

- **Framework**: Next.js 15 (App Router), TypeScript (strict mode)
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Database**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **Forms**: react-hook-form + Zod validation
- **Tables**: TanStack React Table
- **Kanban**: @dnd-kit drag-and-drop
- **Search**: PostgreSQL full-text search (tsvector + pg_trgm)

## Features (Phase 1)

- **Authentication** — Email/password signup and login
- **Contacts** — Full CRUD for people and companies, many-to-many relationships, interaction logging, tags
- **Deals** — Pipeline kanban and table views, custom fields per asset class, deal economics, stage tracking
- **Properties** — CRUD with geolocation, asset class categorization, linked deals
- **Global Search** — Cmd+K search across all entities
- **CSV Import** — Bulk import contacts and properties
- **Row Level Security** — Every table protected by RLS policies

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone <repo-url> conca
cd conca
npm install
```

### 2. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and paste the contents of `supabase/all_migrations.sql` — this single file contains all 24 migrations in order
3. The `pg_trgm` extension is enabled automatically by the first migration

**Alternative (Supabase CLI):** If you have Docker running locally, you can use `npx supabase start` to run a fully local Supabase instance. The migration files in `supabase/migrations/` use the Supabase CLI timestamp format and will be applied automatically.

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase project credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Find these values in your Supabase dashboard under **Settings > API**.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to the login page. Click "Sign up" to create your first account and organization.

### 5. Seed data (optional)

After signing up, you can seed sample data. See `supabase/seed.sql` for instructions — you'll need to replace placeholder IDs with your actual org and user IDs.

## Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL)
4. Deploy

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Public auth pages (login, signup, etc.)
│   ├── (app)/           # Authenticated pages with sidebar
│   │   ├── dashboard/   # Portfolio overview
│   │   ├── contacts/    # Contact CRUD + import
│   │   ├── companies/   # Company CRUD
│   │   ├── deals/       # Kanban + table + detail pages
│   │   ├── properties/  # Property CRUD + import
│   │   └── settings/    # Org settings + team management
│   └── api/auth/        # Supabase auth callback
├── components/
│   ├── ui/              # shadcn/ui primitives
│   ├── layout/          # Sidebar, topbar, navigation
│   ├── contacts/        # Contact-specific components
│   ├── companies/       # Company-specific components
│   ├── deals/           # Kanban, forms, economics, custom fields
│   ├── properties/      # Property-specific components
│   ├── search/          # Global search (Cmd+K)
│   ├── csv-import/      # CSV upload, column mapping, preview
│   └── shared/          # Reusable: DataTable, PageHeader, TagInput
└── lib/
    ├── supabase/        # Client configs (browser, server, admin)
    ├── actions/         # Next.js Server Actions for all modules
    ├── schemas/         # Zod validation schemas
    ├── constants/       # Deal stages, asset classes, contact types
    ├── hooks/           # Custom React hooks
    └── types/           # Database types + convenience aliases
```

## Documentation

- **[SCHEMA.md](./SCHEMA.md)** — Complete database schema documentation
- **[ROADMAP.md](./ROADMAP.md)** — Phased build plan

## Asset Classes Supported

- Industrial Outdoor Storage (IOS)
- Marina
- Hospitality
- Multifamily
- Transitional
- Other

Each asset class has predefined custom fields that appear on deal forms automatically.

## Deal Pipeline Stages

Sourcing > LOI > Under Contract > Due Diligence > Closed > Dead
