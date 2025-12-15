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

## Step 3: Global Catalog and Product Display ✅
- [x] Build catalog search API with pgvector
- [x] Create product listing page with filters
- [x] Build product detail page with variants
- [x] Implement search component with debouncing
- [ ] Add Stripe Elements for payment UI (deferred to Step 4)

## Step 4: Pool System (Core Feature) ✅
- [x] Build pool creation flow
- [x] Implement pool joining with Stripe authorization (deferred Stripe)
- [x] Create pool detail page with real-time updates
- [x] Build pool browser with filters
- [x] Implement pledge management (leave pool)
- [ ] Add Supabase Realtime for live pool updates (optional)

## Step 5: Supplier Portal MVP ✅
- [x] Build supplier registration and onboarding
- [x] Create supplier dashboard
- [x] Implement catalog import with matching
- [x] Build inventory management UI
- [x] Create agent configuration page
- [x] Build deal response interface
- [x] Admin APIs for supplier approval

## Step 6: Chrome Extension
- [x] Initialize Plasmo project
- [x] Implement product page detection
- [x] Build JSON-LD/OG scraping
- [ ] Create session sharing with web app
- [x] Build extension popup with pool status
- [x] Add content script overlay on retailer sites

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
**Last Updated:** 2025-12-15

### ✅ Completed
- Step 2: Customer Authentication and Landing
- Step 3: Global Catalog and Product Display
- Step 4: Pool System (Core Feature)
- Step 5: Supplier Portal MVP
  - Registration flow (2-step with email verification)
  - Dashboard with stats
  - Catalog import (CSV)
  - Agent configuration (AUTO/SEMI-AUTO/MANUAL)
  - Deal response UI (Accept/Counter/Reject)
  - Admin APIs for supplier management

### 📌 Next Steps
- Start Step 6: Chrome Extension

