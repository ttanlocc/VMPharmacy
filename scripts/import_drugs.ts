#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables!');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY');
    process.exit(1);
}

// Create Supabase client with service key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface DrugRow {
    legacy_id: string;
    name: string;
    active_ingredient: string;
    parent_group: string;
    child_group: string;
    unit: string;
    unit_price: number;
    purchase_price: number;
    supplier: string;
    image_url: string;
}

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());

    return result;
}

function parseCSV(filePath: string): DrugRow[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    // Skip header
    const dataLines = lines.slice(1);

    return dataLines.map(line => {
        const fields = parseCSVLine(line);

        return {
            legacy_id: fields[0] || '',
            name: fields[1] || '',
            active_ingredient: fields[2] || '',
            parent_group: fields[3] || '',
            child_group: fields[4] || '',
            unit: fields[5] || 'Viên',
            unit_price: parseFloat(fields[6]) || 0,
            purchase_price: parseFloat(fields[7]) || 0,
            supplier: fields[8] || '',
            image_url: fields[9] || '',
        };
    });
}

async function importDrugs() {
    console.log('🚀 Starting drug import...\n');

    const csvPath = path.join(process.cwd(), 'drugs_import.csv');

    if (!fs.existsSync(csvPath)) {
        console.error(`❌ CSV file not found: ${csvPath}`);
        process.exit(1);
    }

    const drugs = parseCSV(csvPath);
    console.log(`📊 Found ${drugs.length} drugs to import\n`);

    let successCount = 0;
    let errorCount = 0;
    let updateCount = 0;

    for (const drug of drugs) {
        try {
            // Check if drug already exists by legacy_id
            const { data: existing } = await supabase
                .from('drugs')
                .select('id')
                .eq('legacy_id', drug.legacy_id)
                .single();

            if (existing) {
                // Update existing drug
                const { error } = await supabase
                    .from('drugs')
                    .update({
                        name: drug.name,
                        active_ingredient: drug.active_ingredient,
                        parent_group: drug.parent_group,
                        child_group: drug.child_group,
                        unit: drug.unit,
                        unit_price: drug.unit_price,
                        purchase_price: drug.purchase_price,
                        supplier: drug.supplier,
                        image_url: drug.image_url,
                    })
                    .eq('id', existing.id);

                if (error) throw error;

                console.log(`✏️  Updated: ${drug.name} (${drug.legacy_id})`);
                updateCount++;
            } else {
                // Insert new drug
                const { error } = await supabase
                    .from('drugs')
                    .insert({
                        legacy_id: drug.legacy_id,
                        name: drug.name,
                        active_ingredient: drug.active_ingredient,
                        parent_group: drug.parent_group,
                        child_group: drug.child_group,
                        unit: drug.unit,
                        unit_price: drug.unit_price,
                        purchase_price: drug.purchase_price,
                        supplier: drug.supplier,
                        image_url: drug.image_url,
                    });

                if (error) throw error;

                console.log(`✅ Inserted: ${drug.name} (${drug.legacy_id})`);
                successCount++;
            }
        } catch (error) {
            console.error(`❌ Error processing ${drug.name}:`, error);
            errorCount++;
        }
    }

    console.log('\n📊 Import Summary:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ✏️  Updated: ${updateCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📦 Total: ${drugs.length}`);
}

// Run import
importDrugs()
    .then(() => {
        console.log('\n✨ Import completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Import failed:', error);
        process.exit(1);
    });
