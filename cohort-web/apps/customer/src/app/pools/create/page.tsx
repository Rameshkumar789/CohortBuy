'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Search, Loader2, ShoppingBag, Calendar } from 'lucide-react';

interface Product {
    id: string;
    title: string;
    brand: string;
    primaryImageUrl: string;
    msrpCents: number;
    referencePriceCents: number;
}

function CreatePoolForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productIdFromUrl = searchParams.get('product');

    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState('');

    // Form fields
    const [targetPrice, setTargetPrice] = useState('');
    const [targetQuantity, setTargetQuantity] = useState('10');
    const [expiresInDays, setExpiresInDays] = useState('7');

    // Load product from URL if provided
    useEffect(() => {
        if (productIdFromUrl) {
            const fetchProduct = async () => {
                try {
                    const response = await fetch(`/api/catalog/${productIdFromUrl}`);
                    const data = await response.json();
                    if (data.success) {
                        const product: Product = {
                            id: data.product.id,
                            title: data.product.title,
                            brand: data.product.brand,
                            primaryImageUrl: data.product.primaryImageUrl,
                            msrpCents: data.product.msrpCents,
                            referencePriceCents: data.product.referencePriceCents,
                        };
                        setSelectedProduct(product);
                        // Set default target price to 20% off reference price
                        const suggestedPrice = Math.round((product.referencePriceCents || product.msrpCents) * 0.8);
                        setTargetPrice((suggestedPrice / 100).toFixed(2));
                    }
                } catch (err) {
                    console.error('Failed to fetch product:', err);
                }
            };
            fetchProduct();
        }
    }, [productIdFromUrl]);

    // Search products
    useEffect(() => {
        if (searchQuery.length < 2) {
            setProducts([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await fetch(`/api/catalog?q=${encodeURIComponent(searchQuery)}&limit=5`);
                const data = await response.json();
                if (data.success) {
                    setProducts(data.products);
                }
            } catch (err) {
                console.error('Search failed:', err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const formatPrice = (cents: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
        setSearchQuery('');
        setProducts([]);
        // Set default target price
        const suggestedPrice = Math.round((product.referencePriceCents || product.msrpCents) * 0.8);
        setTargetPrice((suggestedPrice / 100).toFixed(2));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submit clicked', { selectedProduct, targetPrice, targetQuantity });
        if (!selectedProduct) {
            console.log('No product selected');
            return;
        }

        setIsCreating(true);
        setError('');

        const payload = {
            parentProductId: selectedProduct.id,
            targetPriceCents: Math.round(parseFloat(targetPrice) * 100),
            targetQuantity: parseInt(targetQuantity),
            expiresInDays: parseInt(expiresInDays),
        };
        console.log('Creating pool with payload:', payload);

        try {
            const response = await fetch('/api/pools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
                router.push(`/pools/${data.pool.id}`);
            } else {
                setError(data.message || 'Failed to create pool');
            }
        } catch (err) {
            console.error('Create pool error:', err);
            setError('Failed to create pool');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-card border-b border-border sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-6 py-4">
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
                        <span className="text-foreground-muted">/</span>
                        <h1 className="text-lg font-semibold text-foreground">Create Pool</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Product Selection */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Select Product</h2>

                        {selectedProduct ? (
                            <div className="flex gap-4 p-4 bg-background-secondary rounded-lg">
                                <div className="w-20 h-20 rounded-lg overflow-hidden bg-background flex-shrink-0">
                                    {selectedProduct.primaryImageUrl ? (
                                        <img
                                            src={selectedProduct.primaryImageUrl}
                                            alt={selectedProduct.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ShoppingBag className="w-8 h-8 text-foreground-muted" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-primary font-medium">{selectedProduct.brand}</p>
                                    <p className="font-semibold text-foreground line-clamp-2">{selectedProduct.title}</p>
                                    <p className="text-sm text-foreground-muted mt-1">
                                        MSRP: {formatPrice(selectedProduct.msrpCents)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedProduct(null)}
                                    className="text-foreground-muted hover:text-foreground text-sm"
                                >
                                    Change
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for a product..."
                                    className="input w-full"
                                    style={{ paddingLeft: '3rem' }}
                                />

                                {/* Search Results */}
                                {(products.length > 0 || isSearching) && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-20 max-h-80 overflow-y-auto">
                                        {isSearching ? (
                                            <div className="p-4 text-center">
                                                <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
                                            </div>
                                        ) : (
                                            products.map((product) => (
                                                <button
                                                    key={product.id}
                                                    type="button"
                                                    onClick={() => handleSelectProduct(product)}
                                                    className="w-full flex gap-3 p-3 hover:bg-background-secondary transition-colors text-left"
                                                >
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-background-secondary flex-shrink-0">
                                                        {product.primaryImageUrl ? (
                                                            <img
                                                                src={product.primaryImageUrl}
                                                                alt={product.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <ShoppingBag className="w-5 h-5 text-foreground-muted" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-primary font-medium">{product.brand}</p>
                                                        <p className="text-sm text-foreground line-clamp-1">{product.title}</p>
                                                    </div>
                                                    <p className="text-sm text-foreground-muted">
                                                        {formatPrice(product.msrpCents)}
                                                    </p>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pool Settings */}
                    {selectedProduct && (
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4">Pool Settings</h2>

                            <div className="space-y-4">
                                {/* Target Price */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground-muted mb-2">
                                        Target Price per Unit
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">$</span>
                                        <input
                                            type="number"
                                            value={targetPrice}
                                            onChange={(e) => setTargetPrice(e.target.value)}
                                            min="1"
                                            step="0.01"
                                            required
                                            className="input w-full"
                                            style={{ paddingLeft: '2rem' }}
                                        />
                                    </div>
                                    <p className="text-sm text-foreground-muted mt-1">
                                        Suggested: 20% off = {formatPrice((selectedProduct.referencePriceCents || selectedProduct.msrpCents) * 0.8)}
                                    </p>
                                </div>

                                {/* Info about pool mechanics */}
                                <div className="p-4 bg-background rounded-lg border border-border">
                                    <p className="text-sm text-foreground-muted">
                                        <strong>How it works:</strong> Once enough buyers join your pool,
                                        we'll negotiate with the supplier to get you the target price.
                                    </p>
                                </div>

                                {/* Expiration */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground-muted mb-2">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        Pool Duration
                                    </label>
                                    <select
                                        value={expiresInDays}
                                        onChange={(e) => setExpiresInDays(e.target.value)}
                                        className="input w-full"
                                    >
                                        <option value="3">3 days</option>
                                        <option value="7">7 days</option>
                                        <option value="14">14 days</option>
                                        <option value="30">30 days</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    {selectedProduct && (
                        <button
                            type="submit"
                            disabled={isCreating || !targetPrice || !targetQuantity}
                            className="btn-primary w-full py-4 text-lg disabled:opacity-50"
                        >
                            {isCreating ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Users className="w-5 h-5" />
                                    Create Pool
                                </>
                            )}
                        </button>
                    )}
                </form>
            </main>
        </div>
    );
}

export default function CreatePoolPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <CreatePoolForm />
        </Suspense>
    );
}
