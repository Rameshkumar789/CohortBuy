import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// POST /api/catalog/import - Import products via CSV
export async function POST(request: Request) {
    try {
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

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get supplier
        const { data: supplier } = await supabase
            .from('suppliers')
            .select('id, verified_at')
            .eq('user_id', user.id)
            .single();

        if (!supplier || !supplier.verified_at) {
            return NextResponse.json(
                { success: false, message: 'Supplier not verified' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { csvData } = body;

        if (!csvData) {
            return NextResponse.json(
                { success: false, message: 'No CSV data provided' },
                { status: 400 }
            );
        }

        // Parse CSV
        const lines = csvData.trim().split('\n');
        const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());

        // Validate headers
        const requiredHeaders = ['sku', 'title', 'price'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
            return NextResponse.json(
                { success: false, message: `Missing required columns: ${missingHeaders.join(', ')}` },
                { status: 400 }
            );
        }

        let importedCount = 0;
        const errors: string[] = [];

        // Process each row
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map((v: string) => v.trim());
            if (values.length < headers.length) continue;

            const row: Record<string, string> = {};
            headers.forEach((header: string, index: number) => {
                row[header] = values[index] || '';
            });

            try {
                // For now, create a simple catalog entry
                // In production, this would include product matching logic
                const priceCents = Math.round(parseFloat(row.price) * 100);
                const wholesaleCents = row.wholesale_price
                    ? Math.round(parseFloat(row.wholesale_price) * 100)
                    : null;
                const inventoryCount = row.inventory ? parseInt(row.inventory) : 0;

                // Check if product exists in global catalog (simplified matching)
                let variantId = null;

                // For MVP, we'll create a product if title/brand exist
                // In production, this would use AI matching
                if (row.title) {
                    // Check for existing product
                    const { data: existingProduct } = await supabase
                        .from('global_catalog')
                        .select('id')
                        .ilike('title', `%${row.title}%`)
                        .limit(1)
                        .single();

                    if (existingProduct) {
                        // Get or create variant
                        const { data: variant } = await supabase
                            .from('product_variants')
                            .select('id')
                            .eq('parent_product_id', existingProduct.id)
                            .limit(1)
                            .single();

                        variantId = variant?.id;
                    }
                }

                // Create supplier catalog entry (even without variant for MVP)
                if (variantId) {
                    const { error: insertError } = await supabase
                        .from('supplier_catalog')
                        .upsert({
                            supplier_id: supplier.id,
                            variant_id: variantId,
                            supplier_sku: row.sku,
                            price: priceCents,
                            wholesale_price: wholesaleCents,
                            inventory_count: inventoryCount,
                            is_active: true,
                        }, {
                            onConflict: 'supplier_id,variant_id'
                        });

                    if (!insertError) {
                        importedCount++;
                    } else {
                        errors.push(`Row ${i}: ${insertError.message}`);
                    }
                } else {
                    // No matching product found - log for manual review
                    errors.push(`Row ${i}: No matching product found for "${row.title}"`);
                }
            } catch (err) {
                errors.push(`Row ${i}: Failed to process`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Imported ${importedCount} products`,
            count: importedCount,
            errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
        });
    } catch (err) {
        console.error('Catalog import error:', err);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
