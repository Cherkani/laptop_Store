# LaptopStore - Modern E-Commerce Platform

A full-stack laptop e-commerce platform built with React, TypeScript, Supabase, and shadcn/ui.

## Features

- **Landing Page** - Hero section, featured products, category cards, and newsletter signup
- **Products Page** - Advanced filtering (brand, price, specs), search, sorting, and responsive grid
- **Product Detail** - Image gallery, specifications, quantity selector, add to cart
- **Shopping Cart** - Persistent drawer, real-time sync with Supabase for logged-in users
- **Authentication** - Email/password signup and login with Supabase Auth
- **Admin Dashboard** - Full product management (CRUD), image upload, specifications
- **Row Level Security** - Supabase RLS policies for data protection

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **UI Components:** Radix UI primitives (shadcn/ui style)
- **State Management:** Zustand (cart), React Query (server state), Context (auth)
- **Backend:** Supabase (PostgreSQL, Auth, Storage, RLS)
- **Routing:** React Router v6

## Getting Started

### 1. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration files in order:
   - `supabase/migrations/20260324000001_initial_schema.sql`
   - `supabase/migrations/20260324000002_create_products.sql`
   - `supabase/migrations/20260324000003_create_cart.sql`
   - `supabase/migrations/20260324000004_create_rls_policies.sql`
   - `supabase/migrations/20260324000005_storage_and_seed.sql`
3. The last migration creates the `product-images` storage bucket and seeds sample data

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in your Supabase project: **Settings → API**

### 3. Make Yourself an Admin

After signing up, run this in the Supabase SQL editor:
```sql
update public.profiles
set is_admin = true
where id = (select id from auth.users where email = 'your@email.com');
```

### 4. Install and Run

```bash
# Using Node 20+
nvm use 20
npm install
npm run dev
```

Visit `http://localhost:5173`

## Project Structure

```
src/
├── features/
│   ├── auth/         # Login, signup, auth hooks
│   ├── products/     # Product card, filter sidebar, hooks
│   ├── cart/         # Cart drawer
│   ├── admin/        # Admin product form and list
│   └── landing/      # Landing page sections
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── layout/       # Header, Footer, MainLayout
│   └── shared/       # ProtectedRoute
├── pages/
│   ├── admin/        # Admin dashboard pages
│   └── *.tsx         # Public pages
├── store/            # Zustand cart store
├── lib/              # Supabase client, utils
├── hooks/            # Global hooks
└── types/            # Database types

supabase/
└── migrations/       # All SQL migrations in order
```

## Admin Features

Access `/admin` after logging in with an admin account.

- **Dashboard** - Stats overview with inventory value, stock alerts
- **Products** - Searchable table with edit/delete actions
- **Add Product** - Full form with image upload (drag & drop), specs
- **Edit Product** - Same form pre-populated with existing data

## Deployment

Build for production:
```bash
npm run build
```

Deploy the `dist/` folder to Vercel, Netlify, or any static hosting.
Make sure to set the environment variables on your hosting platform.
