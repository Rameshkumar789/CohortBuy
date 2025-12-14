'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Users, User, Mail, Lock, Save, Loader2, ArrowLeft, Eye, EyeOff, LogOut, Shield, Bell, CreditCard, Phone, MapPin, Building, Globe, Pencil } from 'lucide-react';
import Link from 'next/link';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'billing';

interface ProfileData {
    displayName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export default function SettingsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [userEmail, setUserEmail] = useState('');

    // Profile form state
    const [profile, setProfile] = useState<ProfileData>({
        displayName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
    });

    // Password form state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Load profile on mount
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await fetch('/api/profile');
                const data = await response.json();

                if (data.success) {
                    setUserEmail(data.user?.email || '');
                    if (data.profile) {
                        setProfile({
                            displayName: data.profile.display_name || '',
                            phone: data.profile.phone || '',
                            addressLine1: data.profile.address_line1 || '',
                            addressLine2: data.profile.address_line2 || '',
                            city: data.profile.city || '',
                            state: data.profile.state || '',
                            zipCode: data.profile.zip_code || '',
                            country: data.profile.country || '',
                        });
                    } else {
                        // No profile yet, start in edit mode
                        setIsEditMode(true);
                    }
                }
            } catch {
                console.error('Failed to load profile');
            } finally {
                setIsLoadingProfile(false);
            }
        };
        loadProfile();
    }, []);

    const handleProfileChange = (field: keyof ProfileData, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });

            const data = await response.json();

            if (data.success) {
                setMessage('Profile updated successfully!');
                setIsEditMode(false); // Exit edit mode after save
            } else {
                setError(data.message || 'Failed to update profile');
            }
        } catch {
            setError('Failed to update profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }

        setIsLoading(false);
    };

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const tabs = [
        { id: 'profile' as const, label: 'Profile', icon: User },
        { id: 'security' as const, label: 'Security', icon: Shield },
        { id: 'notifications' as const, label: 'Notifications', icon: Bell },
        { id: 'billing' as const, label: 'Billing', icon: CreditCard },
    ];

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

                {/* Back to Dashboard */}
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground-muted hover:bg-background-secondary hover:text-foreground transition-colors mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Dashboard
                </Link>

                {/* Settings Navigation */}
                <nav className="space-y-2 flex-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-colors ${activeTab === tab.id
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-foreground-muted hover:bg-background-secondary hover:text-foreground'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Sign Out */}
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground-muted hover:bg-red-500/10 hover:text-red-400 transition-colors w-full mt-4"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 p-6 lg:p-8">
                <div className="max-w-2xl">
                    <h1 className="text-2xl font-bold text-foreground mb-2">Settings</h1>
                    <p className="text-foreground-muted mb-8">Manage your account settings and preferences.</p>

                    {/* Mobile Tab Navigation */}
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-6 lg:hidden">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${activeTab === tab.id
                                    ? 'bg-primary text-white'
                                    : 'bg-card border border-border text-foreground-muted'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 mb-6">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6">
                            {message}
                        </div>
                    )}

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
                                {!isEditMode && !isLoadingProfile && (
                                    <button
                                        onClick={() => setIsEditMode(true)}
                                        className="btn-secondary text-sm py-2 px-4"
                                    >
                                        <Pencil className="w-4 h-4" />
                                        Edit
                                    </button>
                                )}
                            </div>

                            {isLoadingProfile ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : isEditMode ? (
                                /* Edit Mode */
                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    {/* Display Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground-muted mb-2">
                                            Full Name *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted z-10" />
                                            <input
                                                type="text"
                                                value={profile.displayName}
                                                onChange={(e) => handleProfileChange('displayName', e.target.value)}
                                                placeholder="John Doe"
                                                className="input"
                                                style={{ paddingLeft: '3rem' }}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Email (read-only) */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground-muted mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted z-10" />
                                            <input
                                                type="email"
                                                value={userEmail}
                                                disabled
                                                className="input bg-background-secondary cursor-not-allowed"
                                                style={{ paddingLeft: '3rem' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground-muted mb-2">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted z-10" />
                                            <input
                                                type="tel"
                                                value={profile.phone}
                                                onChange={(e) => handleProfileChange('phone', e.target.value)}
                                                placeholder="+1 (555) 123-4567"
                                                className="input"
                                                style={{ paddingLeft: '3rem' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Address Section */}
                                    <div className="border-t border-border pt-6 mt-6">
                                        <h3 className="text-md font-medium text-foreground mb-4 flex items-center gap-2">
                                            <MapPin className="w-5 h-5" />
                                            Shipping Address
                                        </h3>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-foreground-muted mb-2">
                                                Street Address
                                            </label>
                                            <input
                                                type="text"
                                                value={profile.addressLine1}
                                                onChange={(e) => handleProfileChange('addressLine1', e.target.value)}
                                                placeholder="123 Main Street"
                                                className="input"
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-foreground-muted mb-2">
                                                Apt, Suite, Unit (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={profile.addressLine2}
                                                onChange={(e) => handleProfileChange('addressLine2', e.target.value)}
                                                placeholder="Apt 4B"
                                                className="input"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-foreground-muted mb-2">
                                                    City
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profile.city}
                                                    onChange={(e) => handleProfileChange('city', e.target.value)}
                                                    placeholder="New York"
                                                    className="input"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-foreground-muted mb-2">
                                                    State / Province
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profile.state}
                                                    onChange={(e) => handleProfileChange('state', e.target.value)}
                                                    placeholder="NY"
                                                    className="input"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-foreground-muted mb-2">
                                                    ZIP / Postal Code
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profile.zipCode}
                                                    onChange={(e) => handleProfileChange('zipCode', e.target.value)}
                                                    placeholder="10001"
                                                    className="input"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-foreground-muted mb-2">
                                                    Country
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profile.country}
                                                    onChange={(e) => handleProfileChange('country', e.target.value)}
                                                    placeholder="United States"
                                                    className="input"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="btn-primary flex-1"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Save className="w-5 h-5" />
                                                    Save Profile
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditMode(false)}
                                            className="btn-secondary"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                /* View Mode */
                                <div className="space-y-6">
                                    {/* Name and Email */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-sm text-foreground-muted mb-1">Full Name</p>
                                            <p className="text-foreground font-medium">{profile.displayName || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-foreground-muted mb-1">Email</p>
                                            <p className="text-foreground font-medium">{userEmail}</p>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <p className="text-sm text-foreground-muted mb-1">Phone Number</p>
                                        <p className="text-foreground font-medium">{profile.phone || '—'}</p>
                                    </div>

                                    {/* Address */}
                                    <div className="border-t border-border pt-6">
                                        <p className="text-sm text-foreground-muted mb-2 flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            Shipping Address
                                        </p>
                                        {profile.addressLine1 ? (
                                            <div className="text-foreground font-medium">
                                                <p>{profile.addressLine1}</p>
                                                {profile.addressLine2 && <p>{profile.addressLine2}</p>}
                                                <p>
                                                    {[profile.city, profile.state, profile.zipCode]
                                                        .filter(Boolean)
                                                        .join(', ')}
                                                </p>
                                                {profile.country && <p>{profile.country}</p>}
                                            </div>
                                        ) : (
                                            <p className="text-foreground-muted">No address saved</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-6">Change Password</h2>
                            <form onSubmit={handleUpdatePassword} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-foreground-muted mb-2">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted z-10" />
                                        <input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="input"
                                            style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground z-10"
                                        >
                                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground-muted mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted z-10" />
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="input"
                                            style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground z-10"
                                        >
                                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground-muted mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted z-10" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="input"
                                            style={{ paddingLeft: '3rem' }}
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !newPassword || !confirmPassword}
                                    className="btn-primary disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Shield className="w-5 h-5" />
                                            Update Password
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-6">Notification Preferences</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <div>
                                        <p className="font-medium text-foreground">Pool Updates</p>
                                        <p className="text-sm text-foreground-muted">Get notified when pools you&apos;re in have updates</p>
                                    </div>
                                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <div>
                                        <p className="font-medium text-foreground">Order Notifications</p>
                                        <p className="text-sm text-foreground-muted">Shipping updates and delivery notifications</p>
                                    </div>
                                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="font-medium text-foreground">Marketing Emails</p>
                                        <p className="text-sm text-foreground-muted">New deals, featured products, and promotions</p>
                                    </div>
                                    <input type="checkbox" className="w-5 h-5 accent-primary" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Billing Tab */}
                    {activeTab === 'billing' && (
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-6">Billing & Payment</h2>
                            <div className="text-center py-12">
                                <CreditCard className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                                <p className="text-foreground-muted mb-4">No payment methods on file</p>
                                <button className="btn-secondary">
                                    Add Payment Method
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Danger Zone - only on profile tab */}
                    {activeTab === 'profile' && (
                        <div className="card p-6 mt-6 border-red-500/20">
                            <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
                            <p className="text-foreground-muted mb-4">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>
                            <button className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors">
                                Delete Account
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
