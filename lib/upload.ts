'use client';

import { supabase } from '@/lib/supabase';

export async function uploadDrugImage(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `drugs/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('drug-images')
        .upload(filePath, file);

    if (uploadError) {
        throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
        .from('drug-images')
        .getPublicUrl(filePath);

    return publicUrl;
}
