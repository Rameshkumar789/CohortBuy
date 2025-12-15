import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/supabase/server';
import { Users, Package, ShoppingCart, Settings, LogOut, Search, Bell, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { UserPoolsSection, HotPoolsSection } from '@/components/DashboardPools';

export default async function DashboardPage() {
    const data = await getUserProfile();

    if (!data) {
        redirect('/login');
    }

    const { user, profile } = data;

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-6 hidden lg:flex flex-col">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-foreground">Cohort</span>
                </div>

                {/* Navigation */}
                <nav className="space-y-2 flex-1">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium"
                    >
                        <TrendingUp className="w-5 h-5" />
                        Dashboard
                    </Link>
                    <Link
                        href="/pools"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground-muted hover:bg-background-secondary hover:text-foreground transition-colors"
                    >
                        <Users className="w-5 h-5" />
                        Pools
                    </Link>
                    <Link
                        href="/products"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground-muted hover:bg-background-secondary hover:text-foreground transition-colors"
                    >
                        <Package className="w-5 h-5" />
                        Products
                    </Link>
                    <Link
                        href="/orders"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground-muted hover:bg-background-secondary hover:text-foreground transition-colors"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        Orders
                    </Link>
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground-muted hover:bg-background-secondary hover:text-foreground transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                        Settings
                    </Link>
                </nav>

                {/* Bottom section - User info and Logout */}
                <div className="border-t border-border pt-4 mt-4">
                    <div className="flex items-center gap-3 px-2 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                                {user.email}
                            </p>
                            <p className="text-xs text-foreground-muted capitalize">
                                {(profile as { role?: string })?.role || 'Customer'}
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
            <main className="lg:ml-64">
                {/* Header */}
                <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                                <input
                                    type="text"
                                    placeholder="Search products, pools..."
                                    className="input pl-10 w-80 bg-background-secondary border-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 rounded-lg text-foreground-muted hover:bg-background-secondary transition-colors">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <Link href="/settings" className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold hover:opacity-90 transition-opacity">
                                {user.email?.charAt(0).toUpperCase()}
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="p-6 lg:p-8">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-foreground mb-2">
                            Welcome back!
                        </h1>
                        <p className="text-foreground-muted">
                            Here&apos;s what&apos;s happening with your cohorts today.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-indigo-400" />
                                </div>
                                <span className="text-sm font-medium text-emerald-400">+2</span>
                            </div>
                            <div className="text-2xl font-bold text-foreground mb-1">0</div>
                            <div className="text-sm text-foreground-muted">Active Pools</div>
                        </div>

                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                                </div>
                                <span className="text-sm font-medium text-emerald-400">$0</span>
                            </div>
                            <div className="text-2xl font-bold text-foreground mb-1">$0.00</div>
                            <div className="text-sm text-foreground-muted">Total Saved</div>
                        </div>

                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                    <ShoppingCart className="w-6 h-6 text-purple-400" />
                                </div>
                                <span className="text-sm font-medium text-foreground-muted">0 pending</span>
                            </div>
                            <div className="text-2xl font-bold text-foreground mb-1">0</div>
                            <div className="text-sm text-foreground-muted">Total Orders</div>
                        </div>
                    </div>

                    {/* Active Pools Section */}
                    <div className="card p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-foreground">My Active Pools</h2>
                            <Link href="/pools" className="text-sm text-primary hover:text-primary-hover font-medium">
                                View all →
                            </Link>
                        </div>

                        <UserPoolsSection />
                    </div>

                    {/* Trending Pools Section */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-foreground">🔥 Hot Pools</h2>
                            <Link href="/pools" className="text-sm text-primary hover:text-primary-hover font-medium">
                                Browse all →
                            </Link>
                        </div>

                        <HotPoolsSection />
                    </div>
                </div>
            </main>
        </div>
    );
}
