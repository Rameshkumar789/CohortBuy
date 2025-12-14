-- ============================================
-- Cohort Platform - Initial Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";  -- For pgvector semantic search

-- ============================================
-- 1. PROFILES (extends auth.users)
-- ============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'supplier', 'admin')),
    stripe_customer_id TEXT,
    shipping_address JSONB,
    preferences JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. SUPPLIERS
-- ============================================
CREATE TABLE public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_type TEXT,
    website TEXT,
    tax_id TEXT,
    verified_at TIMESTAMPTZ,  -- NULL = pending approval
    agent_config JSONB DEFAULT '{
        "mode": "MANUAL",
        "min_order_qty": 10,
        "min_margin_pct": 15,
        "max_discount_pct": 25,
        "escalation_threshold_cents": 5000000,
        "response_sla_hours": 24
    }'::jsonb,
    stripe_connect_account_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================
-- 3. GLOBAL CATALOG (Parent Products)
-- ============================================
CREATE TABLE public.global_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    canonical_id TEXT UNIQUE,  -- UPC/GTIN if known
    gtin TEXT,
    upc TEXT,
    ean TEXT,
    mpn TEXT,
    title TEXT NOT NULL,
    brand TEXT NOT NULL,
    manufacturer TEXT,
    model TEXT,
    description TEXT,
    category_path TEXT[],  -- Hierarchical: ['Electronics', 'Cameras', 'Mirrorless']
    category_id TEXT,
    variant_axes TEXT[],   -- ['color', 'storage'] for variants
    weight_oz NUMERIC,
    dimensions_inches JSONB,  -- {length, width, height}
    msrp_cents INTEGER,
    reference_price_cents INTEGER,  -- Average market price
    primary_image_url TEXT,
    image_urls TEXT[],
    attributes JSONB,  -- Flexible product attributes
    embedding VECTOR(768),  -- For semantic search (Gemini embedding size)
    search_keywords TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ
);

-- Index for semantic search
CREATE INDEX idx_global_catalog_embedding ON public.global_catalog 
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Full-text search index
CREATE INDEX idx_global_catalog_search ON public.global_catalog 
    USING gin(to_tsvector('english', title || ' ' || COALESCE(brand, '') || ' ' || COALESCE(description, '')));

-- ============================================
-- 4. PRODUCT VARIANTS (SKU-level)
-- ============================================
CREATE TABLE public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_product_id UUID NOT NULL REFERENCES public.global_catalog(id) ON DELETE CASCADE,
    variant_values JSONB NOT NULL,  -- {"color": "Black", "storage": "256GB"}
    sku TEXT,
    upc TEXT,
    gtin TEXT,
    additional_price_cents INTEGER NOT NULL DEFAULT 0,  -- Price add-on for this variant
    weight_oz NUMERIC,
    image_url TEXT,
    in_stock BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(parent_product_id, variant_values)
);

-- ============================================
-- 5. SUPPLIER CATALOG (Links suppliers to variants)
-- ============================================
CREATE TABLE public.supplier_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    supplier_sku TEXT,
    price_cents INTEGER NOT NULL,  -- Retail price
    wholesale_price_cents INTEGER,  -- Floor price for deals
    inventory_count INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER NOT NULL DEFAULT 10,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_sync_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(supplier_id, variant_id)
);

-- ============================================
-- 6. POOLS (Cohorts)
-- ============================================
CREATE TABLE public.pools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_product_id UUID NOT NULL REFERENCES public.global_catalog(id),
    variant_id UUID REFERENCES public.product_variants(id),  -- NULL = any variant OK
    creator_id UUID NOT NULL REFERENCES auth.users(id),
    target_price_cents INTEGER NOT NULL,
    target_quantity INTEGER NOT NULL,
    current_quantity INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'FORMING' CHECK (status IN (
        'FORMING',      -- Gathering pledges
        'NEGOTIATING',  -- Target met, negotiating with suppliers
        'LOCKED',       -- Deal accepted, awaiting payment capture
        'CAPTURED',     -- Payments captured, orders created
        'FULFILLED',    -- All orders shipped
        'EXPIRED',      -- Deadline passed without meeting target
        'CANCELLED'     -- Manually cancelled
    )),
    expires_at TIMESTAMPTZ NOT NULL,
    matched_supplier_id UUID REFERENCES public.suppliers(id),
    negotiated_price_cents INTEGER,
    super_agent_thread_id TEXT,  -- LangGraph thread for persistence
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for active pools
CREATE INDEX idx_pools_status ON public.pools(status) WHERE status IN ('FORMING', 'NEGOTIATING');
CREATE INDEX idx_pools_expires ON public.pools(expires_at) WHERE status = 'FORMING';

-- ============================================
-- 7. PLEDGES (User commitments to pools)
-- ============================================
CREATE TABLE public.pledges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pool_id UUID NOT NULL REFERENCES public.pools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    variant_id UUID REFERENCES public.product_variants(id),
    amount_cents INTEGER NOT NULL,
    stripe_payment_intent_id TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING',     -- Awaiting authorization
        'AUTHORIZED',  -- Card authorized (hold placed)
        'CAPTURED',    -- Payment captured
        'VOIDED',      -- Authorization cancelled
        'REFUNDED'     -- Payment refunded
    )),
    auth_expires_at TIMESTAMPTZ,  -- 7-day Stripe authorization window
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(pool_id, user_id)
);

-- ============================================
-- 8. ORDERS (Post-capture)
-- ============================================
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pool_id UUID NOT NULL REFERENCES public.pools(id),
    pledge_id UUID NOT NULL REFERENCES public.pledges(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id),
    amount_cents INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING',     -- Order created, awaiting processing
        'PROCESSING',  -- Supplier is preparing order
        'SHIPPED',     -- Order shipped
        'DELIVERED',   -- Order delivered
        'COMPLETED'    -- Customer confirmed receipt
    )),
    shipping_address JSONB,
    tracking_number TEXT,
    carrier TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

-- ============================================
-- 9. NEGOTIATIONS (Deal tracking)
-- ============================================
CREATE TABLE public.negotiations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pool_id UUID NOT NULL REFERENCES public.pools(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
    rfq_price_cents INTEGER NOT NULL,  -- Our asking price
    response_price_cents INTEGER,       -- Supplier's response
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING',    -- Awaiting supplier response
        'ACCEPTED',   -- Supplier accepted
        'COUNTERED',  -- Supplier counter-offered
        'REJECTED',   -- Supplier rejected
        'EXPIRED'     -- No response within SLA
    )),
    responded_at TIMESTAMPTZ,
    thread_id TEXT,  -- Agent thread for this negotiation
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 10. INVITE CODES (Early access)
-- ============================================
CREATE TABLE public.invite_codes (
    code TEXT PRIMARY KEY,
    max_uses INTEGER NOT NULL DEFAULT 100,
    used_count INTEGER NOT NULL DEFAULT 0,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 11. WAITLIST (From landing page)
-- ============================================
CREATE TABLE public.waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- SUPPLIERS: Public read for verified, owners can manage
CREATE POLICY "Anyone can view verified suppliers" ON public.suppliers
    FOR SELECT USING (verified_at IS NOT NULL);

CREATE POLICY "Owners can manage their supplier record" ON public.suppliers
    FOR ALL USING (auth.uid() = user_id);

-- GLOBAL CATALOG: Public read
CREATE POLICY "Anyone can view catalog" ON public.global_catalog
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert catalog" ON public.global_catalog
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- PRODUCT VARIANTS: Public read
CREATE POLICY "Anyone can view variants" ON public.product_variants
    FOR SELECT USING (true);

-- SUPPLIER CATALOG: Public read, suppliers manage their own
CREATE POLICY "Anyone can view supplier catalog" ON public.supplier_catalog
    FOR SELECT USING (true);

CREATE POLICY "Suppliers manage their catalog" ON public.supplier_catalog
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.suppliers 
            WHERE suppliers.id = supplier_catalog.supplier_id 
            AND suppliers.user_id = auth.uid()
        )
    );

-- POOLS: Public read, authenticated create
CREATE POLICY "Anyone can view pools" ON public.pools
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create pools" ON public.pools
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their pools" ON public.pools
    FOR UPDATE USING (auth.uid() = creator_id);

-- PLEDGES: Users see their own, pool creators see pool pledges
CREATE POLICY "Users can view own pledges" ON public.pledges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create pledges" ON public.pledges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pledges" ON public.pledges
    FOR UPDATE USING (auth.uid() = user_id);

-- ORDERS: Users see their own, suppliers see their orders
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Suppliers can view their orders" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.suppliers 
            WHERE suppliers.id = orders.supplier_id 
            AND suppliers.user_id = auth.uid()
        )
    );

CREATE POLICY "Suppliers can update their orders" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.suppliers 
            WHERE suppliers.id = orders.supplier_id 
            AND suppliers.user_id = auth.uid()
        )
    );

-- NEGOTIATIONS: Suppliers see their negotiations
CREATE POLICY "Suppliers view their negotiations" ON public.negotiations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.suppliers 
            WHERE suppliers.id = negotiations.supplier_id 
            AND suppliers.user_id = auth.uid()
        )
    );

-- INVITE CODES: Public read (to validate codes)
CREATE POLICY "Anyone can validate invite codes" ON public.invite_codes
    FOR SELECT USING (true);

-- WAITLIST: Anyone can insert (public signup)
CREATE POLICY "Anyone can join waitlist" ON public.waitlist
    FOR INSERT WITH CHECK (true);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON public.suppliers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_global_catalog_updated_at
    BEFORE UPDATE ON public.global_catalog
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pools_updated_at
    BEFORE UPDATE ON public.pools
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================
-- Enable realtime for pools (live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.pools;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pledges;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Increment pool quantity when pledge is authorized
CREATE OR REPLACE FUNCTION public.increment_pool_quantity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'AUTHORIZED' AND (OLD.status IS NULL OR OLD.status != 'AUTHORIZED') THEN
        UPDATE public.pools 
        SET current_quantity = current_quantity + 1
        WHERE id = NEW.pool_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_pledge_authorized
    AFTER INSERT OR UPDATE ON public.pledges
    FOR EACH ROW EXECUTE FUNCTION public.increment_pool_quantity();

-- Decrement pool quantity when pledge is voided
CREATE OR REPLACE FUNCTION public.decrement_pool_quantity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'VOIDED' AND OLD.status = 'AUTHORIZED' THEN
        UPDATE public.pools 
        SET current_quantity = current_quantity - 1
        WHERE id = NEW.pool_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_pledge_voided
    AFTER UPDATE ON public.pledges
    FOR EACH ROW EXECUTE FUNCTION public.decrement_pool_quantity();
