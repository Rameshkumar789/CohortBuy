import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// POST /api/register - Register as a supplier
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
                { success: false, message: 'Please log in first' },
                { status: 401 }
            );
        }

        // Check if already a supplier
        const { data: existingSupplier } = await supabase
            .from('suppliers')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (existingSupplier) {
            return NextResponse.json(
                { success: false, message: 'You are already registered as a supplier' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { businessName, businessType, website, taxId } = body;

        // Validate required fields
        if (!businessName) {
            return NextResponse.json(
                { success: false, message: 'Business name is required' },
                { status: 400 }
            );
        }

        // Create supplier record
        const { data: supplier, error: createError } = await supabase
            .from('suppliers')
            .insert({
                user_id: user.id,
                contact_email: user.email, // Store email from auth
                business_name: businessName,
                business_type: businessType || null,
                website: website || null,
                tax_id: taxId || null,
                // verified_at is NULL by default - requires admin approval
                agent_config: {
                    mode: 'MANUAL',
                    min_order_qty: 10,
                    min_margin_pct: 15,
                    max_discount_pct: 25,
                    escalation_threshold_cents: 5000000,
                    response_sla_hours: 24
                }
            })
            .select()
            .single();

        if (createError) {
            console.error('Supplier creation error:', createError);
            return NextResponse.json(
                { success: false, message: createError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            supplier: {
                id: supplier.id,
                businessName: supplier.business_name,
                businessType: supplier.business_type,
                website: supplier.website,
                verified: !!supplier.verified_at,
                createdAt: supplier.created_at,
            },
            message: 'Registration submitted! Your account is pending approval.'
        });
    } catch (err) {
        console.error('Supplier registration error:', err);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET /api/register - Check registration status
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

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({
                success: true,
                isSupplier: false,
                isLoggedIn: false,
            });
        }

        const { data: supplier } = await supabase
            .from('suppliers')
            .select('id, business_name, verified_at, created_at')
            .eq('user_id', user.id)
            .single();

        if (!supplier) {
            return NextResponse.json({
                success: true,
                isSupplier: false,
                isLoggedIn: true,
            });
        }

        return NextResponse.json({
            success: true,
            isSupplier: true,
            isLoggedIn: true,
            supplier: {
                id: supplier.id,
                businessName: supplier.business_name,
                verified: !!supplier.verified_at,
                createdAt: supplier.created_at,
            },
        });
    } catch (err) {
        console.error('Supplier status check error:', err);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
