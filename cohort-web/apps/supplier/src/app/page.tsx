'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store, Users, Package, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';

export default function SupplierLandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSupplier, setIsSupplier] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/register');
        const data = await response.json();
        setIsLoggedIn(data.isLoggedIn);
        setIsSupplier(data.isSupplier);
        setIsVerified(data.supplier?.verified || false);
      } catch (err) {
        console.error('Status check error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Cohort Supplier</span>
          </div>
          <div className="flex items-center gap-4">
            {isSupplier && isVerified ? (
              <Link href="/dashboard" className="btn-primary">
                Go to Dashboard
              </Link>
            ) : isSupplier ? (
              <span className="text-amber-400 text-sm">Pending Approval</span>
            ) : isLoggedIn ? (
              <Link href="/register" className="btn-primary">
                Become a Supplier
              </Link>
            ) : (
              <Link href="/login" className="btn-primary">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Sell to <span className="text-amber-400">Cohorts</span> of Buyers
          </h1>
          <p className="text-xl text-foreground-muted mb-8 max-w-2xl mx-auto">
            Reach verified buyers who aggregate demand for bulk purchases.
            Move inventory faster with guaranteed volume deals.
          </p>
          {!isSupplier && (
            <Link
              href={isLoggedIn ? '/register' : '/login'}
              className="btn-primary text-lg py-4 px-8"
            >
              {isLoggedIn ? 'Register as Supplier' : 'Get Started'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-12">
            Why Sell on Cohort?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Aggregated Demand
              </h3>
              <p className="text-foreground-muted">
                Buyers pool together to create bulk orders. You get volume without the marketing spend.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Automated Negotiation
              </h3>
              <p className="text-foreground-muted">
                Set your rules once. Our AI agent handles negotiations 24/7 based on your criteria.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Easy Catalog Import
              </h3>
              <p className="text-foreground-muted">
                Upload your catalog via CSV or API. We match products automatically to existing demand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to reach more buyers?
          </h2>
          <p className="text-foreground-muted mb-8">
            Join our supplier network and start receiving deal requests today.
          </p>
          {!isSupplier && (
            <Link
              href={isLoggedIn ? '/register' : '/login'}
              className="btn-primary text-lg py-4 px-8"
            >
              {isLoggedIn ? 'Register Now' : 'Sign In to Start'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-foreground-muted">
          <span>© 2024 Cohort. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
