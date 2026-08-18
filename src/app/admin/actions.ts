"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function updateCreatorApplication(
  applicationId: string, 
  userId: string, 
  action: "approve" | "reject"
) {
  try {
    const newStatus = action === "approve" ? "approved" : "rejected"

    // 1. Mettre à jour le statut de la demande
    await supabaseAdmin
      .from("creator_applications") // ⚠️ Mets le VRAI nom de ta table ici si c'est différent
      .update({ status: newStatus })
      .eq("id", applicationId)

    // 2. Si c'est une validation, on transforme l'utilisateur en créateur vérifié
    if (action === "approve") {
      await supabaseAdmin
        .from("profiles")
        .update({ 
          role: "creator",
          is_verified: true
        })
        .eq("id", userId)
    }

    // 3. Rafraîchir la page admin pour que la demande disparaisse de la liste
    revalidatePath("/admin/creators")
    
    return { success: true, message: action === "approve" ? "Créateur validé !" : "Demande refusée." }
  } catch (error: unknown) { // ✅ CORRECTION ICI : 'unknown' au lieu de 'any'
    const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue"
    console.error("Erreur:", errorMessage)
    return { success: false, message: errorMessage }
  }
}