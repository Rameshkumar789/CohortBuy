'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function SupplierLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                setError(authError.message);
                return;
            }

            // Check if user is a verified supplier
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: supplier } = await supabase
                    .from('suppliers')
                    .select('id, verified_at')
                    .eq('user_id', user.id)
                    .single();

                if (supplier?.verified_at) {
                    router.push('/dashboard');
                } else if (supplier) {
                    router.push('/register'); // Show pending status
                } else {
                    router.push('/register'); // Not a supplier yet
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        Back to home
                    </Link>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
                        <Store className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Supplier Portal</h1>
                    <p className="text-foreground-muted mt-2">Sign in to manage your catalog and deals</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="card p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-2">
                            <Mail className="w-4 h-4 inline mr-1" />
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            required
                            className="input w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-2">
                            <Lock className="w-4 h-4 inline mr-1" />
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="input w-full"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !email || !password}
                        className="btn-primary w-full py-3 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <p className="text-center text-foreground-muted mt-6">
                    Not a supplier yet?{' '}
                    <Link href="/register" className="text-amber-400 hover:underline">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}
