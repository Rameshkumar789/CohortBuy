'use client';

import { useState } from 'react';
import { Users, Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function WaitlistPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsSubmitted(true);
            } else {
                setError(data.message || 'Something went wrong');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
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

                    {isSubmitted ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">
                                You&apos;re on the list!
                            </h1>
                            <p className="text-white/60 mb-8">
                                We&apos;ll send you an invite code when it&apos;s your turn.
                            </p>
                            <Link href="/" className="btn-secondary">
                                Back to Home
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-white mb-2">
                                Join the Waitlist
                            </h1>
                            <p className="text-white/60 mb-8">
                                Be the first to know when we open up more spots.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                                        Email address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="input pl-12 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading || !email}
                                    className="btn-primary w-full py-3.5 animate-pulse-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:animate-none"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        'Join Waitlist'
                                    )}
                                </button>
                            </form>

                            <p className="text-white/40 text-sm text-center mt-6">
                                Already have an invite code?{' '}
                                <Link href="/" className="text-indigo-400 hover:text-indigo-300 underline">
                                    Enter it here
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
