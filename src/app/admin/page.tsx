import { supabaseAdmin } from "@/lib/supabase"
import { Profile } from "@/lib/types"
import DashboardClient from "./DashboardClient"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  // 1. Total utilisateurs
  const { count: totalUsers } = await supabaseAdmin
    .from("profiles")
    .select("*", { count: "exact", head: true })

  // 2. Créateurs vérifiés
  const { count: verifiedCreators } = await supabaseAdmin
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .or("role.eq.creator,is_verified.eq.true")

  // 3. Nouveaux abonnés (aujourd'hui)
  const today = new Date().toISOString().split("T")[0]
  const { count: newSubscribers } = await supabaseAdmin
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today)

  // 4. 5 derniers utilisateurs
  const { data: recentUsers } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<Profile[]>()

  const stats = {
    totalUsers: totalUsers || 0,
    verifiedCreators: verifiedCreators || 0,
    newSubscribers: newSubscribers || 0,
    retentionRate: 89.9,
    recentUsers: recentUsers || [],
  }

  return <DashboardClient stats={stats} />
}