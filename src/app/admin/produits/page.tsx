// src/app/admin/produits/page.tsx

import { supabaseAdmin } from "@/lib/supabase"
import ProductsListClient from "./ProductsListClient"

export const dynamic = "force-dynamic"

interface ProductData {
  id: string
  title: string
  description: string | null
  media_type: "video" | "image" | "file" | "audio"
  file_url: string
  preview_url: string | null
  price: number
  currency: string
  status: "published" | "draft" | "archived"
  created_at: string
  creator: { full_name: string; username: string } | null
  sales_count: number
  total_revenue: number
}

export default async function ProduitsPage() {
  // 1. Récupérer les produits avec les infos du créateur
  const { data: products, error } = await supabaseAdmin
    .from("digital_products")
    .select(`
      id,
      title,
      description,
      media_type,
      file_url,
      preview_url,
      price,
      currency,
      status,
      created_at,
      creator:profiles!creator_id (
        full_name,
        username
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <h2 className="text-red-500 font-semibold mb-2">Erreur de chargement des produits</h2>
          <p className="text-gray-400">{error.message}</p>
        </div>
      </div>
    )
  }

  // 2. Calculer les ventes et revenus pour chaque produit
  const productsWithStats = await Promise.all(
    (products || []).map(async (product) => {
      // ✅ CORRECTION ICI : "product_purchases" au lieu de "purchases"
      const { data: purchases } = await supabaseAdmin
        .from("product_purchases")
        .select("amount_paid, payment_status")
        .eq("product_id", product.id)
        .eq("payment_status", "completed")

      const sales_count = purchases?.length || 0
      const total_revenue = purchases?.reduce((sum, p) => sum + Number(p.amount_paid), 0) || 0

      // ✅ CORRECTION TYPE : Supabase renvoie 'creator' en tableau, on déballe [0]
      const creator = Array.isArray(product.creator)
        ? product.creator[0] ?? null
        : product.creator ?? null

      return {
        ...product,
        creator,
        sales_count,
        total_revenue
      }
    })
  )

  // 3. Afficher le composant client avec les données enrichies
  return <ProductsListClient products={productsWithStats as ProductData[]} />
}