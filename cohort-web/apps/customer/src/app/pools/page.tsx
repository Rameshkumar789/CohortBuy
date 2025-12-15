'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Users, Clock, TrendingUp, Loader2, Filter } from 'lucide-react';

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
        primaryImageUrl: string;
        msrpCents: number;
    } | null;
}

export default function PoolsPage() {
    const [pools, setPools] = useState<Pool[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchPools = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.set('status', statusFilter);

            const response = await fetch(`/api/pools?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                setPools(data.pools);
            }
        } catch (error) {
            console.error('Failed to fetch pools:', error);
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchPools();
    }, [fetchPools]);

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

    const getProgressPercent = (current: number, target: number) => {
        return Math.min(100, (current / target) * 100);
    };

    // Filter pools by search query
    const filteredPools = pools.filter(pool => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            pool.product?.title.toLowerCase().includes(query) ||
            pool.product?.brand.toLowerCase().includes(query)
        );
    });

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-card border-b border-border sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard" className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-foreground">Cohort</span>
                            </Link>
                            <span className="text-foreground-muted">/</span>
                            <h1 className="text-xl font-semibold text-foreground">Pools</h1>
                        </div>
                        <Link href="/products" className="text-foreground-muted hover:text-foreground transition-colors">
                            Browse Products
                        </Link>
                    </div>

                    {/* Search & Filters */}
                    <div className="flex gap-4">
                        <div className="relative flex-1 max-w-xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search pools..."
                                className="input w-full bg-background"
                                style={{ paddingLeft: '3rem' }}
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="input bg-background w-40"
                        >
                            <option value="">All Active</option>
                            <option value="FORMING">Forming</option>
                            <option value="NEGOTIATING">Negotiating</option>
                        </select>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filteredPools.length === 0 ? (
                    <div className="text-center py-20">
                        <Users className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-foreground mb-2">No pools found</h2>
                        <p className="text-foreground-muted mb-6">
                            {searchQuery ? `No results for "${searchQuery}"` : 'Be the first to start a pool!'}
                        </p>
                        <Link href="/products" className="btn-primary">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="text-foreground-muted mb-6">
                            {filteredPools.length} active pool{filteredPools.length !== 1 ? 's' : ''}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPools.map((pool) => (
                                <Link
                                    key={pool.id}
                                    href={`/pools/${pool.id}`}
                                    className="card overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 group"
                                >
                                    {/* Product Image */}
                                    <div className="aspect-video bg-background-secondary relative overflow-hidden">
                                        {pool.product?.primaryImageUrl ? (
                                            <img
                                                src={pool.product.primaryImageUrl}
                                                alt={pool.product.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Users className="w-12 h-12 text-foreground-muted" />
                                            </div>
                                        )}
                                        {/* Status Badge */}
                                        <span className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${pool.status === 'FORMING'
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-amber-500/20 text-amber-400'
                                            }`}>
                                            {pool.status === 'FORMING' ? '🔥 Forming' : '🤝 Negotiating'}
                                        </span>
                                    </div>

                                    {/* Pool Info */}
                                    <div className="p-4">
                                        {pool.product && (
                                            <>
                                                <p className="text-sm text-primary font-medium mb-1">{pool.product.brand}</p>
                                                <h3 className="font-semibold text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                                                    {pool.product.title}
                                                </h3>
                                            </>
                                        )}

                                        {/* Target Price */}
                                        <div className="flex items-baseline gap-2 mb-4">
                                            <span className="text-2xl font-bold text-primary">
                                                {formatPrice(pool.targetPriceCents)}
                                            </span>
                                            {pool.product && pool.product.msrpCents > pool.targetPriceCents && (
                                                <span className="text-sm text-foreground-muted line-through">
                                                    {formatPrice(pool.product.msrpCents)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Progress */}
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="text-foreground-muted">
                                                    <Users className="w-4 h-4 inline mr-1" />
                                                    {pool.currentQuantity} / {pool.targetQuantity}
                                                </span>
                                                <span className="text-foreground-muted flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {isMounted ? formatTimeRemaining(pool.expiresAt) : '...'}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all"
                                                    style={{ width: `${getProgressPercent(pool.currentQuantity, pool.targetQuantity)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
