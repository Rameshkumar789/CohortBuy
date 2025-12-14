import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Create a Supabase admin client that bypasses RLS
function getAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
        // Fallback to anon key if service key not available (less secure)
        return createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

// Admin API to approve waitlist users and generate invite codes
// NOTE: In production, add proper admin authentication!
export async function POST(request: Request) {
    try {
        const { email, action } = await request.json();

        if (!email || !action) {
            return NextResponse.json(
                { success: false, message: 'Email and action are required' },
                { status: 400 }
            );
        }

        const supabase = getAdminClient();

        if (action === 'approve') {
            // Generate a unique invite code
            const inviteCode = `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

            // Create the invite code in database
            const { error: createError } = await supabase
                .from('invite_codes')
                .insert({
                    code: inviteCode,
                    max_uses: 1,
                    created_by: null, // System-generated, no user
                });

            if (createError) {
                console.error('Create invite error:', createError);
                return NextResponse.json(
                    { success: false, message: `Failed to create invite code: ${createError.message}` },
                    { status: 500 }
                );
            }

            // Update waitlist entry with invited timestamp and code
            const { error: updateError } = await supabase
                .from('waitlist')
                .update({
                    invited_at: new Date().toISOString(),
                    invite_code: inviteCode
                })
                .eq('email', email.toLowerCase());

            if (updateError) {
                console.error('Update waitlist error:', updateError);
                return NextResponse.json(
                    { success: false, message: `Failed to update waitlist: ${updateError.message}` },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                inviteCode,
                message: `Invite code generated: ${inviteCode}. Send this to ${email}`
            });
        }

        if (action === 'reject') {
            const { error } = await supabase
                .from('waitlist')
                .delete()
                .eq('email', email.toLowerCase());

            if (error) {
                return NextResponse.json(
                    { success: false, message: `Failed to remove: ${error.message}` },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                message: `${email} removed from waitlist`
            });
        }

        return NextResponse.json(
            { success: false, message: 'Invalid action. Use "approve" or "reject"' },
            { status: 400 }
        );
    } catch (err) {
        console.error('Admin API error:', err);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Get all waitlist entries
export async function GET() {
    try {
        const supabase = getAdminClient();

        const { data, error } = await supabase
            .from('waitlist')
            .select('id, email, created_at, invited_at, invite_code')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch waitlist error:', error);
            return NextResponse.json(
                { success: false, message: `Failed to fetch: ${error.message}`, error: error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            waitlist: data || [],
            total: data?.length || 0,
            pending: data?.filter(w => !w.invited_at).length || 0,
            invited: data?.filter(w => w.invited_at).length || 0
        });
    } catch (err) {
        console.error('Admin API error:', err);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
