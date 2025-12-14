'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Users, Mail, Lock, Loader2, ArrowLeft, Chrome, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

type AuthMode = 'login' | 'signup';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [hasInviteCode, setHasInviteCode] = useState(false);

    // Check for invite code and read mode from URL on mount
    useEffect(() => {
        const inviteCode = sessionStorage.getItem('inviteCode');
        setHasInviteCode(!!inviteCode);

        const urlMode = searchParams.get('mode');
        // Only allow signup mode if user has an invite code
        if (urlMode === 'signup' && inviteCode) {
            setMode('signup');
        }
    }, [searchParams]);

    const handleEmailPasswordAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        const supabase = createClient();

        if (mode === 'signup') {
            // Sign up with email/password
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                setError(error.message);
            } else {
                // Mark invite code as used
                const inviteCode = sessionStorage.getItem('inviteCode');
                if (inviteCode && inviteCode !== 'DEMO') {
                    try {
                        await fetch('/api/use-invite', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ code: inviteCode }),
                        });
                        sessionStorage.removeItem('inviteCode');
                    } catch {
                        // Ignore - invite marking is best-effort
                    }
                }
                setMessage('Check your email to confirm your account!');
            }
        } else {
            // Sign in with email/password
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        }

        setIsLoading(false);
    };

    const handleMagicLink = async () => {
        if (!email) {
            setError('Please enter your email first');
            return;
        }

        setError('');
        setMessage('');
        setIsMagicLinkLoading(true);

        const supabase = createClient();

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage('Check your email for the magic link!');
        }

        setIsMagicLinkLoading(false);
    };

    const handleGoogleLogin = async () => {
        setError('');
        setIsGoogleLoading(true);

        const supabase = createClient();

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen animated-gradient flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to home
                </Link>

                {/* Card */}
                <div className="card p-8 bg-white/5 border-white/10 backdrop-blur-xl">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">Cohort</span>
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2">
                        {mode === 'login' ? 'Welcome back' : 'Create your account'}
                    </h1>
                    <p className="text-white/60 mb-8">
                        {mode === 'login'
                            ? 'Sign in to access your cohorts and orders'
                            : 'Join Cohort to start saving on premium products'}
                    </p>

                    {/* Google OAuth */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isGoogleLoading}
                        className="w-full flex items-center justify-center gap-3 rounded-lg px-5 py-3.5 font-semibold bg-white text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                    >
                        {isGoogleLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Chrome className="w-5 h-5" />
                                Continue with Google
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-transparent text-white/40">Or continue with email</span>
                        </div>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailPasswordAuth} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 z-10" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="input bg-white/5 border-white/20 text-white placeholder:text-white/40"
                                    style={{ paddingLeft: '3rem' }}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 z-10" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input bg-white/5 border-white/20 text-white placeholder:text-white/40"
                                    style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 z-10"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !email || !password}
                            className="btn-primary w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:animate-none"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                mode === 'login' ? 'Sign In' : 'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Toggle Mode */}
                    <p className="text-white/40 text-sm text-center mt-6">
                        {mode === 'login' ? (
                            hasInviteCode ? (
                                <>
                                    Don&apos;t have an account?{' '}
                                    <button
                                        onClick={() => setMode('signup')}
                                        className="text-indigo-400 hover:text-indigo-300 underline"
                                    >
                                        Sign up
                                    </button>
                                </>
                            ) : (
                                <>
                                    Don&apos;t have an account?{' '}
                                    <Link href="/" className="text-indigo-400 hover:text-indigo-300 underline">
                                        Get an invite code
                                    </Link>
                                </>
                            )
                        ) : (
                            <>
                                Already have an account?{' '}
                                <button
                                    onClick={() => setMode('login')}
                                    className="text-indigo-400 hover:text-indigo-300 underline"
                                >
                                    Sign in
                                </button>
                            </>
                        )}
                    </p>

                    <p className="text-white/30 text-xs text-center mt-4">
                        By signing in, you agree to our{' '}
                        <a href="/terms" className="underline">Terms</a> and{' '}
                        <a href="/privacy" className="underline">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
