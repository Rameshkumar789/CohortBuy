'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Store, Upload, FileSpreadsheet, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function CatalogImportPage() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
    const [csvData, setCsvData] = useState('');

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setCsvData(event.target?.result as string);
        };
        reader.readAsText(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!csvData) return;

        setIsUploading(true);
        setUploadResult(null);

        try {
            const response = await fetch('/api/catalog/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ csvData }),
            });

            const data = await response.json();
            setUploadResult(data);
        } catch (err) {
            console.error('Import error:', err);
            setUploadResult({ success: false, message: 'Import failed' });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-card border-b border-border sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/catalog"
                            className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-foreground-muted" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                <Store className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-foreground">Import Catalog</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-8">
                {/* Instructions */}
                <div className="card p-6 mb-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                        CSV Format
                    </h2>
                    <p className="text-foreground-muted mb-4">
                        Upload a CSV file with the following columns:
                    </p>
                    <div className="bg-background-secondary rounded-lg p-4 overflow-x-auto">
                        <code className="text-sm text-foreground">
                            sku,title,brand,category,price,wholesale_price,inventory,upc
                        </code>
                    </div>
                    <p className="text-sm text-foreground-muted mt-4">
                        Our system will automatically match your products to existing catalog entries
                        or create new ones if no match is found.
                    </p>
                </div>

                {/* Upload Form */}
                <form onSubmit={handleSubmit} className="card p-6">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center mb-6">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="csv-upload"
                        />
                        <label
                            htmlFor="csv-upload"
                            className="cursor-pointer block"
                        >
                            <Upload className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                            <p className="text-foreground mb-2">
                                {csvData ? 'File loaded! Click to change' : 'Click to upload CSV file'}
                            </p>
                            <p className="text-sm text-foreground-muted">
                                or drag and drop
                            </p>
                        </label>
                    </div>

                    {csvData && (
                        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                            <p className="text-emerald-400 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                CSV file loaded and ready to import
                            </p>
                        </div>
                    )}

                    {uploadResult && (
                        <div className={`mb-6 p-4 rounded-lg border ${uploadResult.success
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                            <p className="flex items-center gap-2">
                                {uploadResult.success ? (
                                    <CheckCircle className="w-5 h-5" />
                                ) : (
                                    <AlertCircle className="w-5 h-5" />
                                )}
                                {uploadResult.message}
                                {uploadResult.count !== undefined && ` (${uploadResult.count} products)`}
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!csvData || isUploading}
                        className="btn-primary w-full py-4 disabled:opacity-50"
                    >
                        {isUploading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                Import Products
                            </>
                        )}
                    </button>
                </form>

                {/* Manual Entry Link */}
                <p className="text-center text-foreground-muted mt-6">
                    Prefer to add products manually?{' '}
                    <Link href="/catalog/add" className="text-amber-400 hover:underline">
                        Add single product
                    </Link>
                </p>
            </main>
        </div>
    );
}
