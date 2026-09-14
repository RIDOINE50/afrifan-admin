import { supabaseAdmin } from "@/lib/supabase"
import CreatorsListClient from "./CreatorsListClient"

export const dynamic = "force-dynamic"

export default async function ManagedCreatorsPage() {
  // 1. Récupérer tous les profils avec le rôle "creator"
  const { data: creators, error: creatorsError } = await supabaseAdmin
    .from("profiles")
    .select("id, username, full_name, avatar_url, is_verified, followers_count, is_banned, created_at, premium_price, pro_price")
    .eq("role", "creator")
    .order("created_at", { ascending: false })

  if (creatorsError || !creators) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <h2 className="text-red-500 font-semibold mb-2">Erreur de chargement</h2>
          <p className="text-gray-400">{creatorsError?.message || "Impossible de récupérer les créateurs."}</p>
        </div>
      </div>
    )
  }

  // 2. Récupérer les soldes depuis la table `wallets` en utilisant `creator_id`
  const creatorIds = creators.map((c) => c.id)
  const { data: wallets } = await supabaseAdmin
    .from("wallets")
    .select("creator_id, balance, total_earned")
    .in("creator_id", creatorIds)

  // 3. Fusionner les données pour que chaque créateur ait son solde
  const creatorsWithWallets = creators.map((creator) => {
    const wallet = wallets?.find((w) => w.creator_id === creator.id)
    return {
      ...creator,
      balance: Number(wallet?.balance || 0),
      total_earned: Number(wallet?.total_earned || 0),
    }
  })

  return <CreatorsListClient creators={creatorsWithWallets} />
}