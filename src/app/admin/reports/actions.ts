// src/app/admin/reports/actions.ts
'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

// 1. Ignorer un signalement (le retirer de la liste d'attente)
export async function dismissReport(reportId: string) {
  try {
    await supabaseAdmin.from('reports').delete().eq('id', reportId);
    revalidatePath('/admin/reports');
    return { success: true };
  } catch (error) {
    console.error('Erreur suppression signalement:', error);
    return { error: 'Une erreur est survenue.' };
  }
}

// 2. Supprimer le contenu signalé (Post ou Bannir le Profil)
export async function deleteTargetContent(targetId: string, targetType: string) {
  try {
    if (targetType === 'post') {
      // Supprime le post de la base de données
      await supabaseAdmin.from('posts').delete().eq('id', targetId);
    } else if (targetType === 'profile') {
      // Bannit définitivement le profil (Soft Ban)
      await supabaseAdmin.from('profiles').update({ is_banned: true }).eq('id', targetId);
    }

    // Nettoie tous les signalements liés à cette cible pour ne plus les voir
    await supabaseAdmin.from('reports').delete().eq('target_id', targetId).eq('target_type', targetType);
    
    revalidatePath('/admin/reports');
    return { success: true };
    } catch (error) {
    console.error('Erreur suppression cible:', error);
    return { error: 'Une erreur est survenue.' };
  }
}