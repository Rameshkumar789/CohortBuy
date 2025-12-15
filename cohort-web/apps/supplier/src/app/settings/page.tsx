'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store, Settings, ArrowLeft, Loader2, Save, Bot } from 'lucide-react';

interface AgentConfig {
    mode: 'AUTO' | 'SEMI-AUTO' | 'MANUAL';
    min_order_qty: number;
    min_margin_pct: number;
    max_discount_pct: number;
    escalation_threshold_cents: number;
    response_sla_hours: number;
}

export default function SupplierSettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [config, setConfig] = useState<AgentConfig>({
        mode: 'MANUAL',
        min_order_qty: 10,
        min_margin_pct: 15,
        max_discount_pct: 25,
        escalation_threshold_cents: 5000000,
        response_sla_hours: 24,
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('/api/config');
                const data = await response.json();
                if (data.success && data.config) {
                    setConfig(data.config);
                }
            } catch (err) {
                console.error('Config fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Settings saved successfully');
            } else {
                setError(data.message || 'Failed to save settings');
            }
        } catch (err) {
            console.error('Save error:', err);
            setError('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

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
            <header className="bg-card border-b border-border sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-6 py-4">
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
                            <span className="text-xl font-bold text-foreground">Settings</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Agent Mode */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Bot className="w-5 h-5 text-amber-400" />
                            Negotiation Agent
                        </h2>
                        <p className="text-foreground-muted mb-4">
                            Choose how your agent handles incoming deal requests.
                        </p>

                        <div className="grid md:grid-cols-3 gap-4">
                            {(['AUTO', 'SEMI-AUTO', 'MANUAL'] as const).map((mode) => (
                                <label
                                    key={mode}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${config.mode === mode
                                            ? 'border-amber-500 bg-amber-500/10'
                                            : 'border-border hover:border-foreground-muted'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="mode"
                                        value={mode}
                                        checked={config.mode === mode}
                                        onChange={() => setConfig({ ...config, mode })}
                                        className="hidden"
                                    />
                                    <p className="font-semibold text-foreground mb-1">{mode}</p>
                                    <p className="text-xs text-foreground-muted">
                                        {mode === 'AUTO' && 'AI handles everything per rules'}
                                        {mode === 'SEMI-AUTO' && 'AI handles within thresholds'}
                                        {mode === 'MANUAL' && 'All offers require approval'}
                                    </p>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Auto-Accept Rules */}
                    {config.mode !== 'MANUAL' && (
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-amber-400" />
                                Auto-Accept Rules
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground-muted mb-2">
                                        Minimum Order Quantity
                                    </label>
                                    <input
                                        type="number"
                                        value={config.min_order_qty}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            min_order_qty: parseInt(e.target.value) || 0
                                        })}
                                        min="1"
                                        className="input w-full"
                                    />
                                    <p className="text-xs text-foreground-muted mt-1">
                                        Auto-accept deals with at least this many units
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground-muted mb-2">
                                        Minimum Margin (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={config.min_margin_pct}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            min_margin_pct: parseInt(e.target.value) || 0
                                        })}
                                        min="0"
                                        max="100"
                                        className="input w-full"
                                    />
                                    <p className="text-xs text-foreground-muted mt-1">
                                        Only accept if profit margin is at least this percentage
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground-muted mb-2">
                                        Maximum Discount from MSRP (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={config.max_discount_pct}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            max_discount_pct: parseInt(e.target.value) || 0
                                        })}
                                        min="0"
                                        max="100"
                                        className="input w-full"
                                    />
                                    <p className="text-xs text-foreground-muted mt-1">
                                        Reject deals requesting more than this discount
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Escalation Settings */}
                    {config.mode === 'SEMI-AUTO' && (
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4">
                                Escalation Threshold
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-foreground-muted mb-2">
                                    Escalate orders above ($)
                                </label>
                                <input
                                    type="number"
                                    value={config.escalation_threshold_cents / 100}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        escalation_threshold_cents: Math.round(parseFloat(e.target.value) * 100) || 0
                                    })}
                                    min="0"
                                    step="100"
                                    className="input w-full"
                                />
                                <p className="text-xs text-foreground-muted mt-1">
                                    Orders above this value require your manual approval
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Response SLA */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">
                            Response Time
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-2">
                                Response SLA (hours)
                            </label>
                            <input
                                type="number"
                                value={config.response_sla_hours}
                                onChange={(e) => setConfig({
                                    ...config,
                                    response_sla_hours: parseInt(e.target.value) || 24
                                })}
                                min="1"
                                max="168"
                                className="input w-full"
                            />
                            <p className="text-xs text-foreground-muted mt-1">
                                Deals expire if not responded within this time
                            </p>
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                            {success}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="btn-primary w-full py-4 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Settings
                            </>
                        )}
                    </button>
                </form>
            </main>
        </div>
    );
}
