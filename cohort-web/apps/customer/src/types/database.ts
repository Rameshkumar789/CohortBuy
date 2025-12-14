// Database types - copied from @cohort/database package
// This is a workaround for npm workspace type resolution issues

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            global_catalog: {
                Row: {
                    id: string
                    canonical_id: string | null
                    gtin: string | null
                    upc: string | null
                    ean: string | null
                    mpn: string | null
                    title: string
                    brand: string
                    manufacturer: string | null
                    model: string | null
                    description: string | null
                    category_path: string[] | null
                    category_id: string | null
                    variant_axes: string[] | null
                    weight_oz: number | null
                    dimensions_inches: Json | null
                    msrp_cents: number | null
                    reference_price_cents: number | null
                    primary_image_url: string | null
                    image_urls: string[] | null
                    attributes: Json | null
                    embedding: number[] | null
                    search_keywords: string[] | null
                    created_at: string
                    updated_at: string
                    verified_at: string | null
                }
                Insert: {
                    id?: string
                    canonical_id?: string | null
                    gtin?: string | null
                    upc?: string | null
                    ean?: string | null
                    mpn?: string | null
                    title: string
                    brand: string
                    manufacturer?: string | null
                    model?: string | null
                    description?: string | null
                    category_path?: string[] | null
                    category_id?: string | null
                    variant_axes?: string[] | null
                    weight_oz?: number | null
                    dimensions_inches?: Json | null
                    msrp_cents?: number | null
                    reference_price_cents?: number | null
                    primary_image_url?: string | null
                    image_urls?: string[] | null
                    attributes?: Json | null
                    embedding?: number[] | null
                    search_keywords?: string[] | null
                    created_at?: string
                    updated_at?: string
                    verified_at?: string | null
                }
                Update: {
                    id?: string
                    canonical_id?: string | null
                    gtin?: string | null
                    upc?: string | null
                    ean?: string | null
                    mpn?: string | null
                    title?: string
                    brand?: string
                    manufacturer?: string | null
                    model?: string | null
                    description?: string | null
                    category_path?: string[] | null
                    category_id?: string | null
                    variant_axes?: string[] | null
                    weight_oz?: number | null
                    dimensions_inches?: Json | null
                    msrp_cents?: number | null
                    reference_price_cents?: number | null
                    primary_image_url?: string | null
                    image_urls?: string[] | null
                    attributes?: Json | null
                    embedding?: number[] | null
                    search_keywords?: string[] | null
                    created_at?: string
                    updated_at?: string
                    verified_at?: string | null
                }
            }
            product_variants: {
                Row: {
                    id: string
                    parent_product_id: string
                    variant_values: Json
                    sku: string | null
                    upc: string | null
                    gtin: string | null
                    additional_price_cents: number
                    weight_oz: number | null
                    image_url: string | null
                    in_stock: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    parent_product_id: string
                    variant_values: Json
                    sku?: string | null
                    upc?: string | null
                    gtin?: string | null
                    additional_price_cents?: number
                    weight_oz?: number | null
                    image_url?: string | null
                    in_stock?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    parent_product_id?: string
                    variant_values?: Json
                    sku?: string | null
                    upc?: string | null
                    gtin?: string | null
                    additional_price_cents?: number
                    weight_oz?: number | null
                    image_url?: string | null
                    in_stock?: boolean
                    created_at?: string
                }
            }
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    role: string
                    stripe_customer_id: string | null
                    shipping_address: Json | null
                    preferences: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email?: string | null
                    role?: string
                    stripe_customer_id?: string | null
                    shipping_address?: Json | null
                    preferences?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string | null
                    role?: string
                    stripe_customer_id?: string | null
                    shipping_address?: Json | null
                    preferences?: Json | null
                    created_at?: string
                    updated_at?: string
                }
            }
            suppliers: {
                Row: {
                    id: string
                    user_id: string
                    business_name: string
                    business_type: string | null
                    website: string | null
                    tax_id: string | null
                    verified_at: string | null
                    agent_config: Json | null
                    stripe_connect_account_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    business_name: string
                    business_type?: string | null
                    website?: string | null
                    tax_id?: string | null
                    verified_at?: string | null
                    agent_config?: Json | null
                    stripe_connect_account_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    business_name?: string
                    business_type?: string | null
                    website?: string | null
                    tax_id?: string | null
                    verified_at?: string | null
                    agent_config?: Json | null
                    stripe_connect_account_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            supplier_catalog: {
                Row: {
                    id: string
                    supplier_id: string
                    variant_id: string
                    supplier_sku: string | null
                    price_cents: number
                    wholesale_price_cents: number | null
                    inventory_count: number
                    low_stock_threshold: number
                    is_active: boolean
                    last_sync_at: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    supplier_id: string
                    variant_id: string
                    supplier_sku?: string | null
                    price_cents: number
                    wholesale_price_cents?: number | null
                    inventory_count?: number
                    low_stock_threshold?: number
                    is_active?: boolean
                    last_sync_at?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    supplier_id?: string
                    variant_id?: string
                    supplier_sku?: string | null
                    price_cents?: number
                    wholesale_price_cents?: number | null
                    inventory_count?: number
                    low_stock_threshold?: number
                    is_active?: boolean
                    last_sync_at?: string
                    created_at?: string
                }
            }
            pools: {
                Row: {
                    id: string
                    parent_product_id: string
                    variant_id: string | null
                    creator_id: string
                    target_price_cents: number
                    target_quantity: number
                    current_quantity: number
                    status: string
                    expires_at: string
                    matched_supplier_id: string | null
                    negotiated_price_cents: number | null
                    super_agent_thread_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    parent_product_id: string
                    variant_id?: string | null
                    creator_id: string
                    target_price_cents: number
                    target_quantity: number
                    current_quantity?: number
                    status?: string
                    expires_at: string
                    matched_supplier_id?: string | null
                    negotiated_price_cents?: number | null
                    super_agent_thread_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    parent_product_id?: string
                    variant_id?: string | null
                    creator_id?: string
                    target_price_cents?: number
                    target_quantity?: number
                    current_quantity?: number
                    status?: string
                    expires_at?: string
                    matched_supplier_id?: string | null
                    negotiated_price_cents?: number | null
                    super_agent_thread_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            pledges: {
                Row: {
                    id: string
                    pool_id: string
                    user_id: string
                    variant_id: string | null
                    amount_cents: number
                    stripe_payment_intent_id: string | null
                    status: string
                    auth_expires_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    pool_id: string
                    user_id: string
                    variant_id?: string | null
                    amount_cents: number
                    stripe_payment_intent_id?: string | null
                    status?: string
                    auth_expires_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    pool_id?: string
                    user_id?: string
                    variant_id?: string | null
                    amount_cents?: number
                    stripe_payment_intent_id?: string | null
                    status?: string
                    auth_expires_at?: string | null
                    created_at?: string
                }
            }
            orders: {
                Row: {
                    id: string
                    pool_id: string
                    pledge_id: string
                    user_id: string
                    supplier_id: string
                    variant_id: string
                    amount_cents: number
                    status: string
                    shipping_address: Json | null
                    tracking_number: string | null
                    carrier: string | null
                    created_at: string
                    shipped_at: string | null
                    delivered_at: string | null
                }
                Insert: {
                    id?: string
                    pool_id: string
                    pledge_id: string
                    user_id: string
                    supplier_id: string
                    variant_id: string
                    amount_cents: number
                    status?: string
                    shipping_address?: Json | null
                    tracking_number?: string | null
                    carrier?: string | null
                    created_at?: string
                    shipped_at?: string | null
                    delivered_at?: string | null
                }
                Update: {
                    id?: string
                    pool_id?: string
                    pledge_id?: string
                    user_id?: string
                    supplier_id?: string
                    variant_id?: string
                    amount_cents?: number
                    status?: string
                    shipping_address?: Json | null
                    tracking_number?: string | null
                    carrier?: string | null
                    created_at?: string
                    shipped_at?: string | null
                    delivered_at?: string | null
                }
            }
            negotiations: {
                Row: {
                    id: string
                    pool_id: string
                    supplier_id: string
                    rfq_price_cents: number
                    response_price_cents: number | null
                    status: string
                    responded_at: string | null
                    thread_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    pool_id: string
                    supplier_id: string
                    rfq_price_cents: number
                    response_price_cents?: number | null
                    status?: string
                    responded_at?: string | null
                    thread_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    pool_id?: string
                    supplier_id?: string
                    rfq_price_cents?: number
                    response_price_cents?: number | null
                    status?: string
                    responded_at?: string | null
                    thread_id?: string | null
                    created_at?: string
                }
            }
            invite_codes: {
                Row: {
                    code: string
                    max_uses: number
                    used_count: number
                    created_by: string
                    expires_at: string | null
                    created_at: string
                }
                Insert: {
                    code: string
                    max_uses?: number
                    used_count?: number
                    created_by: string
                    expires_at?: string | null
                    created_at?: string
                }
                Update: {
                    code?: string
                    max_uses?: number
                    used_count?: number
                    created_by?: string
                    expires_at?: string | null
                    created_at?: string
                }
            }
            waitlist: {
                Row: {
                    id: string
                    email: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
