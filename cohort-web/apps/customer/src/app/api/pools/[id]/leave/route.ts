import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// POST /api/pools/[id]/leave - Leave a pool
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

        // Get pool details
        const { data: pool, error: poolError } = await supabase
            .from('pools')
            .select('id, status, current_quantity')
            .eq('id', poolId)
            .single();

        if (poolError || !pool) {
            return NextResponse.json(
                { success: false, message: 'Pool not found' },
                { status: 404 }
            );
        }

        // Check pool allows leaving (only FORMING status)
        if (pool.status !== 'FORMING') {
            return NextResponse.json(
                { success: false, message: 'Cannot leave pool after it has been locked' },
                { status: 400 }
            );
        }

        // Find user's pledge
        const { data: pledge, error: pledgeError } = await supabase
            .from('pledges')
            .select('id, status')
            .eq('pool_id', poolId)
            .eq('user_id', user.id)
            .single();

        if (pledgeError || !pledge) {
            return NextResponse.json(
                { success: false, message: 'You are not a member of this pool' },
                { status: 400 }
            );
        }

        // Update pledge status to VOIDED
        const { error: updateError } = await supabase
            .from('pledges')
            .update({ status: 'VOIDED' })
            .eq('id', pledge.id);

        if (updateError) {
            console.error('Pledge update error:', updateError);
            return NextResponse.json(
                { success: false, message: updateError.message },
                { status: 500 }
            );
        }

        // Update pool quantity
        await supabase
            .from('pools')
            .update({ current_quantity: Math.max(0, pool.current_quantity - 1) })
            .eq('id', poolId);

        return NextResponse.json({
            success: true,
            message: 'Successfully left pool',
        });
    } catch (err) {
        console.error('Leave pool error:', err);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
