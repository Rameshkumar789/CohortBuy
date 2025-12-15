import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// GET /api/catalog/[id] - Get single product with all variants
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Fetch product with variants
        const { data: product, error } = await supabase
            .from('global_catalog')
            .select(`
                id,
                canonical_id,
                upc,
                gtin,
                title,
                brand,
                manufacturer,
                model,
                description,
                category_path,
                variant_axes,
                msrp_cents,
                reference_price_cents,
                primary_image_url,
                image_urls,
                attributes,
                search_keywords,
                created_at,
                product_variants (
                    id,
                    variant_values,
                    sku,
                    upc,
                    additional_price_cents,
                    image_url,
                    in_stock
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { success: false, message: 'Product not found' },
                    { status: 404 }
                );
            }
            console.error('Product query error:', error);
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 500 }
            );
        }

        // Also check for active pools for this product
        const { data: activePools } = await supabase
            .from('pools')
            .select('id, target_price_cents, current_quantity, target_quantity, expires_at')
            .eq('parent_product_id', id)
            .in('status', ['FORMING', 'NEGOTIATING'])
            .order('created_at', { ascending: false })
            .limit(5);

        // Transform to camelCase
        const transformedProduct = {
            id: product.id,
            canonicalId: product.canonical_id,
            upc: product.upc,
            gtin: product.gtin,
            title: product.title,
            brand: product.brand,
            manufacturer: product.manufacturer,
            model: product.model,
            description: product.description,
            categoryPath: product.category_path,
            variantAxes: product.variant_axes,
            msrpCents: product.msrp_cents,
            referencePriceCents: product.reference_price_cents,
            primaryImageUrl: product.primary_image_url,
            imageUrls: product.image_urls,
            attributes: product.attributes,
            searchKeywords: product.search_keywords,
            createdAt: product.created_at,
            variants: product.product_variants?.map((v: {
                id: string;
                variant_values: Record<string, string>;
                sku: string;
                upc: string;
                additional_price_cents: number;
                image_url: string;
                in_stock: boolean;
            }) => ({
                id: v.id,
                variantValues: v.variant_values,
                sku: v.sku,
                upc: v.upc,
                additionalPriceCents: v.additional_price_cents,
                imageUrl: v.image_url,
                inStock: v.in_stock,
            })) || [],
            activePools: activePools?.map(p => ({
                id: p.id,
                targetPriceCents: p.target_price_cents,
                currentQuantity: p.current_quantity,
                targetQuantity: p.target_quantity,
                expiresAt: p.expires_at,
            })) || [],
        };

        return NextResponse.json({
            success: true,
            product: transformedProduct,
        });
    } catch (err) {
        console.error('Product detail error:', err);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
