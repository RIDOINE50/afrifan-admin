import { supabaseAdmin } from "@/lib/supabase"
import CreatorsClient from "./CreatorsClient"

export const dynamic = "force-dynamic"

export default async function CreatorsPage() {
  // Récupère les demandes en attente
  // ️ Change "creator_applications" par le vrai nom de ta table si besoin
  const { data: applications, error } = await supabaseAdmin
    .from("creator_applications") 
    .select("*")
    .eq("status", "pending") // ⚠️ Change "pending" si ta colonne de statut a un autre nom (ex: 'en_attente')
    .order("created_at", { ascending: false })

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <h2 className="text-red-500 font-semibold mb-2">Erreur de chargement</h2>
          <p className="text-gray-400">{error.message}</p>
          <p className="text-gray-500 text-sm mt-2">Vérifie le nom de la table et des colonnes dans Supabase.</p>
        </div>
      </div>
    )
  }

  return <CreatorsClient applications={applications || []} />
}