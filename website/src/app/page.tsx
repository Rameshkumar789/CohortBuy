"use client";

import { useState } from "react";
import Image from "next/image";
import { addToWaitlist } from "@/lib/supabase";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Validate email format
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await addToWaitlist(email);
      setSubmitted(true);
    } catch (err) {
      console.error("Error:", err);
      // Check for duplicate email error
      if (err instanceof Error && err.message.includes("duplicate")) {
        setError("This email is already on the waitlist!");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section id="waitlist" className="relative py-24 md:py-32 flex items-center justify-center px-6 mesh-gradient scroll-mt-8">
        <div className="relative max-w-4xl mx-auto text-center">
          {/* Company Name */}
          <h2 className="text-5xl md:text-6xl font-bold text-[var(--foreground)] mb-6">CohortBuy</h2>

          {/* Headline / Slogan */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 text-[var(--foreground)]">
            <span className="gradient-text">Wholesale, reinvented.</span>
          </h1>

          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--primary)]/15 border border-[var(--primary)]/40 text-[var(--primary)] text-base font-semibold mb-10">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse"></span>
            Coming Soon
          </div>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
            A new way to shop and sell.{" "}
            <span className="text-[var(--foreground)]">Better prices</span> for buyers.{" "}
            <span className="text-[var(--foreground)]">Guaranteed demand</span> for sellers.{" "}
            Everyone wins.
          </p>

          {/* Email Form */}
          <div className="max-w-lg mx-auto mb-8">
            {!submitted ? (
              <>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="flex-1 px-6 py-4 rounded-xl border border-[var(--primary)]/30 bg-white text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary px-8 py-4 rounded-xl font-bold whitespace-nowrap disabled:opacity-50"
                  >
                    {loading ? "Joining..." : "Join Waitlist"}
                  </button>
                </form>
                {error && (
                  <p className="mt-4 text-sm text-red-500">{error}</p>
                )}
                <p className="mt-4 text-sm text-[var(--muted)]">
                  Whether you&apos;re a buyer or a seller—we&apos;ll keep you posted.
                </p>
              </>
            ) : (
              <div className="glass-card rounded-2xl p-8">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="text-xl font-bold mb-2 text-[var(--foreground)]">You&apos;re on the list!</h3>
                <p className="text-[var(--muted)]">We&apos;ll be in touch when we launch.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="divider-glow"></div>

      {/* Why Section - Vague benefits */}
      <section className="py-24 px-6 bg-gradient-section">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[var(--primary)] font-semibold mb-3 uppercase tracking-wider text-sm">Why CohortBuy</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--foreground)]">
              Everyone Wins
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card rounded-2xl p-8 card-hover">
              <h3 className="text-xl font-bold mb-4 text-[var(--foreground)]">For Buyers</h3>
              <p className="text-[var(--muted)] leading-relaxed">
                Access prices you couldn&apos;t get on your own.
                The more people who join, the better the deal for everyone.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-8 card-hover">
              <h3 className="text-xl font-bold mb-4 text-[var(--foreground)]">For Sellers</h3>
              <p className="text-[var(--muted)] leading-relaxed">
                Reach more customers and reduce risk.
                Know your demand before you commit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We're Building Section */}
      <section className="py-24 px-6 dots-pattern">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[var(--primary)] font-semibold mb-3 uppercase tracking-wider text-sm">The Vision</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[var(--foreground)]">
                The Power of{" "}
                <span className="gradient-text">Buying Together</span>
              </h2>
              <p className="text-[var(--muted)] mb-6 leading-relaxed">
                Wholesale prices have always been locked behind massive order quantities.
                Individual buyers couldn&apos;t access them. Until now.
              </p>
              <p className="text-[var(--muted)] leading-relaxed">
                CohortBuy brings buyers together into cohorts—unlocking prices that were previously
                only available to the biggest players. Sellers get predictable demand.
                Buyers get unbeatable prices. <span className="text-[var(--foreground)]">The more join, the more everyone saves.</span>
              </p>
            </div>
            <div className="relative flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-3xl hero-gradient p-[2px] glow-strong">
                  <div className="w-full h-full rounded-3xl bg-[var(--background)] flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="text-4xl md:text-5xl font-bold gradient-text mb-4">Cohort</div>
                      <p className="text-[var(--muted)] text-lg">Wholesale, reinvented.</p>
                    </div>
                  </div>
                </div>
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 glass-card rounded-xl px-4 py-2 animate-float glow">
                  <span className="text-sm font-bold text-[var(--primary)]">SAVE</span>
                </div>
                <div className="absolute -bottom-4 -left-4 glass-card rounded-xl px-4 py-2 animate-float glow" style={{ animationDelay: "1.5s" }}>
                  <span className="text-sm font-bold text-[var(--accent)]">WIN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="divider-glow"></div>

      {/* Built By Section */}
      <section className="py-24 px-6 bg-gradient-section">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[var(--primary)] font-semibold mb-3 uppercase tracking-wider text-sm">The Team</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[var(--foreground)]">
            Built by People Who Get It
          </h2>
          <p className="text-[var(--muted)] text-lg leading-relaxed mb-12 max-w-2xl mx-auto">
            We&apos;ve spent years in the trenches—retail, logistics, and big tech.
            Now we&apos;re combining that experience to solve a problem we know firsthand.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🛒",
                title: "Retail Domain",
                desc: "Deep experience in e-commerce and retail operations. We understand the margin game.",
              },
              {
                icon: "📦",
                title: "Logistics Expertise",
                desc: "Background in supply chain and logistics management. We know how goods move.",
              },
              {
                icon: "⚡",
                title: "Big Tech Engineering",
                desc: "Built systems at scale in top tech companies. We know how to build products that work.",
              },
            ].map((item, index) => (
              <div key={index} className="glass-card rounded-2xl p-6 card-hover">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold mb-2 text-[var(--foreground)]">{item.title}</h3>
                <p className="text-sm text-[var(--muted)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-[var(--foreground)]">
              Questions?
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "When will CohortBuy launch?",
                a: "We're targeting early 2026. Join the waitlist to be notified as soon as we're ready.",
              },
              {
                q: "Who is CohortBuy for?",
                a: "Both! Buyers get access to better prices through collective purchasing. Sellers get guaranteed demand and direct access to customers.",
              },
              {
                q: "Is the waitlist free?",
                a: "Yes! Joining is free and gets you priority access when we launch.",
              },
              {
                q: "Will I get spammed?",
                a: "Never. We only send launch updates. Unsubscribe anytime.",
              },
            ].map((item, index) => (
              <div key={index} className="glass-card rounded-xl p-6">
                <h3 className="font-semibold text-[var(--foreground)] mb-2">{item.q}</h3>
                <p className="text-sm text-[var(--muted)]">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 mesh-gradient">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--foreground)]">
            Ready to Improve Your Margins?
          </h2>
          <p className="text-[var(--muted)] mb-8">
            Join the waitlist today and be first to know when we launch.
          </p>
          <a
            href="#waitlist"
            className="btn-primary px-10 py-4 rounded-xl font-bold text-lg inline-block pulse-glow"
          >
            Join the Waitlist →
          </a>
        </div>
      </section>

      {/* Footer - Simplified */}
      <footer className="py-10 px-6 border-t border-[var(--muted)]/10">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[var(--muted)] text-sm">
            © 2025 CohortBuy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
