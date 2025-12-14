'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Zap, Shield, TrendingDown, ArrowRight, Loader2 } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/validate-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode.toUpperCase() }),
      });

      const data = await response.json();

      if (data.valid) {
        sessionStorage.setItem('inviteCode', inviteCode.toUpperCase());
        router.push('/login?mode=signup');
      } else {
        setError(data.message || 'Invalid invite code');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-gradient">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Cohort</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-white/70 hover:text-white transition-colors">How it Works</a>
            <a href="#features" className="text-white/70 hover:text-white transition-colors">Features</a>
            <a href="/login" className="text-white/70 hover:text-white transition-colors">Sign In</a>
            <a href="#early-access" className="btn-primary text-sm py-2">Get Early Access</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-sm text-white/80">Now accepting early access requests</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Join the{' '}
            <span className="gradient-text">Cohort</span>
            <br />
            Unlock Wholesale Prices
          </h1>

          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12">
            Pool your buying power with others. Our AI agents negotiate bulk deals with suppliers,
            saving you <span className="text-emerald-400 font-semibold">20-40%</span> on premium products.
          </p>

          {/* Invite Code Form */}
          <div id="early-access" className="max-w-md mx-auto mb-16">
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Enter invite code"
                  className="input text-center text-lg tracking-widest uppercase bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  maxLength={20}
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading || !inviteCode}
                className="btn-primary w-full text-lg py-4 animate-pulse-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:animate-none"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Join Cohort
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <p className="text-white/40 text-sm text-center mt-4">
              Don&apos;t have an invite code?{' '}
              <a href="/waitlist" className="text-indigo-400 hover:text-indigo-300 underline">
                Join the waitlist
              </a>
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">$2.3M+</div>
              <div className="text-white/50 text-sm">Saved by Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">15K+</div>
              <div className="text-white/50 text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">89%</div>
              <div className="text-white/50 text-sm">Pool Success Rate</div>
            </div>
          </div>
        </div>
      </main>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 bg-black/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            How Cohort Works
          </h2>
          <p className="text-white/60 text-center max-w-2xl mx-auto mb-16">
            Three simple steps to unlock prices you never thought possible
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 bg-white/5 border-white/10 animate-float" style={{ animationDelay: '0s' }}>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="text-indigo-400 font-semibold mb-2">Step 1</div>
              <h3 className="text-xl font-bold text-white mb-3">Join a Pool</h3>
              <p className="text-white/60">
                Find a product you want and join a pool of buyers. Your payment is only authorized, never charged until the deal goes through.
              </p>
            </div>

            <div className="card p-8 bg-white/5 border-white/10 animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-purple-400 font-semibold mb-2">Step 2</div>
              <h3 className="text-xl font-bold text-white mb-3">AI Negotiates</h3>
              <p className="text-white/60">
                When the pool fills, our AI agents contact verified suppliers and negotiate the best wholesale price for your cohort.
              </p>
            </div>

            <div className="card p-8 bg-white/5 border-white/10 animate-float" style={{ animationDelay: '1s' }}>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6">
                <TrendingDown className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="text-emerald-400 font-semibold mb-2">Step 3</div>
              <h3 className="text-xl font-bold text-white mb-3">Save Big</h3>
              <p className="text-white/60">
                Once a deal is locked, your payment is captured and the product ships directly to you—at wholesale prices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            Why Choose Cohort
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-8 bg-white/5 border-white/10">
              <Shield className="w-10 h-10 text-indigo-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Zero Risk</h3>
              <p className="text-white/60">
                Your card is only authorized, never charged until the pool succeeds. If the pool doesn&apos;t fill, you pay nothing.
              </p>
            </div>

            <div className="card p-8 bg-white/5 border-white/10">
              <Users className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Verified Suppliers</h3>
              <p className="text-white/60">
                Every supplier on our platform is vetted and verified. Authentic products, warranty included.
              </p>
            </div>

            <div className="card p-8 bg-white/5 border-white/10">
              <Zap className="w-10 h-10 text-amber-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">AI-Powered Deals</h3>
              <p className="text-white/60">
                Our agents work 24/7 to find and negotiate the best possible prices for your cohort.
              </p>
            </div>

            <div className="card p-8 bg-white/5 border-white/10">
              <TrendingDown className="w-10 h-10 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Real Savings</h3>
              <p className="text-white/60">
                Average savings of 25% compared to retail. Some members save even more on high-demand products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Cohort</span>
          </div>
          <p className="text-white/40 text-sm">
            © 2024 Cohort. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
