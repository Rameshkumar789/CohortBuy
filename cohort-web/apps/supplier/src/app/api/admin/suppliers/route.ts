import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/admin/suppliers - List all suppliers (pending and approved)
export async function GET(request: Request) {
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

        // Get query params for filtering
        const url = new URL(request.url);
        const status = url.searchParams.get('status'); // 'pending', 'approved', 'all'

        // Build query
        let query = supabase
            .from('suppliers')
            .select(`
                id,
                user_id,
                contact_email,
                business_name,
                business_type,
                website,
                tax_id,
                verified_at,
                created_at,
                updated_at
            `)
            .order('created_at', { ascending: false });

        // Filter by status
        if (status === 'pending') {
            query = query.is('verified_at', null);
        } else if (status === 'approved') {
            query = query.not('verified_at', 'is', null);
        }

        const { data: suppliers, error } = await query;

        if (error) {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 500 }
            );
        }

        // Format response
        const formattedSuppliers = (suppliers || []).map((s) => ({
            id: s.id,
            userId: s.user_id,
            email: s.contact_email,
            businessName: s.business_name,
            businessType: s.business_type,
            website: s.website,
            taxId: s.tax_id,
            isVerified: !!s.verified_at,
            verifiedAt: s.verified_at,
            createdAt: s.created_at,
            updatedAt: s.updated_at,
        }));

        return NextResponse.json({
            success: true,
            suppliers: formattedSuppliers,
            total: formattedSuppliers.length,
            pending: formattedSuppliers.filter(s => !s.isVerified).length,
            approved: formattedSuppliers.filter(s => s.isVerified).length,
        });
    } catch (err) {
        console.error('Suppliers list error:', err);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
