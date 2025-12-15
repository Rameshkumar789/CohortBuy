import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/pools/[id] - Get pool details
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

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

        // Get current user (optional for viewing)
        const { data: { user } } = await supabase.auth.getUser();

        // Fetch pool with product info
        const { data: pool, error: poolError } = await supabase
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
                    description,
                    primary_image_url,
                    msrp_cents,
                    reference_price_cents,
                    category_path,
                    attributes
                )
            `)
            .eq('id', id)
            .single();

        if (poolError) {
            if (poolError.code === 'PGRST116') {
                return NextResponse.json(
                    { success: false, message: 'Pool not found' },
                    { status: 404 }
                );
            }
            console.error('Pool query error:', poolError);
            return NextResponse.json(
                { success: false, message: poolError.message },
                { status: 500 }
            );
        }

        // Get pledge count (not individual pledges for privacy)
        const { count: pledgeCount } = await supabase
            .from('pledges')
            .select('*', { count: 'exact', head: true })
            .eq('pool_id', id)
            .in('status', ['PENDING', 'AUTHORIZED']);

        // Check if current user has pledged
        let userPledge = null;
        if (user) {
            const { data: pledge } = await supabase
                .from('pledges')
                .select('id, amount_cents, status, created_at')
                .eq('pool_id', id)
                .eq('user_id', user.id)
                .single();

            if (pledge) {
                userPledge = {
                    id: pledge.id,
                    amountCents: pledge.amount_cents,
                    status: pledge.status,
                    createdAt: pledge.created_at,
                };
            }
        }

        const product = pool.global_catalog as unknown as {
            id: string;
            title: string;
            brand: string;
            description: string;
            primary_image_url: string;
            msrp_cents: number;
            reference_price_cents: number;
            category_path: string[];
            attributes: Record<string, unknown>;
        } | null;

        return NextResponse.json({
            success: true,
            pool: {
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
                isCreator: user?.id === pool.creator_id,
                pledgeCount: pledgeCount || 0,
                userPledge,
                product: product ? {
                    id: product.id,
                    title: product.title,
                    brand: product.brand,
                    description: product.description,
                    primaryImageUrl: product.primary_image_url,
                    msrpCents: product.msrp_cents,
                    referencePriceCents: product.reference_price_cents,
                    categoryPath: product.category_path,
                    attributes: product.attributes,
                } : null,
            },
        });
    } catch (err) {
        console.error('Pool detail error:', err);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
