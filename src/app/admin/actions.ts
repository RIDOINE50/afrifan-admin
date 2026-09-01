"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

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