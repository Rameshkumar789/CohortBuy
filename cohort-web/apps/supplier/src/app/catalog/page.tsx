import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Store, Package, Plus, Upload, Search, ArrowLeft } from 'lucide-react';

async function getSupplierWithCatalog() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: supplier } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (!supplier || !supplier.verified_at) return null;

    // Get supplier's catalog items
    const { data: catalogItems } = await supabase
        .from('supplier_catalog')
        .select(`
            id,
            supplier_sku,
            price,
            wholesale_price,
            inventory_count,
            is_active,
            product_variants (
                id,
                variant_values,
                global_catalog (
                    id,
                    title,
                    brand,
                    primary_image_url
                )
            )
        `)
        .eq('supplier_id', supplier.id)
        .order('created_at', { ascending: false });

    return { supplier, catalogItems: catalogItems || [] };
}

export default async function SupplierCatalogPage() {
    const data = await getSupplierWithCatalog();

    if (!data) {
        redirect('/login');
    }

    const { supplier, catalogItems } = data;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-card border-b border-border sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-foreground-muted" />
                            </Link>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                    <Store className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-foreground">Catalog</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/catalog/import" className="btn-primary">
                                <Upload className="w-4 h-4" />
                                Import
                            </Link>
                            <Link href="/catalog/add" className="btn-secondary">
                                <Plus className="w-4 h-4" />
                                Add Product
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                        <input
                            type="text"
                            placeholder="Search your catalog..."
                            className="input w-full pl-10"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    <div className="card p-4">
                        <p className="text-foreground-muted text-sm">Total Products</p>
                        <p className="text-2xl font-bold text-foreground">{catalogItems.length}</p>
                    </div>
                    <div className="card p-4">
                        <p className="text-foreground-muted text-sm">Active</p>
                        <p className="text-2xl font-bold text-emerald-400">
                            {catalogItems.filter((item: { is_active: boolean }) => item.is_active).length}
                        </p>
                    </div>
                    <div className="card p-4">
                        <p className="text-foreground-muted text-sm">Low Stock</p>
                        <p className="text-2xl font-bold text-amber-400">
                            {catalogItems.filter((item: { inventory_count: number }) => item.inventory_count < 10).length}
                        </p>
                    </div>
                </div>

                {/* Catalog Grid */}
                {catalogItems.length === 0 ? (
                    <div className="card p-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-background-secondary flex items-center justify-center mx-auto mb-4">
                            <Package className="w-10 h-10 text-foreground-muted" />
                        </div>
                        <h2 className="text-xl font-semibold text-foreground mb-2">
                            No products yet
                        </h2>
                        <p className="text-foreground-muted mb-6">
                            Import your catalog to start receiving deal requests from buyers.
                        </p>
                        <Link href="/catalog/import" className="btn-primary">
                            <Upload className="w-5 h-5" />
                            Import Catalog
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {catalogItems.map((item: {
                            id: string;
                            supplier_sku: string;
                            price: number;
                            inventory_count: number;
                            is_active: boolean;
                            product_variants: {
                                global_catalog: {
                                    title: string;
                                    brand: string;
                                    primary_image_url: string;
                                } | null;
                            } | null;
                        }) => {
                            const product = item.product_variants?.global_catalog;
                            return (
                                <Link
                                    key={item.id}
                                    href={`/catalog/${item.id}`}
                                    className="card p-4 hover:border-amber-500/50 transition-colors"
                                >
                                    <div className="aspect-square bg-background-secondary rounded-lg mb-3 overflow-hidden">
                                        {product?.primary_image_url ? (
                                            <img
                                                src={product.primary_image_url}
                                                alt={product.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-12 h-12 text-foreground-muted" />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-medium text-foreground truncate">
                                        {product?.title || 'Unknown Product'}
                                    </h3>
                                    <p className="text-sm text-foreground-muted mb-2">
                                        SKU: {item.supplier_sku}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-foreground">
                                            ${(item.price / 100).toFixed(2)}
                                        </span>
                                        <span className={`text-sm ${item.inventory_count < 10 ? 'text-amber-400' : 'text-foreground-muted'}`}>
                                            {item.inventory_count} in stock
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
