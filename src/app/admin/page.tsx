// src/app/admin/page.tsx

import { supabaseAdmin } from "@/lib/supabase"
import DashboardClient from "./DashboardClient"
import { Profile } from "@/lib/types"

export const dynamic = "force-dynamic"

// Définition des types pour les données envoyées au client
type RevenueDay = { name: string; revenus: number }
type SubStatus = { name: string; value: number; color: string }

type DashboardStats = {
  totalUsers: number
  verifiedCreators: number
  newSubscribers: number
  retentionRate: number
  recentUsers: Profile[]
  revenueData: RevenueDay[]
  subscriptionData: SubStatus[]
}

export default async function AdminDashboardPage() {
  // 1. Statistiques des utilisateurs
  const { count: totalUsers } = await supabaseAdmin
    .from("profiles")
    .select("*", { count: "exact", head: true })

  const { count: verifiedCreators } = await supabaseAdmin
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_verified", true)

  // 2. Abonnements (pour le graphique camembert et les nouveaux abonnés)
  const { data: allSubs } = await supabaseAdmin
    .from("subscriptions")
    .select("status, created_at")

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const newSubscribers = allSubs?.filter(s => new Date(s.created_at) >= thirtyDaysAgo).length || 0
  const activeSubs = allSubs?.filter(s => s.status === "active").length || 0
  const totalSubs = allSubs?.length || 0
  const retentionRate = totalSubs > 0 ? Math.round((activeSubs / totalSubs) * 100) : 0

  // Données réelles pour le graphique des abonnements
  const subscriptionData: SubStatus[] = [
    { name: "Actifs", value: activeSubs, color: "#8B5CF6" },
    { name: "Annulés", value: allSubs?.filter(s => s.status === "cancelled").length || 0, color: "#F59E0B" },
    { name: "Expirés", value: allSubs?.filter(s => s.status === "expired").length || 0, color: "#EF4444" },
  ]

  // 3. Revenus des 7 derniers jours (Produits + Abonnements + Pourboires)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const isoDate = sevenDaysAgo.toISOString()

  const [{ data: purchases }, { data: subsRevenue }, { data: tipsData }] = await Promise.all([
    supabaseAdmin.from("product_purchases").select("amount_paid, purchase_date").eq("payment_status", "completed").gte("purchase_date", isoDate),
    supabaseAdmin.from("subscriptions").select("amount_paid, created_at").gte("created_at", isoDate),
    supabaseAdmin.from("tips").select("amount, created_at").eq("status", "completed").gte("created_at", isoDate)
  ])

  // Création d'un tableau pour les 7 derniers jours
  const revenueByDay = Array(7).fill(0).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return { date: d.toISOString().split("T")[0], day: d.toLocaleDateString("fr-FR", { weekday: "short" }), total: 0 }
  })

  // Fonction pour additionner les revenus par jour
  const addRevenue = (items: any[] | null, dateKey: string) => {
    items?.forEach(item => {
      const itemDate = new Date(item[dateKey]).toISOString().split("T")[0]
      const dayData = revenueByDay.find(d => d.date === itemDate)
      if (dayData) dayData.total += Number(item.amount_paid || item.amount)
    })
  }

  addRevenue(purchases, "purchase_date")
  addRevenue(subsRevenue, "created_at")
  addRevenue(tipsData, "created_at")

  const revenueData: RevenueDay[] = revenueByDay.map(d => ({ name: d.day, revenus: d.total }))

  // 4. Derniers utilisateurs inscrits
  const { data: recentUsers } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  const stats: DashboardStats = {
    totalUsers: totalUsers || 0,
    verifiedCreators: verifiedCreators || 0,
    newSubscribers,
    retentionRate,
    recentUsers: recentUsers || [],
    revenueData,
    subscriptionData
  }

  return <DashboardClient stats={stats} />
}