"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts"
import { TrendingUp, TrendingDown, Users, Clapperboard, UserPlus, Activity } from "lucide-react"
import { Profile } from "@/lib/types"
type DashboardStats = {
  totalUsers: number
  verifiedCreators: number
  newSubscribers: number
  retentionRate: number
  recentUsers: Profile[]
}

export default function DashboardClient({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      label: "Total Utilisateurs",
      value: stats.totalUsers.toLocaleString(),
      change: "+2%",
      up: true,
      icon: Users,
      color: "bg-violet-600",
    },
    {
      label: "Créateurs Vérifiés",
      value: stats.verifiedCreators.toLocaleString(),
      change: "+15%",
      up: true,
      icon: Clapperboard,
      color: "bg-blue-600",
    },
    {
      label: "Nouveaux Abonnés",
      value: stats.newSubscribers.toString(),
      change: "+2%",
      up: true,
      icon: UserPlus,
      color: "bg-green-600",
    },
    {
      label: "Taux de Rétention",
      value: `${stats.retentionRate}%`,
      change: "+5%",
      up: true,
      icon: Activity,
      color: "bg-orange-600",
    },
  ]

  const revenueData = [
    { name: "Lun", revenus: 4000 },
    { name: "Mar", revenus: 3000 },
    { name: "Mer", revenus: 5000 },
    { name: "Jeu", revenus: 4500 },
    { name: "Ven", revenus: 6000 },
    { name: "Sam", revenus: 5500 },
    { name: "Dim", revenus: 7000 },
  ]

  const subscriptionData = [
    { name: "Actifs", value: stats.newSubscribers || 100, color: "#8B5CF6" },
    { name: "En essai", value: 10, color: "#F59E0B" },
    { name: "Renouvelés", value: 25, color: "#10B981" },
    { name: "Expirés", value: 4, color: "#3B82F6" },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-500">Données en temps réel depuis Supabase</p>
      </div>

      {/* 4 cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stat.up ? "text-green-500" : "text-red-500"}`}>
                  {stat.up ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span className="font-medium">{stat.change}</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-6">Revenus de la semaine</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #333" }} />
              <Bar dataKey="revenus" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-6">Répartition des abonnements</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={subscriptionData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {subscriptionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #333" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table des vrais utilisateurs */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-white font-semibold">Derniers utilisateurs inscrits</h3>
        </div>
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Utilisateur</th>
              <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Username</th>
              <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Rôle</th>
              <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            ) : (
              stats.recentUsers.map((user) => (
                <tr key={user.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold">
                        {(user.full_name || user.username || "?").charAt(0).toUpperCase()}
                      </div>
                      <p className="text-white font-medium">{user.full_name || "Sans nom"}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">@{user.username || "—"}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-violet-600/10 text-violet-500 text-xs font-medium">
                      {user.role || "user"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(user.created_at).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}