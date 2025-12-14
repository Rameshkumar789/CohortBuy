import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// API to mark an invite code as used after successful signup
export async function POST(request: Request) {
    try {
        const { code } = await request.json();

        if (!code || typeof code !== 'string') {
            return NextResponse.json(
                { success: false, message: 'Invite code is required' },
                { status: 400 }
            );
        }

        // Use service role to bypass RLS
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );

        // Increment used_count for this invite code
        const { error } = await supabase.rpc('increment_invite_used_count', {
            invite_code: code.toUpperCase()
        });

        // If RPC doesn't exist, try direct update
        if (error && error.message.includes('function')) {
            const { error: updateError } = await supabase
                .from('invite_codes')
                .update({ used_count: 1 })
                .eq('code', code.toUpperCase())
                .eq('used_count', 0); // Only update if not already used

            if (updateError) {
                console.error('Failed to mark invite as used:', updateError);
            }
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Use invite error:', err);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
