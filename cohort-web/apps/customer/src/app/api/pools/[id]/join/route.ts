import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// POST /api/pools/[id]/join - Join a pool
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: poolId } = await params;

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

        // Parse optional body
        let variantId = null;
        try {
            const body = await request.json();
            variantId = body.variantId || null;
        } catch {
            // No body, that's fine
        }

        // Get pool details
        const { data: pool, error: poolError } = await supabase
            .from('pools')
            .select('id, status, target_price_cents, current_quantity, target_quantity')
            .eq('id', poolId)
            .single();

        if (poolError || !pool) {
            return NextResponse.json(
                { success: false, message: 'Pool not found' },
                { status: 404 }
            );
        }

        // Check pool is still forming
        if (pool.status !== 'FORMING') {
            return NextResponse.json(
                { success: false, message: 'Pool is no longer accepting pledges' },
                { status: 400 }
            );
        }

        // Check if already pledged
        const { data: existingPledge } = await supabase
            .from('pledges')
            .select('id')
            .eq('pool_id', poolId)
            .eq('user_id', user.id)
            .single();

        if (existingPledge) {
            return NextResponse.json(
                { success: false, message: 'You have already joined this pool' },
                { status: 400 }
            );
        }

        // Create pledge (without Stripe for now)
        const { data: pledge, error: pledgeError } = await supabase
            .from('pledges')
            .insert({
                pool_id: poolId,
                user_id: user.id,
                variant_id: variantId,
                amount_cents: pool.target_price_cents,
                status: 'PENDING', // Will be 'AUTHORIZED' after Stripe integration
            })
            .select()
            .single();

        if (pledgeError) {
            console.error('Pledge creation error:', pledgeError);
            return NextResponse.json(
                { success: false, message: pledgeError.message },
                { status: 500 }
            );
        }

        // Update pool quantity (normally done by trigger, but let's be explicit)
        await supabase
            .from('pools')
            .update({ current_quantity: pool.current_quantity + 1 })
            .eq('id', poolId);

        return NextResponse.json({
            success: true,
            message: 'Successfully joined pool',
            pledge: {
                id: pledge.id,
                poolId: pledge.pool_id,
                amountCents: pledge.amount_cents,
                status: pledge.status,
            },
        });
    } catch (err) {
        console.error('Join pool error:', err);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
