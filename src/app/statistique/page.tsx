// src/app/admin/dashboard/page.tsx

import { supabaseAdmin } from "@/lib/supabase"
import AdminDashboardClient from "./statistique"

export const dynamic = "force-dynamic"

type Period = "1m" | "3m" | "6m" | "1y" | "all"

function getStartDate(period: Period): string | null {
  if (period === "all") return null
  
  const date = new Date()
  if (period === "1m") date.setMonth(date.getMonth() - 1)
  else if (period === "3m") date.setMonth(date.getMonth() - 3)
  else if (period === "6m") date.setMonth(date.getMonth() - 6)
  else if (period === "1y") date.setFullYear(date.getFullYear() - 1)
  
  return date.toISOString()
}

async function getStats(period: Period) {
  const startDate = getStartDate(period)
  
  // Fonction helper pour ajouter le filtre de date si nécessaire
  const addDateFilter = (query: any, dateColumn: string) => {
    if (startDate) {
      return query.gte(dateColumn, startDate)
    }
    return query
  }

  // Exécuter toutes les requêtes en parallèle pour la performance
  const [
    usersResult,
    creatorsResult,
    productsResult,
    purchasesResult,
    tipsResult,
    subscriptionsResult,
    withdrawalsResult,
    postsResult,
    reportsResult,
    notificationsResult
  ] = await Promise.all([
    // Utilisateurs (role = 'user')
    addDateFilter(
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "user"),
      "created_at"
    ),
    
    // Créateurs (role = 'creator')
    addDateFilter(
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "creator"),
      "created_at"
    ),
    
    // Produits
    addDateFilter(
      supabaseAdmin.from("digital_products").select("id", { count: "exact", head: true }),
      "created_at"
    ),
    
    // Achats de produits (completed only)
    addDateFilter(
      supabaseAdmin.from("product_purchases").select("amount_paid").eq("payment_status", "completed"),
      "purchase_date"
    ),
    
    // Pourboires
    addDateFilter(
      supabaseAdmin.from("tips").select("amount").eq("status", "completed"),
      "created_at"
    ),
    
    // Abonnements
    addDateFilter(
      supabaseAdmin.from("subscriptions").select("amount_paid").eq("status", "active"),
      "created_at"
    ),
    
    // Retraits
    addDateFilter(
      supabaseAdmin.from("withdrawals").select("amount, status"),
      "created_at"
    ),
    
    // Posts
    addDateFilter(
      supabaseAdmin.from("posts").select("id", { count: "exact", head: true }),
      "created_at"
    ),
    
    // Signalements
    addDateFilter(
      supabaseAdmin.from("reports").select("id", { count: "exact", head: true }),
      "created_at"
    ),
    
    // Notifications
    addDateFilter(
      supabaseAdmin.from("notifications").select("id", { count: "exact", head: true }),
      "created_at"
    )
  ])

  // Calculer les statistiques
  const totalUsers = usersResult.count || 0
  const totalCreators = creatorsResult.count || 0
  const totalProducts = productsResult.count || 0
  const totalPosts = postsResult.count || 0
  const totalReports = reportsResult.count || 0
  const totalNotifications = notificationsResult.count || 0
  
  // ✅ CORRECTION TYPE : typage explicite des paramètres des reduce
  const productRevenue = purchasesResult.data?.reduce(
    (sum: number, p: { amount_paid: number | string }) => sum + Number(p.amount_paid),
    0
  ) || 0
  const totalPurchases = purchasesResult.data?.length || 0
  
  const tipRevenue = tipsResult.data?.reduce(
    (sum: number, t: { amount: number | string }) => sum + Number(t.amount),
    0
  ) || 0
  const subscriptionRevenue = subscriptionsResult.data?.reduce(
    (sum: number, s: { amount_paid: number | string }) => sum + Number(s.amount_paid),
    0
  ) || 0
  
  const totalWithdrawals = withdrawalsResult.data?.reduce(
    (sum: number, w: { amount: number | string }) => sum + Number(w.amount),
    0
  ) || 0
  const pendingWithdrawals = withdrawalsResult.data?.filter(
    (w: { status: string }) => w.status === "pending"
  ).length || 0
  const completedWithdrawals = withdrawalsResult.data?.filter(
    (w: { status: string }) => w.status === "completed"
  ).length || 0

  return {
    period,
    totalUsers,
    totalCreators,
    totalProducts,
    productRevenue,
    tipRevenue,
    subscriptionRevenue,
    totalWithdrawals,
    pendingWithdrawals,
    completedWithdrawals,
    totalPosts,
    totalReports,
    totalNotifications,
    totalPurchases
  }
}

export default async function DashboardPage() {
  // Par défaut, afficher les statistiques de tout temps
  const stats = await getStats("all")

  return <AdminDashboardClient stats={stats} />
}