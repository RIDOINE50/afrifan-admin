import { supabaseAdmin } from "@/lib/supabase"
import { Profile } from "@/lib/types"
import UsersClient from "./UsersClient"

export const dynamic = "force-dynamic"

export default async function UsersPage() {
  // Récupérer TOUS les utilisateurs (limité à 100 pour l'instant)
  const { data: profiles, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<Profile[]>()

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <h2 className="text-red-500 font-semibold mb-2">Erreur de chargement</h2>
          <p className="text-gray-400">{error.message}</p>
        </div>
      </div>
    )
  }

  return <UsersClient profiles={profiles || []} />
}