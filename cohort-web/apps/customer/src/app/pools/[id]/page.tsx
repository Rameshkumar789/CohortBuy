'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Clock, ShoppingBag, Loader2, Tag, Check, X } from 'lucide-react';

interface Product {
    id: string;
    title: string;
    brand: string;
    description: string;
    primaryImageUrl: string;
    msrpCents: number;
    referencePriceCents: number;
    categoryPath: string[];
    attributes: Record<string, unknown>;
}

interface UserPledge {
    id: string;
    amountCents: number;
    status: string;
    createdAt: string;
}

interface Pool {
    id: string;
    parentProductId: string;
    variantId: string | null;
    creatorId: string;
    targetPriceCents: number;
    targetQuantity: number;
    currentQuantity: number;
    status: string;
    expiresAt: string;
    createdAt: string;
    isCreator: boolean;
    pledgeCount: number;
    userPledge: UserPledge | null;
    product: Product | null;
}

export default function PoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [pool, setPool] = useState<Pool | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const fetchPool = async () => {
            const { id } = await params;
            try {
                const response = await fetch(`/api/pools/${id}`);
                const data = await response.json();

                if (data.success) {
                    setPool(data.pool);
                } else {
                    setError(data.message || 'Pool not found');
                }
            } catch (err) {
                console.error('Failed to fetch pool:', err);
                setError('Failed to load pool');
            } finally {
                setIsLoading(false);
            }
        };
        fetchPool();
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
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h remaining`;
        if (hours > 0) return `${hours}h ${minutes}m remaining`;
        return `${minutes}m remaining`;
    };

    const handleJoin = async () => {
        if (!pool) return;
        setIsJoining(true);
        setError('');

        try {
            const response = await fetch(`/api/pools/${pool.id}/join`, {
                method: 'POST',
            });
            const data = await response.json();

            if (data.success) {
                // Refresh pool data
                router.refresh();
                window.location.reload();
            } else {
                setError(data.message || 'Failed to join pool');
            }
        } catch (err) {
            console.error('Join error:', err);
            setError('Failed to join pool');
        } finally {
            setIsJoining(false);
        }
    };

    const handleLeave = async () => {
        if (!pool) return;
        setIsLeaving(true);
        setError('');

        try {
            const response = await fetch(`/api/pools/${pool.id}/leave`, {
                method: 'POST',
            });
            const data = await response.json();

            if (data.success) {
                // Refresh pool data
                window.location.reload();
            } else {
                setError(data.message || 'Failed to leave pool');
            }
        } catch (err) {
            console.error('Leave error:', err);
            setError('Failed to leave pool');
        } finally {
            setIsLeaving(false);
        }
    };

    const getProgressPercent = () => {
        if (!pool) return 0;
        return Math.min(100, (pool.currentQuantity / pool.targetQuantity) * 100);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error && !pool) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Users className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-foreground mb-2">{error}</h2>
                    <Link href="/pools" className="text-primary hover:underline">
                        Back to pools
                    </Link>
                </div>
            </div>
        );
    }

    if (!pool) return null;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-card border-b border-border sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/pools"
                            className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-foreground-muted" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-foreground">Cohort</span>
                        </div>
                        <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${pool.status === 'FORMING'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : pool.status === 'NEGOTIATING'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-gray-500/20 text-gray-400'
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
                                            <ShoppingBag className="w-16 h-16 text-foreground-muted" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 text-sm text-foreground-muted mb-2">
                                        <span className="text-primary font-medium">{pool.product.brand}</span>
                                        {pool.product.categoryPath && pool.product.categoryPath.length > 0 && (
                                            <>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Tag className="w-3 h-3" />
                                                    {pool.product.categoryPath.join(' › ')}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <h1 className="text-2xl font-bold text-foreground mb-4">{pool.product.title}</h1>
                                    <p className="text-foreground-muted">{pool.product.description}</p>

                                    <Link
                                        href={`/products/${pool.product.id}`}
                                        className="inline-block mt-4 text-primary hover:underline text-sm"
                                    >
                                        View product details →
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pool Status Card */}
                    <div className="lg:col-span-1">
                        <div className="card p-6 sticky top-24">
                            {/* Target Price */}
                            <div className="text-center mb-6">
                                <p className="text-sm text-foreground-muted mb-1">Target Price</p>
                                <p className="text-4xl font-bold text-primary">{formatPrice(pool.targetPriceCents)}</p>
                                {pool.product && pool.product.msrpCents > pool.targetPriceCents && (
                                    <p className="text-sm text-foreground-muted mt-1">
                                        <span className="line-through">{formatPrice(pool.product.msrpCents)}</span>
                                        <span className="text-emerald-400 ml-2">
                                            Save {formatPrice(pool.product.msrpCents - pool.targetPriceCents)}
                                        </span>
                                    </p>
                                )}
                            </div>

                            {/* Progress */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-foreground-muted flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        {pool.currentQuantity} of {pool.targetQuantity} pledged
                                    </span>
                                    <span className="font-semibold text-foreground">
                                        {Math.round(getProgressPercent())}%
                                    </span>
                                </div>
                                <div className="h-3 bg-background-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all"
                                        style={{ width: `${getProgressPercent()}%` }}
                                    />
                                </div>
                            </div>

                            {/* Time Remaining */}
                            <div className="flex items-center justify-center gap-2 text-foreground-muted mb-6 p-3 bg-background-secondary rounded-lg">
                                <Clock className="w-5 h-5" />
                                <span>{isMounted ? formatTimeRemaining(pool.expiresAt) : '...'}</span>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Action Buttons */}
                            {pool.status === 'FORMING' && (
                                <>
                                    {pool.userPledge ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                                <Check className="w-5 h-5 text-emerald-400" />
                                                <span className="text-emerald-400 font-medium">You're in this pool!</span>
                                            </div>
                                            <button
                                                onClick={handleLeave}
                                                disabled={isLeaving}
                                                className="w-full py-3 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {isLeaving ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <X className="w-5 h-5" />
                                                        Leave Pool
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleJoin}
                                            disabled={isJoining}
                                            className="btn-primary w-full py-4 text-lg disabled:opacity-50"
                                        >
                                            {isJoining ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Users className="w-5 h-5" />
                                                    Join Pool
                                                </>
                                            )}
                                        </button>
                                    )}
                                </>
                            )}

                            {pool.status !== 'FORMING' && (
                                <div className="text-center text-foreground-muted py-4">
                                    This pool is no longer accepting pledges
                                </div>
                            )}

                            {/* Pool Info */}
                            <div className="mt-6 pt-6 border-t border-border">
                                <p className="text-sm text-foreground-muted">
                                    Created {new Date(pool.createdAt).toLocaleDateString()}
                                </p>
                                {pool.isCreator && (
                                    <p className="text-sm text-primary mt-1">You created this pool</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
