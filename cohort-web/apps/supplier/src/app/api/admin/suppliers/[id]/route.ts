import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/admin/suppliers/[id] - Get single supplier details
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

        const { data: supplier, error } = await supabase
            .from('suppliers')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !supplier) {
            return NextResponse.json(
                { success: false, message: 'Supplier not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            supplier: {
                id: supplier.id,
                userId: supplier.user_id,
                businessName: supplier.business_name,
                businessType: supplier.business_type,
                website: supplier.website,
                taxId: supplier.tax_id,
                isVerified: !!supplier.verified_at,
                verifiedAt: supplier.verified_at,
                agentConfig: supplier.agent_config,
                createdAt: supplier.created_at,
                updatedAt: supplier.updated_at,
            },
        });
    } catch (err) {
        console.error('Supplier fetch error:', err);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/admin/suppliers/[id] - Approve or reject supplier
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

        const body = await request.json();
        const { action } = body; // 'approve' or 'reject'

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { success: false, message: 'Invalid action. Use "approve" or "reject"' },
                { status: 400 }
            );
        }

        // Check if supplier exists
        const { data: supplier, error: fetchError } = await supabase
            .from('suppliers')
            .select('id, user_id, business_name, verified_at')
            .eq('id', id)
            .single();

        if (fetchError || !supplier) {
            return NextResponse.json(
                { success: false, message: 'Supplier not found' },
                { status: 404 }
            );
        }

        if (action === 'approve') {
            // Approve supplier
            const { error: updateError } = await supabase
                .from('suppliers')
                .update({ verified_at: new Date().toISOString() })
                .eq('id', id);

            if (updateError) {
                return NextResponse.json(
                    { success: false, message: updateError.message },
                    { status: 500 }
                );
            }

            // Update profile role to 'supplier'
            await supabase
                .from('profiles')
                .update({ role: 'supplier' })
                .eq('id', supplier.user_id);

            return NextResponse.json({
                success: true,
                message: `Supplier "${supplier.business_name}" has been approved`,
                supplierId: id,
                action: 'approved',
            });
        }

        if (action === 'reject') {
            // For rejection, we could delete the supplier or mark as rejected
            // For MVP, we'll just delete the record
            const { error: deleteError } = await supabase
                .from('suppliers')
                .delete()
                .eq('id', id);

            if (deleteError) {
                return NextResponse.json(
                    { success: false, message: deleteError.message },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                message: `Supplier "${supplier.business_name}" has been rejected and removed`,
                supplierId: id,
                action: 'rejected',
            });
        }

        return NextResponse.json(
            { success: false, message: 'Unknown action' },
            { status: 400 }
        );
    } catch (err) {
        console.error('Supplier action error:', err);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
