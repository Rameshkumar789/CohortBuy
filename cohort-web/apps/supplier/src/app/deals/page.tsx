import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Store, Inbox, ArrowLeft, Clock, Users, DollarSign } from 'lucide-react';

async function getSupplierDeals() {
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
        .select('id, verified_at')
        .eq('user_id', user.id)
        .single();

    if (!supplier || !supplier.verified_at) return null;

    // Get pools that have products this supplier sells
    // For MVP, we'll show all active pools as potential deals
    const { data: pools } = await supabase
        .from('pools')
        .select(`
            id,
            target_price_cents,
            target_quantity,
            current_quantity,
            status,
            expires_at,
            created_at,
            global_catalog (
                id,
                title,
                brand,
                primary_image_url
            )
        `)
        .in('status', ['FORMING', 'NEGOTIATING'])
        .order('current_quantity', { ascending: false });

    return { supplier, pools: pools || [] };
}

export default async function SupplierDealsPage() {
    const data = await getSupplierDeals();

    if (!data) {
        redirect('/login');
    }

    const { pools } = data;

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

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-card border-b border-border sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4">
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
                            <span className="text-xl font-bold text-foreground">Deals</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    <div className="card p-4">
                        <p className="text-foreground-muted text-sm">Active Pools</p>
                        <p className="text-2xl font-bold text-foreground">{pools.length}</p>
                    </div>
                    <div className="card p-4">
                        <p className="text-foreground-muted text-sm">Awaiting Response</p>
                        <p className="text-2xl font-bold text-amber-400">
                            {pools.filter((p: { status: string }) => p.status === 'NEGOTIATING').length}
                        </p>
                    </div>
                    <div className="card p-4">
                        <p className="text-foreground-muted text-sm">Forming Pools</p>
                        <p className="text-2xl font-bold text-foreground">
                            {pools.filter((p: { status: string }) => p.status === 'FORMING').length}
                        </p>
                    </div>
                </div>

                {/* Deals List */}
                {pools.length === 0 ? (
                    <div className="card p-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-background-secondary flex items-center justify-center mx-auto mb-4">
                            <Inbox className="w-10 h-10 text-foreground-muted" />
                        </div>
                        <h2 className="text-xl font-semibold text-foreground mb-2">
                            No deals yet
                        </h2>
                        <p className="text-foreground-muted">
                            When buyers create pools for your products, they'll appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pools.map((pool: {
                            id: string;
                            target_price_cents: number;
                            target_quantity: number;
                            current_quantity: number;
                            status: string;
                            expires_at: string;
                            global_catalog: {
                                id: string;
                                title: string;
                                brand: string;
                                primary_image_url: string;
                            } | null;
                        }) => {
                            const product = pool.global_catalog;
                            return (
                                <Link
                                    key={pool.id}
                                    href={`/deals/${pool.id}`}
                                    className="card p-6 flex items-center gap-6 hover:border-amber-500/50 transition-colors"
                                >
                                    <div className="w-20 h-20 rounded-lg bg-background-secondary overflow-hidden flex-shrink-0">
                                        {product?.primary_image_url ? (
                                            <img
                                                src={product.primary_image_url}
                                                alt={product.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Inbox className="w-8 h-8 text-foreground-muted" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${pool.status === 'NEGOTIATING'
                                                    ? 'bg-amber-500/20 text-amber-400'
                                                    : 'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                {pool.status}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-foreground truncate">
                                            {product?.title || 'Unknown Product'}
                                        </h3>
                                        <p className="text-sm text-foreground-muted">
                                            {product?.brand}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm">
                                        <div className="text-center">
                                            <p className="text-foreground-muted flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                Buyers
                                            </p>
                                            <p className="font-semibold text-foreground">
                                                {pool.current_quantity}/{pool.target_quantity}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-foreground-muted flex items-center gap-1">
                                                <DollarSign className="w-4 h-4" />
                                                Target
                                            </p>
                                            <p className="font-semibold text-foreground">
                                                {formatPrice(pool.target_price_cents)}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-foreground-muted flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                Expires
                                            </p>
                                            <p className="font-semibold text-foreground">
                                                {formatTimeRemaining(pool.expires_at)}
                                            </p>
                                        </div>
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
