import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface InviteCode {
    code: string;
    max_uses: number;
    used_count: number;
    expires_at: string | null;
}

export async function POST(request: Request) {
    try {
        const { code } = await request.json();

        if (!code || typeof code !== 'string') {
            return NextResponse.json(
                { valid: false, message: 'Invalid invite code format' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Check if the invite code exists and is valid
        const { data, error } = await supabase
            .from('invite_codes')
            .select('code, max_uses, used_count, expires_at')
            .eq('code', code.toUpperCase())
            .single();

        if (error || !data) {
            return NextResponse.json(
                { valid: false, message: 'Invite code not found' },
                { status: 404 }
            );
        }

        const inviteCode = data as InviteCode;

        // Check if the code has expired
        if (inviteCode.expires_at && new Date(inviteCode.expires_at) < new Date()) {
            return NextResponse.json(
                { valid: false, message: 'Invite code has expired' },
                { status: 400 }
            );
        }

        // Check if the code has reached max uses
        if (inviteCode.used_count >= inviteCode.max_uses) {
            return NextResponse.json(
                { valid: false, message: 'Invite code is invalid. Please check with the Team' },
                { status: 400 }
            );
        }

        return NextResponse.json({ valid: true });
    } catch {
        return NextResponse.json(
            { valid: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
