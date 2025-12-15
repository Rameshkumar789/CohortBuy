'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Clock, Loader2 } from 'lucide-react';

interface UserPool {
    pledgeId: string;
    amountCents: number;
    pledgeStatus: string;
    pool: {
        id: string;
        targetPriceCents: number;
        targetQuantity: number;
        currentQuantity: number;
        status: string;
        expiresAt: string;
    } | null;
    product: {
        id: string;
        title: string;
        brand: string;
        primaryImageUrl: string;
    } | null;
}

interface HotPool {
    id: string;
    targetPriceCents: number;
    targetQuantity: number;
    currentQuantity: number;
    expiresAt: string;
    product: {
        id: string;
        title: string;
        brand: string;
        primaryImageUrl: string;
        msrpCents: number;
    } | null;
}

export function UserPoolsSection() {
    const [pools, setPools] = useState<UserPool[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const fetchPools = async () => {
            try {
                const response = await fetch('/api/user/pools');
                const data = await response.json();
                if (data.success) {
                    setPools(data.pools);
                }
            } catch (error) {
                console.error('Failed to fetch user pools:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPools();
    }, []);

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

        if (days > 0) return `${days}d ${hours}h left`;
        return `${hours}h left`;
    };

    if (isLoading) {
        return (
            <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            </div>
        );
    }

    if (pools.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-background-secondary flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-foreground-muted" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No active pools</h3>
                <p className="text-foreground-muted mb-6">
                    Join a pool to start saving on premium products.
                </p>
                <Link href="/products" className="btn-primary">
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {pools.map((item) => (
                <Link
                    key={item.pledgeId}
                    href={`/pools/${item.pool?.id}`}
                    className="flex items-center gap-4 p-4 bg-background-secondary rounded-lg hover:bg-background-secondary/80 transition-colors"
                >
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-background flex-shrink-0">
                        {item.product?.primaryImageUrl ? (
                            <img
                                src={item.product.primaryImageUrl}
                                alt={item.product.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Users className="w-6 h-6 text-foreground-muted" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                            {item.product?.title}
                        </p>
                        <p className="text-sm text-foreground-muted">
                            {item.pool?.currentQuantity} / {item.pool?.targetQuantity} pledged
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-primary">
                            {item.pool ? formatPrice(item.pool.targetPriceCents) : '-'}
                        </p>
                        <p className="text-xs text-foreground-muted flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3" />
                            {isMounted && item.pool ? formatTimeRemaining(item.pool.expiresAt) : '...'}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
}

export function HotPoolsSection() {
    const [pools, setPools] = useState<HotPool[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const fetchPools = async () => {
            try {
                // Get pools sorted by current_quantity (most popular)
                const response = await fetch('/api/pools?limit=5');
                const data = await response.json();
                if (data.success) {
                    // Sort by popularity (most pledges first)
                    const sorted = [...data.pools].sort((a: HotPool, b: HotPool) =>
                        b.currentQuantity - a.currentQuantity
                    );
                    setPools(sorted.slice(0, 3));
                }
            } catch (error) {
                console.error('Failed to fetch hot pools:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPools();
    }, []);

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

        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
    };

    if (isLoading) {
        return (
            <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            </div>
        );
    }

    if (pools.length === 0) {
        return (
            <div className="text-center py-12 text-foreground-muted">
                No pools available yet. Check back soon!
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {pools.map((pool, index) => (
                <Link
                    key={pool.id}
                    href={`/pools/${pool.id}`}
                    className="flex items-center gap-4 p-4 bg-background-secondary rounded-lg hover:bg-background-secondary/80 transition-colors"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                    </div>
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-background flex-shrink-0">
                        {pool.product?.primaryImageUrl ? (
                            <img
                                src={pool.product.primaryImageUrl}
                                alt={pool.product.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-foreground-muted" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                            {pool.product?.title}
                        </p>
                        <p className="text-sm text-foreground-muted">
                            {pool.currentQuantity} / {pool.targetQuantity} • {isMounted ? formatTimeRemaining(pool.expiresAt) : '...'}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-primary">
                            {formatPrice(pool.targetPriceCents)}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
}
