import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/deals/[id] - Get deal details
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

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get pool with product info
        const { data: pool, error } = await supabase
            .from('pools')
            .select(`
                id,
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
                    reference_price_cents
                )
            `)
            .eq('id', id)
            .single();

        if (error || !pool) {
            return NextResponse.json(
                { success: false, message: 'Deal not found' },
                { status: 404 }
            );
        }

        // Handle the joined data - Supabase returns object for single relations
        const catalogData = pool.global_catalog;
        const product = catalogData && typeof catalogData === 'object' && !Array.isArray(catalogData)
            ? catalogData as {
                id: string;
                title: string;
                brand: string;
                description: string;
                primary_image_url: string;
                msrp_cents: number;
                reference_price_cents: number;
            }
            : null;

        return NextResponse.json({
            success: true,
            pool: {
                id: pool.id,
                targetPriceCents: pool.target_price_cents,
                targetQuantity: pool.target_quantity,
                currentQuantity: pool.current_quantity,
                status: pool.status,
                expiresAt: pool.expires_at,
                createdAt: pool.created_at,
                product: product ? {
                    id: product.id,
                    title: product.title,
                    brand: product.brand,
                    description: product.description,
                    primaryImageUrl: product.primary_image_url,
                    msrpCents: product.msrp_cents || product.reference_price_cents,
                } : null,
            },
        });
    } catch (err) {
        console.error('Deal fetch error:', err);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/deals/[id] - Respond to a deal (accept/counter/reject)
export async function POST(
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

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user is a verified supplier
        const { data: supplier } = await supabase
            .from('suppliers')
            .select('id, verified_at')
            .eq('user_id', user.id)
            .single();

        if (!supplier || !supplier.verified_at) {
            return NextResponse.json(
                { success: false, message: 'Supplier not verified' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { action, counterPriceCents } = body;

        if (!['accept', 'counter', 'reject'].includes(action)) {
            return NextResponse.json(
                { success: false, message: 'Invalid action' },
                { status: 400 }
            );
        }

        // Get the pool
        const { data: pool, error: poolError } = await supabase
            .from('pools')
            .select('id, status, target_price_cents')
            .eq('id', id)
            .single();

        if (poolError || !pool) {
            return NextResponse.json(
                { success: false, message: 'Deal not found' },
                { status: 404 }
            );
        }

        // Handle actions
        if (action === 'accept') {
            // Update pool with matched supplier
            const { error: updateError } = await supabase
                .from('pools')
                .update({
                    matched_supplier_id: supplier.id,
                    negotiated_price: pool.target_price_cents / 100,
                    status: 'LOCKED',
                })
                .eq('id', id);

            if (updateError) {
                return NextResponse.json(
                    { success: false, message: updateError.message },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                message: 'Deal accepted! Payment capture will begin shortly.',
            });
        }

        if (action === 'counter') {
            if (!counterPriceCents || counterPriceCents <= 0) {
                return NextResponse.json(
                    { success: false, message: 'Invalid counter price' },
                    { status: 400 }
                );
            }

            // For MVP, just log the counter offer
            // In production, this would create a negotiation record
            console.log(`Supplier ${supplier.id} countered pool ${id} with ${counterPriceCents} cents`);

            return NextResponse.json({
                success: true,
                message: 'Counter offer submitted. Buyers will be notified.',
            });
        }

        if (action === 'reject') {
            // For MVP, just log the rejection
            // In production, this would update deal status
            console.log(`Supplier ${supplier.id} rejected pool ${id}`);

            return NextResponse.json({
                success: true,
                message: 'Deal declined.',
            });
        }

        return NextResponse.json(
            { success: false, message: 'Unknown action' },
            { status: 400 }
        );
    } catch (err) {
        console.error('Deal action error:', err);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
