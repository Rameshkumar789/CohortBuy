import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// GET /api/catalog - List products with optional search/filter
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q') || '';
        const category = searchParams.get('category') || '';
        const brand = searchParams.get('brand') || '';
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Build query
        let query = supabase
            .from('global_catalog')
            .select(`
                id,
                canonical_id,
                title,
                brand,
                description,
                category_path,
                msrp_cents,
                reference_price_cents,
                primary_image_url,
                attributes,
                variant_axes,
                product_variants (
                    id
                )
            `)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        // Apply search filter
        if (q) {
            query = query.or(`title.ilike.%${q}%,brand.ilike.%${q}%,description.ilike.%${q}%`);
        }

        // Apply category filter
        if (category) {
            query = query.contains('category_path', [category]);
        }

        // Apply brand filter
        if (brand) {
            query = query.eq('brand', brand);
        }

        const { data: products, error, count } = await query;

        if (error) {
            console.error('Catalog query error:', error);
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 500 }
            );
        }

        // Transform products to include variant count
        const transformedProducts = products?.map(product => ({
            id: product.id,
            canonicalId: product.canonical_id,
            title: product.title,
            brand: product.brand,
            description: product.description,
            categoryPath: product.category_path,
            msrpCents: product.msrp_cents,
            referencePriceCents: product.reference_price_cents,
            primaryImageUrl: product.primary_image_url,
            attributes: product.attributes,
            variantAxes: product.variant_axes,
            variantCount: product.product_variants?.length || 0,
        })) || [];

        return NextResponse.json({
            success: true,
            products: transformedProducts,
            pagination: {
                offset,
                limit,
                total: count || transformedProducts.length,
            }
        });
    } catch (err) {
        console.error('Catalog error:', err);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
