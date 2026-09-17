"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// ==========================================
// 1. GESTION DES DEMANDES CRÉATEUR
// ==========================================
export async function updateCreatorApplication(
  applicationId: string, 
  userId: string, 
  action: "approve" | "reject"
) {
  try {
    // ⚠️ J'utilise "accepted" pour correspondre à ta logique frontend (setApplicationStatus('accepted'))
    const newStatus = action === "approve" ? "accepted" : "rejected"

    let premiumPrice = 0
    let proPrice = 0

    // 1. Si c'est une validation, on récupère D'ABORD les prix de la demande
    if (action === "approve") {
      const { data: appData, error: fetchError } = await supabaseAdmin
        .from("creator_applications")
        .select("premium_price, pro_price")
        .eq("id", applicationId)
        .single()

      if (!fetchError && appData) {
        premiumPrice = appData.premium_price || 0
        proPrice = appData.pro_price || 0
      }
    }

    // 2. Mettre à jour le statut de la demande
    await supabaseAdmin
      .from("creator_applications")
      .update({ status: newStatus })
      .eq("id", applicationId)

    // 3. Si c'est une validation, on transforme l'utilisateur en créateur vérifié ET on copie les prix
    if (action === "approve") {
      await supabaseAdmin
        .from("profiles")
        .update({ 
          role: "creator",
          is_verified: true,
          premium_price: premiumPrice, // ✅ COPIE AUTOMATIQUE DU PRIX PREMIUM
          pro_price: proPrice          // ✅ COPIE AUTOMATIQUE DU PRIX PRO
        })
        .eq("id", userId)
    }

    // 4. Rafraîchir la page admin pour que la demande disparaisse de la liste
    revalidatePath("/admin/creators")
    
    return { 
      success: true, 
      message: action === "approve" ? "Créateur validé et tarifs appliqués avec succès !" : "Demande refusée." 
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue"
    console.error("❌ Erreur updateCreatorApplication:", errorMessage)
    return { success: false, message: errorMessage }
  }
}

// ==========================================
// 2. GESTION DES UTILISATEURS (BAN / UNBAN)
// ==========================================

export async function banUserAction(userId: string) {
  try {
    // 1. On met is_banned à true (sans toucher au rôle user/créateur/admin)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ is_banned: true })
      .eq("id", userId)

    if (profileError) throw new Error(profileError.message)

    // 2. Déconnexion globale (coupe la session mobile/web immédiatement)
    try {
      await supabaseAdmin.auth.admin.signOut(userId, 'global')
    } catch (signOutErr) {
      console.warn("⚠️ Info: Déconnexion globale échouée, mais le profil est bien banni.", signOutErr)
    }

    // 3. Rafraîchir la page admin
    revalidatePath("/admin/users")
    
    return { 
      success: true, 
      message: "Utilisateur banni et déconnecté de tous ses appareils." 
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue"
    console.error("❌ Erreur banUserAction:", errorMessage)
    return { success: false, message: errorMessage }
  }
}

export async function unbanUserAction(userId: string) {
  try {
    // On remet is_banned à false (le rôle reste intact, qu'il soit user ou creator)
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ is_banned: false }) 
      .eq("id", userId)

    if (error) throw new Error(error.message)

    // Rafraîchir la page admin
    revalidatePath("/admin/users")
    
    return { 
      success: true, 
      message: "Utilisateur débanni avec succès." 
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue"
    console.error("❌ Erreur unbanUserAction:", errorMessage)
    return { success: false, message: errorMessage }
  }
}