// src/app/admin/settings/page.tsx

import { supabaseAdmin } from "@/lib/supabase"
import SettingsClient from "./SettingsClient"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const { data: settings, error } = await supabaseAdmin
    .from("platform_settings")
    .select("*")
    .order("category", { ascending: true })

  if (error) {
    console.error("Erreur chargement paramètres:", error)
  }

  return <SettingsClient settings={settings || []} />
}