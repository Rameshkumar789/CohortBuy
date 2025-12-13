import { createClient } from '@supabase/supabase-js';

// Credentials from environment variables (.env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to add email to waitlist
export async function addToWaitlist(email: string) {
    const { error } = await supabase
        .from('waitlist')
        .insert([{ email }]);

    if (error) {
        console.error('Error adding to waitlist:', error.message || error);
        throw new Error(error.message || 'Failed to add to waitlist');
    }

    return true;
}
