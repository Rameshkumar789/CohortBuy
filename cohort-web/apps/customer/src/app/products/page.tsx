'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Filter, Loader2, ShoppingBag, Users, Tag } from 'lucide-react';

interface Product {
    id: string;
    title: string;
    brand: string;
    description: string;
    categoryPath: string[];
    msrpCents: number;
    referencePriceCents: number;
    primaryImageUrl: string;
    variantCount: number;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch products
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (debouncedQuery) params.set('q', debouncedQuery);
            if (selectedCategory) params.set('category', selectedCategory);

            const response = await fetch(`/api/catalog?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                setProducts(data.products);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedQuery, selectedCategory]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const formatPrice = (cents: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    const categories = [
        'Electronics',
        'Cameras',
        'Computers',
        'Gaming',
        'Audio',
        'Home & Garden',
    ];

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
                            <h1 className="text-xl font-semibold text-foreground">Products</h1>
                        </div>
                        <Link href="/dashboard" className="text-foreground-muted hover:text-foreground transition-colors">
                            Back to Dashboard
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products..."
                            className="input w-full bg-background"
                            style={{ paddingLeft: '3rem' }}
                        />
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-64 hidden lg:block">
                        <div className="card p-4 sticky top-32">
                            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Filters
                            </h3>

                            <div className="space-y-2">
                                <button
                                    onClick={() => setSelectedCategory('')}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === ''
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-foreground-muted hover:bg-background-secondary'
                                        }`}
                                >
                                    All Categories
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === cat
                                                ? 'bg-primary/10 text-primary font-medium'
                                                : 'text-foreground-muted hover:bg-background-secondary'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <main className="flex-1">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20">
                                <ShoppingBag className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
                                <h2 className="text-xl font-semibold text-foreground mb-2">No products found</h2>
                                <p className="text-foreground-muted">
                                    {searchQuery
                                        ? `No results for "${searchQuery}"`
                                        : 'Check back later for new products'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <p className="text-foreground-muted mb-6">
                                    {products.length} product{products.length !== 1 ? 's' : ''} found
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/products/${product.id}`}
                                            className="card overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 group"
                                        >
                                            {/* Product Image */}
                                            <div className="aspect-square bg-background-secondary relative overflow-hidden">
                                                {product.primaryImageUrl ? (
                                                    <img
                                                        src={product.primaryImageUrl}
                                                        alt={product.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <ShoppingBag className="w-16 h-16 text-foreground-muted" />
                                                    </div>
                                                )}
                                                {/* Variant Badge */}
                                                {product.variantCount > 1 && (
                                                    <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 text-white text-xs">
                                                        {product.variantCount} variants
                                                    </span>
                                                )}
                                            </div>

                                            {/* Product Info */}
                                            <div className="p-4">
                                                <p className="text-sm text-primary font-medium mb-1">{product.brand}</p>
                                                <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                                                    {product.title}
                                                </h3>

                                                {/* Price */}
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-lg font-bold text-foreground">
                                                        {formatPrice(product.referencePriceCents || product.msrpCents)}
                                                    </span>
                                                    {product.referencePriceCents && product.referencePriceCents < product.msrpCents && (
                                                        <span className="text-sm text-foreground-muted line-through">
                                                            {formatPrice(product.msrpCents)}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Category */}
                                                {product.categoryPath && product.categoryPath.length > 0 && (
                                                    <div className="mt-3 flex items-center gap-1 text-xs text-foreground-muted">
                                                        <Tag className="w-3 h-3" />
                                                        {product.categoryPath.join(' › ')}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
