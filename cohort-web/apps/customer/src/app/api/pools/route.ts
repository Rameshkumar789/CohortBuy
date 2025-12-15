import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/pools - List pools with optional filters
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || '';
        const productId = searchParams.get('productId') || '';
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                },
            }
        );

        // Build query
        let query = supabase
            .from('pools')
            .select(`
                id,
                parent_product_id,
                variant_id,
                creator_id,
                target_price_cents,
                target_quantity,
                current_quantity,
                status,
                expires_at,
                created_at,
                global_catalog (
                    id,
                    title,
                    brand,
                    primary_image_url,
                    msrp_cents
                )
            `)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        // Filter by status
        if (status) {
            query = query.eq('status', status);
        } else {
            // Default: show forming and negotiating pools
            query = query.in('status', ['FORMING', 'NEGOTIATING']);
        }

        // Filter by product
        if (productId) {
            query = query.eq('parent_product_id', productId);
        }

        const { data: pools, error: poolsError } = await query;

        if (poolsError) {
            console.error('Pools query error:', poolsError);
            return NextResponse.json(
                { success: false, message: poolsError.message },
                { status: 500 }
            );
        }

        // Transform to camelCase
        const transformedPools = pools?.map(pool => {
            const catalog = pool.global_catalog as unknown as {
                id: string;
                title: string;
                brand: string;
                primary_image_url: string;
                msrp_cents: number;
            } | null;

            return {
                id: pool.id,
                parentProductId: pool.parent_product_id,
                variantId: pool.variant_id,
                creatorId: pool.creator_id,
                targetPriceCents: pool.target_price_cents,
                targetQuantity: pool.target_quantity,
                currentQuantity: pool.current_quantity,
                status: pool.status,
                expiresAt: pool.expires_at,
                createdAt: pool.created_at,
                product: catalog ? {
                    id: catalog.id,
                    title: catalog.title,
                    brand: catalog.brand,
                    primaryImageUrl: catalog.primary_image_url,
                    msrpCents: catalog.msrp_cents,
                } : null,
            };
        }) || [];

        return NextResponse.json({
            success: true,
            pools: transformedPools,
        });
    } catch (err) {
        console.error('Pools list error:', err);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/pools - Create a new pool
export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                },
            }
        );

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { parentProductId, variantId, targetPriceCents, targetQuantity, expiresInDays = 7 } = body;

        // Validate required fields
        if (!parentProductId || !targetPriceCents || !targetQuantity) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields: parentProductId, targetPriceCents, targetQuantity' },
                { status: 400 }
            );
        }

        // Verify product exists
        const { data: product, error: productError } = await supabase
            .from('global_catalog')
            .select('id')
            .eq('id', parentProductId)
            .single();

        if (productError || !product) {
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        // Calculate expiration date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);

        // Create pool
        const { data: pool, error: createError } = await supabase
            .from('pools')
            .insert({
                parent_product_id: parentProductId,
                variant_id: variantId || null,
                creator_id: user.id,
                target_price_cents: targetPriceCents,
                target_quantity: targetQuantity,
                current_quantity: 0,
                status: 'FORMING',
                expires_at: expiresAt.toISOString(),
            })
            .select()
            .single();

        if (createError) {
            console.error('Pool creation error:', createError);
            return NextResponse.json(
                { success: false, message: createError.message },
                { status: 500 }
            );
        }

        // Auto-join the creator as the first pledger
        const { error: pledgeError } = await supabase
            .from('pledges')
            .insert({
                pool_id: pool.id,
                user_id: user.id,
                variant_id: variantId || null,
                amount_cents: targetPriceCents,
                status: 'PENDING',
            });

        if (pledgeError) {
            console.error('Creator pledge error:', pledgeError);
            // Don't fail the pool creation, just log the error
        } else {
            // Update pool quantity
            await supabase
                .from('pools')
                .update({ current_quantity: 1 })
                .eq('id', pool.id);
        }

        return NextResponse.json({
            success: true,
            pool: {
                id: pool.id,
                parentProductId: pool.parent_product_id,
                variantId: pool.variant_id,
                creatorId: pool.creator_id,
                targetPriceCents: pool.target_price_cents,
                targetQuantity: pool.target_quantity,
                currentQuantity: pledgeError ? 0 : 1,
                status: pool.status,
                expiresAt: pool.expires_at,
                createdAt: pool.created_at,
            },
        });
    } catch (err) {
        console.error('Pool creation error:', err);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
