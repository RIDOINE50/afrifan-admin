// src/app/api/admin/settings/route.ts

import { supabaseAdmin } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { settings } = await request.json()

    // Convertir l'objet settings en tableau pour Supabase
    const updates = Object.entries(settings).map(([fullKey, value]) => {
      const [category, key] = fullKey.split(".")
      const isSecret = key.includes("password") || key.includes("secret") || key.includes("api_key")
      
      return {
        category,
        key,
        value: value as string,
        is_secret: isSecret,
        updated_at: new Date().toISOString()
      }
    })

    // Upsert chaque paramètre
    for (const setting of updates) {
      await supabaseAdmin
        .from("platform_settings")
        .upsert(setting, {
          onConflict: "category,key"
        })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur sauvegarde paramètres:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}