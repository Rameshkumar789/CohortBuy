import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Store, Package, BarChart3, Settings, LogOut, Inbox, TrendingUp } from 'lucide-react';

async function getSupplier() {
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

    return { user, supplier };
}

export default async function SupplierDashboardPage() {
    const data = await getSupplier();

    if (!data || !data.supplier) {
        redirect('/register');
    }

    if (!data.supplier.verified_at) {
        redirect('/register'); // Show pending status
    }

    const { user, supplier } = data;

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-6 hidden lg:flex flex-col">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <Store className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-foreground">Supplier</span>
                </div>

                {/* Navigation */}
                <nav className="space-y-2 flex-1">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-500/10 text-amber-400 font-medium"
                    >
                        <TrendingUp className="w-5 h-5" />
                        Dashboard
                    </Link>
                    <Link
                        href="/catalog"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground-muted hover:bg-background-secondary hover:text-foreground transition-colors"
                    >
                        <Package className="w-5 h-5" />
                        Catalog
                    </Link>
                    <Link
                        href="/deals"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground-muted hover:bg-background-secondary hover:text-foreground transition-colors"
                    >
                        <Inbox className="w-5 h-5" />
                        Deals
                    </Link>
                    <Link
                        href="/analytics"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground-muted hover:bg-background-secondary hover:text-foreground transition-colors"
                    >
                        <BarChart3 className="w-5 h-5" />
                        Analytics
                    </Link>
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground-muted hover:bg-background-secondary hover:text-foreground transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                        Settings
                    </Link>
                </nav>

                {/* Bottom section */}
                <div className="border-t border-border pt-4 mt-4">
                    <div className="flex items-center gap-3 px-2 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-semibold">
                            {supplier.business_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                                {supplier.business_name}
                            </p>
                            <p className="text-xs text-foreground-muted truncate">
                                {user.email}
                            </p>
                        </div>
                    </div>
                    <form action="/auth/signout" method="post">
                        <button
                            type="submit"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground-muted hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 p-8">
                <h1 className="text-2xl font-bold text-foreground mb-8">
                    Welcome, {supplier.business_name}!
                </h1>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="card p-6">
                        <p className="text-foreground-muted text-sm mb-1">Products Listed</p>
                        <p className="text-3xl font-bold text-foreground">0</p>
                    </div>
                    <div className="card p-6">
                        <p className="text-foreground-muted text-sm mb-1">Pending Deals</p>
                        <p className="text-3xl font-bold text-amber-400">0</p>
                    </div>
                    <div className="card p-6">
                        <p className="text-foreground-muted text-sm mb-1">Active Orders</p>
                        <p className="text-3xl font-bold text-foreground">0</p>
                    </div>
                    <div className="card p-6">
                        <p className="text-foreground-muted text-sm mb-1">Total Revenue</p>
                        <p className="text-3xl font-bold text-emerald-400">$0</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card p-6 mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
                    <div className="flex gap-4">
                        <Link href="/catalog/import" className="btn-primary">
                            <Package className="w-5 h-5" />
                            Import Catalog
                        </Link>
                        <Link href="/settings" className="btn-secondary">
                            <Settings className="w-5 h-5" />
                            Configure Agent
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
                    <div className="text-center py-12 text-foreground-muted">
                        No recent activity. Import your catalog to start receiving deal requests.
                    </div>
                </div>
            </main>
        </div>
    );
}
