'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store, ArrowLeft, Loader2, Users, Clock, DollarSign, Check, X, MessageSquare, Package } from 'lucide-react';

interface Pool {
    id: string;
    targetPriceCents: number;
    targetQuantity: number;
    currentQuantity: number;
    status: string;
    expiresAt: string;
    createdAt: string;
    product: {
        id: string;
        title: string;
        brand: string;
        description: string;
        primaryImageUrl: string;
        msrpCents: number;
    } | null;
}

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [pool, setPool] = useState<Pool | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActing, setIsActing] = useState(false);
    const [error, setError] = useState('');
    const [showCounter, setShowCounter] = useState(false);
    const [counterPrice, setCounterPrice] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const fetchDeal = async () => {
            const { id } = await params;
            try {
                const response = await fetch(`/api/deals/${id}`);
                const data = await response.json();

                if (data.success) {
                    setPool(data.pool);
                    // Set default counter price to 5% above target
                    if (data.pool) {
                        setCounterPrice(((data.pool.targetPriceCents * 1.05) / 100).toFixed(2));
                    }
                } else {
                    setError(data.message || 'Deal not found');
                }
            } catch (err) {
                console.error('Failed to fetch deal:', err);
                setError('Failed to load deal');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDeal();
    }, [params]);

    const formatPrice = (cents: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    const formatTimeRemaining = (expiresAt: string) => {
        const now = new Date();
        const expires = new Date(expiresAt);
        const diff = expires.getTime() - now.getTime();

        if (diff <= 0) return 'Expired';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days}d ${hours}h remaining`;
        return `${hours}h remaining`;
    };

    const handleAction = async (action: 'accept' | 'reject' | 'counter') => {
        if (!pool) return;
        setIsActing(true);
        setError('');

        try {
            const body: { action: string; counterPriceCents?: number } = { action };
            if (action === 'counter') {
                body.counterPriceCents = Math.round(parseFloat(counterPrice) * 100);
            }

            const response = await fetch(`/api/deals/${pool.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (data.success) {
                router.push('/deals');
            } else {
                setError(data.message || 'Action failed');
            }
        } catch (err) {
            console.error('Action error:', err);
            setError('Action failed');
        } finally {
            setIsActing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            </div>
        );
    }

    if (error && !pool) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Package className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-foreground mb-2">{error}</h2>
                    <Link href="/deals" className="text-amber-400 hover:underline">
                        Back to deals
                    </Link>
                </div>
            </div>
        );
    }

    if (!pool) return null;

    const totalValue = pool.targetPriceCents * pool.currentQuantity;
    const progressPercent = Math.min(100, (pool.currentQuantity / pool.targetQuantity) * 100);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-card border-b border-border sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/deals"
                            className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-foreground-muted" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                <Store className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-foreground">Deal Details</span>
                        </div>
                        <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${pool.status === 'NEGOTIATING'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                            {pool.status}
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Product Info */}
                    <div className="lg:col-span-2">
                        {pool.product && (
                            <div className="card overflow-hidden mb-6">
                                <div className="aspect-video bg-background-secondary relative overflow-hidden">
                                    {pool.product.primaryImageUrl ? (
                                        <img
                                            src={pool.product.primaryImageUrl}
                                            alt={pool.product.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-16 h-16 text-foreground-muted" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <p className="text-sm text-amber-400 font-medium mb-1">
                                        {pool.product.brand}
                                    </p>
                                    <h1 className="text-2xl font-bold text-foreground mb-4">
                                        {pool.product.title}
                                    </h1>
                                    <p className="text-foreground-muted">
                                        {pool.product.description}
                                    </p>

                                    <div className="mt-6 p-4 bg-background-secondary rounded-lg">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-foreground-muted">MSRP</p>
                                                <p className="font-semibold text-foreground">
                                                    {formatPrice(pool.product.msrpCents)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-foreground-muted">Buyer's Target</p>
                                                <p className="font-semibold text-amber-400">
                                                    {formatPrice(pool.targetPriceCents)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-foreground-muted">Discount Requested</p>
                                                <p className="font-semibold text-foreground">
                                                    {Math.round((1 - pool.targetPriceCents / pool.product.msrpCents) * 100)}%
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-foreground-muted">Total Order Value</p>
                                                <p className="font-semibold text-emerald-400">
                                                    {formatPrice(totalValue)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Panel */}
                    <div className="lg:col-span-1">
                        <div className="card p-6 sticky top-24">
                            {/* Pool Stats */}
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-foreground-muted flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Committed Buyers
                                    </span>
                                    <span className="font-semibold text-foreground">
                                        {pool.currentQuantity} / {pool.targetQuantity}
                                    </span>
                                </div>
                                <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-foreground-muted flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        Per Unit
                                    </span>
                                    <span className="font-semibold text-amber-400">
                                        {formatPrice(pool.targetPriceCents)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-foreground-muted flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Time Left
                                    </span>
                                    <span className="font-semibold text-foreground">
                                        {isMounted ? formatTimeRemaining(pool.expiresAt) : '...'}
                                    </span>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Actions */}
                            {pool.status === 'FORMING' && (
                                <div className="text-center text-foreground-muted py-4">
                                    Pool is still forming. Wait for target to be reached.
                                </div>
                            )}

                            {pool.status === 'NEGOTIATING' && (
                                <div className="space-y-3">
                                    {/* Accept */}
                                    <button
                                        onClick={() => handleAction('accept')}
                                        disabled={isActing}
                                        className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isActing ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Check className="w-5 h-5" />
                                                Accept @ {formatPrice(pool.targetPriceCents)}
                                            </>
                                        )}
                                    </button>

                                    {/* Counter */}
                                    {!showCounter ? (
                                        <button
                                            onClick={() => setShowCounter(true)}
                                            disabled={isActing}
                                            className="w-full py-3 rounded-lg border border-amber-500/50 text-amber-400 hover:bg-amber-500/10 font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <MessageSquare className="w-5 h-5" />
                                            Counter Offer
                                        </button>
                                    ) : (
                                        <div className="p-4 bg-background-secondary rounded-lg space-y-3">
                                            <label className="block text-sm text-foreground-muted">
                                                Your price per unit
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">$</span>
                                                <input
                                                    type="number"
                                                    value={counterPrice}
                                                    onChange={(e) => setCounterPrice(e.target.value)}
                                                    min="0"
                                                    step="0.01"
                                                    className="input w-full pl-8"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAction('counter')}
                                                    disabled={isActing}
                                                    className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors disabled:opacity-50"
                                                >
                                                    Submit
                                                </button>
                                                <button
                                                    onClick={() => setShowCounter(false)}
                                                    className="px-4 py-2 rounded-lg border border-border hover:bg-background transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Reject */}
                                    <button
                                        onClick={() => handleAction('reject')}
                                        disabled={isActing}
                                        className="w-full py-3 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <X className="w-5 h-5" />
                                        Decline
                                    </button>
                                </div>
                            )}

                            {/* Pool Info */}
                            <div className="mt-6 pt-6 border-t border-border text-sm text-foreground-muted">
                                <p>Pool created {isMounted ? new Date(pool.createdAt).toLocaleDateString() : '...'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
