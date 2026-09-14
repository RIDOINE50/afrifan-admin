"use client"

import { useState } from "react"
import { 
  Users, Store, Gift, CreditCard, Wallet, FileText, 
  TrendingUp, Bell, AlertTriangle, Image as ImageIcon
} from "lucide-react"

type Period = "1m" | "3m" | "6m" | "1y" | "all"

interface DashboardStats {
  period: Period
  totalUsers: number
  totalCreators: number
  totalProducts: number
  productRevenue: number
  tipRevenue: number
  subscriptionRevenue: number
  totalWithdrawals: number
  pendingWithdrawals: number
  completedWithdrawals: number
  totalPosts: number
  totalReports: number
  totalNotifications: number
  totalPurchases: number
}

export default function AdminDashboardClient({ stats }: { stats: DashboardStats }) {
  const formatMoney = (amount: number) => {
    return `${Number(amount).toLocaleString("fr-FR")} FCFA`
  }

  const getPeriodLabel = (period: Period) => {
    switch (period) {
      case "1m": return "1 mois"
      case "3m": return "3 mois"
      case "6m": return "6 mois"
      case "1y": return "1 an"
      case "all": return "Tout"
    }
  }

  const statCards = [
    {
      title: "Revenus Produits",
      value: formatMoney(stats.productRevenue),
      icon: <Store className="text-blue-500" size={24} />,
      bg: "bg-blue-600/10",
      subtitle: `${stats.totalPurchases} achats`,
    },
    {
      title: "Revenus Pourboires",
      value: formatMoney(stats.tipRevenue),
      icon: <Gift className="text-pink-500" size={24} />,
      bg: "bg-pink-600/10",
    },
    {
      title: "Revenus Abonnements",
      value: formatMoney(stats.subscriptionRevenue),
      icon: <CreditCard className="text-violet-500" size={24} />,
      bg: "bg-violet-600/10",
    },
    {
      title: "Total Retraits",
      value: formatMoney(stats.totalWithdrawals),
      icon: <Wallet className="text-orange-500" size={24} />,
      bg: "bg-orange-600/10",
      subtitle: `${stats.pendingWithdrawals} en attente`,
    },
    {
      title: "Utilisateurs",
      value: stats.totalUsers.toLocaleString("fr-FR"),
      icon: <Users className="text-cyan-500" size={24} />,
      bg: "bg-cyan-600/10",
    },
    {
      title: "Créateurs",
      value: stats.totalCreators.toLocaleString("fr-FR"),
      icon: <Users className="text-emerald-500" size={24} />,
      bg: "bg-emerald-600/10",
    },
    {
      title: "Produits Publiés",
      value: stats.totalProducts.toLocaleString("fr-FR"),
      icon: <Store className="text-indigo-500" size={24} />,
      bg: "bg-indigo-600/10",
    },
    {
      title: "Posts",
      value: stats.totalPosts.toLocaleString("fr-FR"),
      icon: <ImageIcon className="text-purple-500" size={24} />,
      bg: "bg-purple-600/10",
    },
    {
      title: "Signalements",
      value: stats.totalReports.toLocaleString("fr-FR"),
      icon: <AlertTriangle className="text-red-500" size={24} />,
      bg: "bg-red-600/10",
    },
    {
      title: "Notifications",
      value: stats.totalNotifications.toLocaleString("fr-FR"),
      icon: <Bell className="text-yellow-500" size={24} />,
      bg: "bg-yellow-600/10",
    },
  ]

  return (
    <div className="p-8 min-h-screen bg-[#0A0A0A] text-white">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Administrateur</h1>
        <p className="text-gray-500">Vue d'ensemble de la plateforme - Période : {getPeriodLabel(stats.period)}</p>
      </div>

      {/* Grille de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card, index) => (
          <div 
            key={index}
            className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 flex flex-col gap-3 hover:border-white/20 transition"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 ${card.bg} rounded-lg`}>
                {card.icon}
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              {card.subtitle && (
                <p className="text-gray-500 text-xs mt-1">{card.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Résumé des revenus */}
      <div className="mt-8 bg-[#1A1A1A] border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="text-green-500" size={20} />
          Revenus Totaux
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-gray-400 text-sm">Produits</p>
            <p className="text-3xl font-bold text-blue-500">{formatMoney(stats.productRevenue)}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-gray-400 text-sm">Abonnements</p>
            <p className="text-3xl font-bold text-violet-500">{formatMoney(stats.subscriptionRevenue)}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-gray-400 text-sm">Pourboires</p>
            <p className="text-3xl font-bold text-pink-500">{formatMoney(stats.tipRevenue)}</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-gray-400 text-sm mb-2">Total Général</p>
          <p className="text-4xl font-bold text-green-500">
            {formatMoney(stats.productRevenue + stats.subscriptionRevenue + stats.tipRevenue)}
          </p>
        </div>
      </div>
    </div>
  )
}