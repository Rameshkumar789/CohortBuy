import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/user/pools - Get user's active pools (pools they've pledged to)
export async function GET() {
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

        // Get user's pledges with pool info
        const { data: pledges, error: pledgesError } = await supabase
            .from('pledges')
            .select(`
                id,
                amount_cents,
                status,
                created_at,
                pools (
                    id,
                    target_price_cents,
                    target_quantity,
                    current_quantity,
                    status,
                    expires_at,
                    global_catalog (
                        id,
                        title,
                        brand,
                        primary_image_url
                    )
                )
            `)
            .eq('user_id', user.id)
            .in('status', ['PENDING', 'AUTHORIZED'])
            .order('created_at', { ascending: false });

        if (pledgesError) {
            console.error('Pledges query error:', pledgesError);
            return NextResponse.json(
                { success: false, message: pledgesError.message },
                { status: 500 }
            );
        }

        type PoolData = {
            id: string;
            target_price_cents: number;
            target_quantity: number;
            current_quantity: number;
            status: string;
            expires_at: string;
            global_catalog: {
                id: string;
                title: string;
                brand: string;
                primary_image_url: string;
            } | null;
        };

        // Transform to camelCase
        const userPools = pledges?.map(pledge => {
            const pool = pledge.pools as unknown as PoolData | null;
            const product = pool?.global_catalog || null;

            return {
                pledgeId: pledge.id,
                amountCents: pledge.amount_cents,
                pledgeStatus: pledge.status,
                pool: pool ? {
                    id: pool.id,
                    targetPriceCents: pool.target_price_cents,
                    targetQuantity: pool.target_quantity,
                    currentQuantity: pool.current_quantity,
                    status: pool.status,
                    expiresAt: pool.expires_at,
                } : null,
                product: product ? {
                    id: product.id,
                    title: product.title,
                    brand: product.brand,
                    primaryImageUrl: product.primary_image_url,
                } : null,
            };
        }).filter(p => p.pool && p.pool.status !== 'CANCELLED' && p.pool.status !== 'FAILED') || [];

        return NextResponse.json({
            success: true,
            pools: userPools,
        });
    } catch (err) {
        console.error('User pools error:', err);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
