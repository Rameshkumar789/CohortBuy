# Cohort Platform - Task Tracker

## Step 1: Project Setup and Database
- [x] Initialize cohort-web monorepo with npm workspaces
- [ ] Initialize cohort-extension with Plasmo
- [ ] Initialize cohort-agents with Python/FastAPI
- [x] Create Supabase project (user has existing project)
- [/] Define and run database migrations
  - [x] Created `001_initial_schema.sql` with all tables
  - [ ] Run migration in Supabase SQL Editor
  - [ ] Enable pgvector extension
- [x] Set up shared TypeScript types package (`@cohort/database`)
- [ ] Configure environment variables (.env.local)
- [x] Create Supabase client utilities
- [ ] Seed global catalog with mock data
  - [ ] Run `002_seed_catalog.sql` for sample products

## Step 2: Customer Authentication and Landing ✅
- [x] Build landing page with invite code gate
- [x] Implement Supabase Auth (Google OAuth + email magic link)
- [x] Create auth context and protected routes
- [x] Build basic layout with navigation (sidebar in dashboard)
- [ ] Implement user profile page

## Step 3: Global Catalog and Product Display
- [ ] Build catalog search API with pgvector
- [ ] Create product listing page with filters
- [ ] Build product detail page with variants
- [ ] Implement search component with debouncing
- [ ] Add Stripe Elements for payment UI

## Step 4: Pool System (Core Feature)
- [ ] Build pool creation flow
- [ ] Implement pool joining with Stripe authorization
- [ ] Create pool detail page with real-time updates
- [ ] Build pool browser with filters
- [ ] Implement pledge management (leave pool)
- [ ] Add Supabase Realtime for live pool updates

## Step 5: Supplier Portal MVP
- [ ] Build supplier registration and onboarding
- [ ] Create supplier dashboard
- [ ] Implement catalog import with matching
- [ ] Build inventory management UI
- [ ] Create agent configuration page
- [ ] Build deal response interface

## Step 6: Chrome Extension
- [ ] Initialize Plasmo project
- [ ] Implement product page detection
- [ ] Build JSON-LD/OG scraping
- [ ] Create session sharing with web app
- [ ] Build extension popup with pool status
- [ ] Add content script overlay on retailer sites

## Step 7: AI Agent Service
- [ ] Set up Python LangGraph project
- [ ] Implement Global Catalog Agent
- [ ] Build Super Agent (pool monitoring)
- [ ] Create Negotiator Agent (RFQ flow)
- [ ] Build Supplier Agent (rule evaluation)
- [ ] Set up agent persistence with checkpointing

## Step 8: Payment Orchestration
- [ ] Implement Stripe Connect for suppliers
- [ ] Build payment capture logic
- [ ] Create order creation after capture
- [ ] Implement refund/void flows
- [ ] Set up Stripe webhook handlers

## Step 9: Order Fulfillment
- [ ] Build customer order tracking page
- [ ] Create supplier order management
- [ ] Implement tracking number upload
- [ ] Add order status notifications
- [ ] Build order history and details

## Step 10: Polish and Production Prep
- [ ] Mobile responsive optimization
- [ ] Error handling and loading states
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Production deployment setup

---

## Current Status
**Last Updated:** 2025-12-13

### ✅ Completed
- Step 2: Customer Authentication and Landing (Build passing)
  - Landing page with invite code validation
  - Login page (Google OAuth + magic link)
  - Waitlist signup flow
  - Protected dashboard with sidebar
  - Auth callback and signout routes

### 🔧 Pending Setup
1. Run `001_initial_schema.sql` in Supabase SQL Editor
2. Run `002_seed_catalog.sql` to populate sample products
3. Configure `.env.local` with Supabase credentials
4. Configure Google OAuth in Supabase Auth settings

### 📌 Next Steps
- Start Step 3: Global Catalog and Product Display
