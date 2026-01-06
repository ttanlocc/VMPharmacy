'use client';

import { supabase } from '@/lib/supabase';

export async function uploadImage(file: File, folder: 'drugs' | 'templates' = 'drugs') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('drug-images') // Reusing the same bucket for simplicity as per plan
        .upload(filePath, file);

    if (uploadError) {
        throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
        .from('drug-images')
        .getPublicUrl(filePath);

    return publicUrl;
}

// Backward compatibility alias if needed, or update consumers
export const uploadDrugImage = (file: File) => uploadImage(file, 'drugs');
