import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/config - Get supplier's agent config
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

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { data: supplier } = await supabase
            .from('suppliers')
            .select('agent_config')
            .eq('user_id', user.id)
            .single();

        if (!supplier) {
            return NextResponse.json(
                { success: false, message: 'Supplier not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            config: supplier.agent_config,
        });
    } catch (err) {
        console.error('Config fetch error:', err);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/config - Update supplier's agent config
export async function PUT(request: Request) {
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

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const config = await request.json();

        // Validate config
        if (!['AUTO', 'SEMI-AUTO', 'MANUAL'].includes(config.mode)) {
            return NextResponse.json(
                { success: false, message: 'Invalid mode' },
                { status: 400 }
            );
        }

        const { error: updateError } = await supabase
            .from('suppliers')
            .update({ agent_config: config })
            .eq('user_id', user.id);

        if (updateError) {
            return NextResponse.json(
                { success: false, message: updateError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Settings saved',
        });
    } catch (err) {
        console.error('Config update error:', err);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
