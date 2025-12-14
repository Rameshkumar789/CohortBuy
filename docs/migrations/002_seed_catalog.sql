-- ============================================
-- Cohort Platform - Seed Data for Global Catalog
-- Run this AFTER 001_initial_schema.sql
-- ============================================

-- ============================================
-- SAMPLE PRODUCTS - Electronics Category
-- ============================================

-- Product 1: Sony A7 IV Camera
INSERT INTO public.global_catalog (
    id, canonical_id, upc, gtin, title, brand, manufacturer, model,
    description, category_path, variant_axes, msrp_cents, reference_price_cents,
    primary_image_url, attributes, search_keywords
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'B09JZT6YK5',
    '027242923287',
    '00027242923287',
    'Sony Alpha 7 IV Full-Frame Mirrorless Camera',
    'Sony',
    'Sony Electronics',
    'ILCE-7M4',
    'The Sony Alpha 7 IV sets a new standard as the basic model of the full-frame series. With newly developed 33MP full-frame back-illuminated Exmor R CMOS image sensor.',
    ARRAY['Electronics', 'Cameras', 'Mirrorless Cameras'],
    ARRAY['body_type'],
    249900,
    229900,
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
    '{"sensor": "33MP Full-Frame", "iso_range": "100-51200", "video": "4K 60p", "stabilization": "5-axis IBIS"}'::jsonb,
    ARRAY['sony', 'alpha', 'a7iv', 'a7 iv', 'mirrorless', 'full frame', 'camera']
);

-- Variant: Body Only
INSERT INTO public.product_variants (
    id, parent_product_id, variant_values, sku, upc
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    '{"body_type": "Body Only"}'::jsonb,
    'ILCE7M4/B',
    '027242923287'
);

-- Variant: With 28-70mm Lens Kit
INSERT INTO public.product_variants (
    id, parent_product_id, variant_values, sku, upc, additional_price_cents
) VALUES (
    '11111111-1111-1111-1111-111111111112',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    '{"body_type": "28-70mm Lens Kit"}'::jsonb,
    'ILCE7M4K/B',
    '027242923294',
    20000
);

-- Product 2: Apple MacBook Pro 14"
INSERT INTO public.global_catalog (
    id, canonical_id, upc, title, brand, manufacturer, model,
    description, category_path, variant_axes, msrp_cents, reference_price_cents,
    primary_image_url, attributes, search_keywords
) VALUES (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'MRX33LL/A',
    '195949107474',
    'Apple MacBook Pro 14-inch M3 Pro',
    'Apple',
    'Apple Inc.',
    'MacBook Pro 14 M3 Pro',
    'MacBook Pro with M3 Pro chip. 14.2-inch Liquid Retina XDR display, 18GB unified memory, and up to 22 hours battery life.',
    ARRAY['Electronics', 'Computers', 'Laptops'],
    ARRAY['storage', 'color'],
    199900,
    184900,
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    '{"chip": "M3 Pro", "cores": "11-core CPU, 14-core GPU", "memory": "18GB", "display": "14.2-inch Liquid Retina XDR"}'::jsonb,
    ARRAY['apple', 'macbook', 'macbook pro', 'm3', 'laptop', '14 inch', 'pro']
);

-- MacBook Variants
INSERT INTO public.product_variants (id, parent_product_id, variant_values, sku) VALUES
('22222222-2222-2222-2222-222222222221', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', '{"storage": "512GB", "color": "Space Black"}'::jsonb, 'MRX33LL/A'),
('22222222-2222-2222-2222-222222222222', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', '{"storage": "512GB", "color": "Silver"}'::jsonb, 'MRX43LL/A'),
('22222222-2222-2222-2222-222222222223', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', '{"storage": "1TB", "color": "Space Black"}'::jsonb, 'MRX53LL/A'),
('22222222-2222-2222-2222-222222222224', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', '{"storage": "1TB", "color": "Silver"}'::jsonb, 'MRX63LL/A');

-- Update 1TB variants with price addition
UPDATE public.product_variants 
SET additional_price_cents = 20000 
WHERE parent_product_id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901' 
AND variant_values->>'storage' = '1TB';

-- Product 3: Sony PlayStation 5
INSERT INTO public.global_catalog (
    id, canonical_id, upc, title, brand, manufacturer, model,
    description, category_path, variant_axes, msrp_cents, reference_price_cents,
    primary_image_url, attributes, search_keywords
) VALUES (
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'B0BCNKKZ91',
    '711719565710',
    'Sony PlayStation 5 Console',
    'Sony',
    'Sony Interactive Entertainment',
    'CFI-2000',
    'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, adaptive triggers and 3D Audio.',
    ARRAY['Electronics', 'Gaming', 'Consoles'],
    ARRAY['edition'],
    49999,
    47999,
    'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800',
    '{"storage": "1TB SSD", "resolution": "4K 120Hz", "ray_tracing": true, "backwards_compatible": true}'::jsonb,
    ARRAY['playstation', 'ps5', 'sony', 'gaming', 'console', 'playstation 5']
);

-- PS5 Variants
INSERT INTO public.product_variants (id, parent_product_id, variant_values, sku, upc) VALUES
('33333333-3333-3333-3333-333333333331', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '{"edition": "Disc Edition"}'::jsonb, 'CFI-2015', '711719565710'),
('33333333-3333-3333-3333-333333333332', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '{"edition": "Digital Edition"}'::jsonb, 'CFI-2015B', '711719565727');

-- Update Digital Edition with lower price
UPDATE public.product_variants 
SET additional_price_cents = -5000 
WHERE id = '33333333-3333-3333-3333-333333333332';

-- Product 4: Dyson V15 Detect Vacuum
INSERT INTO public.global_catalog (
    id, canonical_id, upc, title, brand, manufacturer, model,
    description, category_path, variant_axes, msrp_cents, reference_price_cents,
    primary_image_url, attributes, search_keywords
) VALUES (
    'd4e5f6a7-b8c9-0123-def0-234567890123',
    'B0916P2GRL',
    '885609025636',
    'Dyson V15 Detect Cordless Vacuum',
    'Dyson',
    'Dyson Ltd',
    'V15 Detect',
    'Dyson V15 Detect reveals invisible dust with a precisely-angled laser, sized and counted by an acoustic piezo sensor. Automatically optimizes suction for deep cleaning.',
    ARRAY['Home & Garden', 'Appliances', 'Vacuums'],
    ARRAY['color'],
    74999,
    64999,
    'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800',
    '{"runtime": "60 min", "suction": "230 AW", "dustbin": "0.76L", "laser": true}'::jsonb,
    ARRAY['dyson', 'v15', 'detect', 'vacuum', 'cordless', 'stick vacuum']
);

-- Dyson Variants
INSERT INTO public.product_variants (id, parent_product_id, variant_values, sku) VALUES
('44444444-4444-4444-4444-444444444441', 'd4e5f6a7-b8c9-0123-def0-234567890123', '{"color": "Yellow/Nickel"}'::jsonb, 'V15-YN'),
('44444444-4444-4444-4444-444444444442', 'd4e5f6a7-b8c9-0123-def0-234567890123', '{"color": "Purple/Nickel"}'::jsonb, 'V15-PN');

-- Product 5: LG C3 65" OLED TV
INSERT INTO public.global_catalog (
    id, canonical_id, upc, title, brand, manufacturer, model,
    description, category_path, variant_axes, msrp_cents, reference_price_cents,
    primary_image_url, attributes, search_keywords
) VALUES (
    'e5f6a7b8-c9d0-1234-ef01-345678901234',
    'OLED65C3PUA',
    '195174035252',
    'LG 65" Class C3 Series OLED 4K TV',
    'LG',
    'LG Electronics',
    'OLED65C3PUA',
    'LG OLED evo C3 65-inch 4K Smart TV with AI-Powered settings, α9 Gen6 AI Processor, and webOS 23. Perfect blacks & infinite contrast.',
    ARRAY['Electronics', 'TVs', 'OLED TVs'],
    ARRAY['size'],
    179999,
    149999,
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800',
    '{"resolution": "4K UHD", "refresh_rate": "120Hz", "hdr": "Dolby Vision IQ, HDR10, HLG", "gaming": "G-SYNC, FreeSync, VRR"}'::jsonb,
    ARRAY['lg', 'oled', 'c3', 'tv', '65 inch', '4k', 'smart tv']
);

-- TV Size Variants
INSERT INTO public.product_variants (id, parent_product_id, variant_values, sku, additional_price_cents) VALUES
('55555555-5555-5555-5555-555555555551', 'e5f6a7b8-c9d0-1234-ef01-345678901234', '{"size": "55 inch"}'::jsonb, 'OLED55C3PUA', -50000),
('55555555-5555-5555-5555-555555555552', 'e5f6a7b8-c9d0-1234-ef01-345678901234', '{"size": "65 inch"}'::jsonb, 'OLED65C3PUA', 0),
('55555555-5555-5555-5555-555555555553', 'e5f6a7b8-c9d0-1234-ef01-345678901234', '{"size": "77 inch"}'::jsonb, 'OLED77C3PUA', 100000),
('55555555-5555-5555-5555-555555555554', 'e5f6a7b8-c9d0-1234-ef01-345678901234', '{"size": "83 inch"}'::jsonb, 'OLED83C3PUA', 200000);

-- Product 6: Apple AirPods Pro 2
INSERT INTO public.global_catalog (
    id, canonical_id, upc, title, brand, manufacturer, model,
    description, category_path, variant_axes, msrp_cents, reference_price_cents,
    primary_image_url, attributes, search_keywords
) VALUES (
    'f6a7b8c9-d0e1-2345-f012-456789012345',
    'MTJV3AM/A',
    '194253944201',
    'Apple AirPods Pro (2nd generation) with USB-C',
    'Apple',
    'Apple Inc.',
    'AirPods Pro 2 USB-C',
    'AirPods Pro feature up to 2x more Active Noise Cancellation, Adaptive Transparency, and Personalized Spatial Audio with dynamic head tracking.',
    ARRAY['Electronics', 'Audio', 'Headphones'],
    NULL,
    24999,
    22999,
    'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800',
    '{"noise_cancellation": true, "transparency": true, "spatial_audio": true, "battery": "6 hours (30 with case)"}'::jsonb,
    ARRAY['apple', 'airpods', 'airpods pro', 'wireless', 'earbuds', 'anc', 'noise cancelling']
);

-- Single variant (no options)
INSERT INTO public.product_variants (id, parent_product_id, variant_values, sku, upc) VALUES
('66666666-6666-6666-6666-666666666661', 'f6a7b8c9-d0e1-2345-f012-456789012345', '{}'::jsonb, 'MTJV3AM/A', '194253944201');

-- Product 7: Nintendo Switch OLED
INSERT INTO public.global_catalog (
    id, canonical_id, upc, title, brand, manufacturer, model,
    description, category_path, variant_axes, msrp_cents, reference_price_cents,
    primary_image_url, attributes, search_keywords
) VALUES (
    'a7b8c9d0-e1f2-3456-0123-567890123456',
    'HEGSKAAAA',
    '045496882433',
    'Nintendo Switch OLED Model',
    'Nintendo',
    'Nintendo Co., Ltd.',
    'Switch OLED',
    'Nintendo Switch OLED Model with a vibrant 7-inch OLED screen, wide adjustable stand, enhanced audio, and 64GB internal storage.',
    ARRAY['Electronics', 'Gaming', 'Consoles'],
    ARRAY['color'],
    34999,
    32999,
    'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800',
    '{"screen": "7-inch OLED", "storage": "64GB", "battery": "4.5-9 hours", "dock": "included"}'::jsonb,
    ARRAY['nintendo', 'switch', 'oled', 'gaming', 'console', 'handheld']
);

-- Switch Color Variants
INSERT INTO public.product_variants (id, parent_product_id, variant_values, sku, upc) VALUES
('77777777-7777-7777-7777-777777777771', 'a7b8c9d0-e1f2-3456-0123-567890123456', '{"color": "White"}'::jsonb, 'HEGSKAAAW', '045496882433'),
('77777777-7777-7777-7777-777777777772', 'a7b8c9d0-e1f2-3456-0123-567890123456', '{"color": "Neon Red/Blue"}'::jsonb, 'HEGSKABAA', '045496882440');

-- Product 8: Bose QuietComfort Ultra Headphones
INSERT INTO public.global_catalog (
    id, canonical_id, upc, title, brand, manufacturer, model,
    description, category_path, variant_axes, msrp_cents, reference_price_cents,
    primary_image_url, attributes, search_keywords
) VALUES (
    'b8c9d0e1-f2a3-4567-1234-678901234567',
    'QCULTRAHPBLK',
    '017817848671',
    'Bose QuietComfort Ultra Headphones',
    'Bose',
    'Bose Corporation',
    'QC Ultra HP',
    'World-class noise cancellation with Bose Immersive Audio for a deeper connection to music. CustomTune technology adapts to your ears.',
    ARRAY['Electronics', 'Audio', 'Headphones'],
    ARRAY['color'],
    42900,
    37999,
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    '{"noise_cancellation": true, "battery": "24 hours", "immersive_audio": true, "multipoint": true}'::jsonb,
    ARRAY['bose', 'quietcomfort', 'qc', 'ultra', 'headphones', 'wireless', 'anc', 'noise cancelling']
);

-- Bose Color Variants
INSERT INTO public.product_variants (id, parent_product_id, variant_values, sku) VALUES
('88888888-8888-8888-8888-888888888881', 'b8c9d0e1-f2a3-4567-1234-678901234567', '{"color": "Black"}'::jsonb, 'QCULTRAHPBLK'),
('88888888-8888-8888-8888-888888888882', 'b8c9d0e1-f2a3-4567-1234-678901234567', '{"color": "White Smoke"}'::jsonb, 'QCULTRAHPWHT'),
('88888888-8888-8888-8888-888888888883', 'b8c9d0e1-f2a3-4567-1234-678901234567', '{"color": "Sandstone"}'::jsonb, 'QCULTRAHPSND');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the seed data was inserted correctly:

-- SELECT COUNT(*) as product_count FROM public.global_catalog;
-- SELECT COUNT(*) as variant_count FROM public.product_variants;
-- SELECT gc.title, COUNT(pv.id) as variants 
--   FROM public.global_catalog gc 
--   LEFT JOIN public.product_variants pv ON gc.id = pv.parent_product_id 
--   GROUP BY gc.id, gc.title;
