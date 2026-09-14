import { supabaseAdmin } from "@/lib/supabase"
import PurchasesListClient from "./PurchasesListClient"

export const dynamic = "force-dynamic"

export default async function MesAchatsPage() {
  // ✅ REQUÊTE CORRIGÉE : On sélectionne 'title' et 'media_type' au lieu de 'name'
  const { data: purchases, error } = await supabaseAdmin
    .from("product_purchases")
    .select(`
      id,
      product_id,
      buyer_id,
      creator_id,
      amount_paid,
      currency,
      payment_status,
      payment_method,
      purchase_date,
      buyer:buyer_id (full_name, username),
      creator:creator_id (full_name, username),
      product:product_id (title, media_type, price)
    `)
    .order("purchase_date", { ascending: false })
    .limit(500)

  if (error || !purchases) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <h2 className="text-red-500 font-semibold mb-2">Erreur de chargement</h2>
          <p className="text-gray-400">{error?.message || "Impossible de récupérer les achats."}</p>
        </div>
      </div>
    )
  }

  return <PurchasesListClient purchases={purchases} />
}