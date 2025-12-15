'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, Building2, Globe, FileText, Loader2, CheckCircle, Mail, Lock, ArrowRight } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function SupplierRegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSupplier, setIsSupplier] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    // Step tracking for non-logged-in users
    const [step, setStep] = useState<'signup' | 'check-email'>('signup');

    // Auth fields (Step 1)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Business fields (Step 2 - after login)
    const [businessName, setBusinessName] = useState('');
    const [businessType, setBusinessType] = useState('');
    const [website, setWebsite] = useState('');
    const [taxId, setTaxId] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await fetch('/api/register');
                const data = await response.json();

                setIsLoggedIn(data.isLoggedIn);
                setIsSupplier(data.isSupplier);
                setIsVerified(data.supplier?.verified || false);

                // If verified supplier, redirect to dashboard
                if (data.supplier?.verified) {
                    router.push('/dashboard');
                }
            } catch (err) {
                console.error('Status check error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        checkStatus();
    }, [router]);

    // Handle Step 1: Create account
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsSubmitting(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setIsSubmitting(false);
            return;
        }

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) {
                setError(signUpError.message);
                setIsSubmitting(false);
                return;
            }

            // Check if email confirmation is needed
            if (data.user && (!data.session || data.user.identities?.length === 0)) {
                // Email confirmation required
                setStep('check-email');
                setIsSubmitting(false);
                return;
            }

            // No confirmation needed - sign in and refresh
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                if (signInError.message.includes('Email not confirmed')) {
                    setStep('check-email');
                    setIsSubmitting(false);
                    return;
                }
                setError(signInError.message);
                setIsSubmitting(false);
                return;
            }

            // Refresh to show business form
            setIsLoggedIn(true);
            setIsSubmitting(false);
        } catch (err) {
            console.error('Signup error:', err);
            setError('Signup failed');
            setIsSubmitting(false);
        }
    };

    // Handle Step 2: Submit business info
    const handleBusinessSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessName,
                    businessType,
                    website,
                    taxId,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setIsSupplier(true);
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('Registration failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            </div>
        );
    }

    // State: Pending supplier approval
    if (isSupplier && !isVerified) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-4">
                        Registration Submitted!
                    </h1>
                    <p className="text-foreground-muted mb-8">
                        Thank you for registering as a supplier. We'll review your application
                        and notify you via email once approved. This usually takes 1-2 business days.
                    </p>
                    <Link href="/" className="btn-secondary">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    // State: Check email for confirmation
    if (step === 'check-email') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-10 h-10 text-amber-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-4">
                        Check Your Email
                    </h1>
                    <p className="text-foreground-muted mb-4">
                        We've sent a confirmation link to:
                    </p>
                    <p className="text-amber-400 font-medium mb-6">
                        {email}
                    </p>
                    <p className="text-foreground-muted text-sm mb-8">
                        Click the link in the email to verify your account, then sign in to
                        complete your supplier registration.
                    </p>
                    <Link href="/login" className="btn-primary">
                        Go to Sign In
                    </Link>
                </div>
            </div>
        );
    }

    // State: Logged in, show business info form (Step 2)
    if (isLoggedIn && !isSupplier) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="max-w-lg w-full">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
                            <Store className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">Complete Your Registration</h1>
                        <p className="text-foreground-muted mt-2">
                            Tell us about your business to get started
                        </p>
                    </div>

                    <form onSubmit={handleBusinessSubmit} className="card p-6 space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-amber-400" />
                                Business Information
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-foreground-muted mb-2">
                                    Business Name *
                                </label>
                                <input
                                    type="text"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    placeholder="Your Company LLC"
                                    required
                                    className="input w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground-muted mb-2">
                                    Business Type
                                </label>
                                <select
                                    value={businessType}
                                    onChange={(e) => setBusinessType(e.target.value)}
                                    className="input w-full"
                                >
                                    <option value="">Select type...</option>
                                    <option value="manufacturer">Manufacturer</option>
                                    <option value="distributor">Distributor</option>
                                    <option value="wholesaler">Wholesaler</option>
                                    <option value="retailer">Retailer</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground-muted mb-2">
                                    <Globe className="w-4 h-4 inline mr-1" />
                                    Website
                                </label>
                                <input
                                    type="url"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    placeholder="https://yourcompany.com"
                                    className="input w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground-muted mb-2">
                                    <FileText className="w-4 h-4 inline mr-1" />
                                    Tax ID / EIN (optional)
                                </label>
                                <input
                                    type="text"
                                    value={taxId}
                                    onChange={(e) => setTaxId(e.target.value)}
                                    placeholder="XX-XXXXXXX"
                                    className="input w-full"
                                />
                            </div>
                        </div>

                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                required
                                className="mt-1"
                            />
                            <span className="text-sm text-foreground-muted">
                                I agree to the{' '}
                                <Link href="/terms" className="text-amber-400 hover:underline">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link href="/privacy" className="text-amber-400 hover:underline">
                                    Privacy Policy
                                </Link>
                            </span>
                        </label>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting || !agreeTerms || !businessName}
                            className="btn-primary w-full py-4 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Submit Registration'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // State: Not logged in, show signup form (Step 1)
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
                        <Store className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Become a Supplier</h1>
                    <p className="text-foreground-muted mt-2">
                        Create your account to get started
                    </p>
                </div>

                {/* Steps indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">
                            1
                        </div>
                        <span className="text-sm text-foreground">Create Account</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-foreground-muted" />
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-background-secondary text-foreground-muted flex items-center justify-center text-sm font-bold">
                            2
                        </div>
                        <span className="text-sm text-foreground-muted">Business Info</span>
                    </div>
                </div>

                <form onSubmit={handleSignup} className="card p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-2">
                                <Mail className="w-4 h-4 inline mr-1" />
                                Email Address
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
                                placeholder="At least 6 characters"
                                required
                                minLength={6}
                                className="input w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter your password"
                                required
                                className="input w-full"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || !email || !password}
                        className="btn-primary w-full py-4 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Continue
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-foreground-muted mt-6">
                    Already have an account?{' '}
                    <Link href="/login" className="text-amber-400 hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
