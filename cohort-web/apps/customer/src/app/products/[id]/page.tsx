'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, ShoppingBag, Loader2, Tag, Package, Clock, Zap } from 'lucide-react';

interface Variant {
    id: string;
    variantValues: Record<string, string>;
    sku: string;
    additionalPriceCents: number;
    imageUrl: string | null;
    inStock: boolean;
}

interface ActivePool {
    id: string;
    targetPriceCents: number;
    currentQuantity: number;
    targetQuantity: number;
    expiresAt: string;
}

interface Product {
    id: string;
    title: string;
    brand: string;
    manufacturer: string;
    model: string;
    description: string;
    categoryPath: string[];
    variantAxes: string[] | null;
    msrpCents: number;
    referencePriceCents: number;
    primaryImageUrl: string;
    imageUrls: string[] | null;
    attributes: Record<string, string | number | boolean>;
    variants: Variant[];
    activePools: ActivePool[];
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [variantSelections, setVariantSelections] = useState<Record<string, string>>({});

    // Set mounted state to avoid hydration issues
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const fetchProduct = async () => {
            const { id } = await params;
            try {
                const response = await fetch(`/api/catalog/${id}`);
                const data = await response.json();

                if (data.success) {
                    setProduct(data.product);
                    // Set default variant
                    if (data.product.variants.length > 0) {
                        setSelectedVariant(data.product.variants[0]);
                        setVariantSelections(data.product.variants[0].variantValues || {});
                    }
                }
            } catch (error) {
                console.error('Failed to fetch product:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [params]);

    // Update selected variant when selections change
    useEffect(() => {
        if (!product) return;

        const matchingVariant = product.variants.find(v => {
            const values = v.variantValues || {};
            return Object.entries(variantSelections).every(
                ([key, value]) => values[key] === value
            );
        });

        if (matchingVariant) {
            setSelectedVariant(matchingVariant);
        }
    }, [variantSelections, product]);

    const formatPrice = (cents: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    const getVariantOptions = (axis: string): string[] => {
        if (!product) return [];
        const options = new Set<string>();
        product.variants.forEach(v => {
            const value = v.variantValues?.[axis];
            if (value) options.add(value);
        });
        return Array.from(options);
    };

    const getCurrentPrice = () => {
        if (!product) return 0;
        const basePrice = product.referencePriceCents || product.msrpCents;
        const additionalCents = selectedVariant?.additionalPriceCents || 0;
        return basePrice + additionalCents;
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
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <ShoppingBag className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-foreground mb-2">Product not found</h2>
                    <Link href="/products" className="text-primary hover:underline">
                        Back to products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-card border-b border-border sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/products"
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
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Product Image */}
                    <div>
                        <div className="aspect-square bg-background-secondary rounded-2xl overflow-hidden">
                            {product.primaryImageUrl ? (
                                <img
                                    src={selectedVariant?.imageUrl || product.primaryImageUrl}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag className="w-24 h-24 text-foreground-muted" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        {/* Brand & Category */}
                        <div className="flex items-center gap-2 text-sm text-foreground-muted mb-2">
                            <span className="text-primary font-medium">{product.brand}</span>
                            {product.categoryPath && product.categoryPath.length > 0 && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        {product.categoryPath.join(' › ')}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl font-bold text-foreground mb-4">{product.title}</h1>

                        {/* Price */}
                        <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-3xl font-bold text-foreground">
                                {formatPrice(getCurrentPrice())}
                            </span>
                            {product.msrpCents > getCurrentPrice() && (
                                <span className="text-lg text-foreground-muted line-through">
                                    {formatPrice(product.msrpCents)}
                                </span>
                            )}
                            {product.msrpCents > getCurrentPrice() && (
                                <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                                    Save {formatPrice(product.msrpCents - getCurrentPrice())}
                                </span>
                            )}
                        </div>

                        {/* Variant Selectors */}
                        {product.variantAxes && product.variantAxes.length > 0 && (
                            <div className="space-y-4 mb-8">
                                {product.variantAxes.map((axis) => {
                                    const options = getVariantOptions(axis);
                                    if (options.length === 0) return null;

                                    return (
                                        <div key={axis}>
                                            <label className="block text-sm font-medium text-foreground-muted mb-2 capitalize">
                                                {axis.replace('_', ' ')}
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {options.map((option) => (
                                                    <button
                                                        key={option}
                                                        onClick={() => setVariantSelections(prev => ({
                                                            ...prev,
                                                            [axis]: option
                                                        }))}
                                                        className={`px-4 py-2 rounded-lg border transition-all ${variantSelections[axis] === option
                                                            ? 'border-primary bg-primary/10 text-primary font-medium'
                                                            : 'border-border text-foreground hover:border-foreground-muted'
                                                            }`}
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Stock Status */}
                        {selectedVariant && (
                            <div className="flex items-center gap-2 mb-6">
                                <Package className="w-4 h-4" />
                                {selectedVariant.inStock ? (
                                    <span className="text-emerald-400">In Stock</span>
                                ) : (
                                    <span className="text-red-400">Out of Stock</span>
                                )}
                                {selectedVariant.sku && (
                                    <span className="text-foreground-muted text-sm">• SKU: {selectedVariant.sku}</span>
                                )}
                            </div>
                        )}

                        {/* Start Pool Button */}
                        <Link
                            href={`/pools/create?product=${product.id}`}
                            className="btn-primary w-full py-4 text-lg mb-6 justify-center"
                        >
                            <Zap className="w-5 h-5" />
                            Start a Pool
                        </Link>

                        {/* Active Pools */}
                        {product.activePools.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Active Pools ({product.activePools.length})
                                </h3>
                                <div className="space-y-3">
                                    {product.activePools.map((pool) => (
                                        <div
                                            key={pool.id}
                                            className="card p-4 hover:border-primary/50 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-lg font-bold text-primary">
                                                    {formatPrice(pool.targetPriceCents)}
                                                </span>
                                                <span className="text-sm text-foreground-muted flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {isMounted ? formatTimeRemaining(pool.expiresAt) : '...'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-foreground-muted">
                                                    {pool.currentQuantity} / {pool.targetQuantity} pledged
                                                </span>
                                                <div className="w-24 h-2 bg-background-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary rounded-full"
                                                        style={{ width: `${(pool.currentQuantity / pool.targetQuantity) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className="border-t border-border pt-6">
                            <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
                            <p className="text-foreground-muted leading-relaxed">{product.description}</p>
                        </div>

                        {/* Attributes */}
                        {product.attributes && Object.keys(product.attributes).length > 0 && (
                            <div className="border-t border-border pt-6 mt-6">
                                <h3 className="text-lg font-semibold text-foreground mb-3">Specifications</h3>
                                <dl className="grid grid-cols-2 gap-4">
                                    {Object.entries(product.attributes).map(([key, value]) => (
                                        <div key={key}>
                                            <dt className="text-sm text-foreground-muted capitalize">
                                                {key.replace('_', ' ')}
                                            </dt>
                                            <dd className="font-medium text-foreground">
                                                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
