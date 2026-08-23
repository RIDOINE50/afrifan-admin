'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function sendCampaign(formData: FormData): Promise<void> {
  const title = formData.get('title') as string;
  const message = formData.get('message') as string;
  const targetType = formData.get('targetType') as string;
  const targetUserId = formData.get('targetUserId') as string;

  if (!title || !message || !targetType) {
    console.error('Veuillez remplir tous les champs obligatoires.');
    return;
  }

  try {
    const { error: dbError } = await supabaseAdmin.from('admin_campaigns').insert({
      title: title,
      message: message,
      target_type: targetType,
      target_user_id: targetType === 'specific' ? targetUserId : null,
    });

    if (dbError) throw dbError;

    revalidatePath('/admin/notifications');
  } catch (error) {
    console.error('Erreur envoi campagne:', error);
  }
}