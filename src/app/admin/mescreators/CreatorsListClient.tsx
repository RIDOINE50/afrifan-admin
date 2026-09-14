"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Eye, Ban, ShieldCheck, Users, DollarSign, TrendingUp, Loader2 } from "lucide-react"
import { banUserAction, unbanUserAction } from "@/app/admin/actions"

type CreatorWithWallet = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  is_verified: boolean
  followers_count: number
  is_banned: boolean | null
  created_at: string
  premium_price: number | null
  pro_price: number | null
  balance: number
  total_earned: number
}

export default function CreatorsListClient({ creators }: { creators: CreatorWithWallet[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Filtrer par recherche (nom ou username)
  const filteredCreators = creators.filter((c) => {
    const searchLower = search.toLowerCase()
    return (
      (c.full_name || "").toLowerCase().includes(searchLower) ||
      (c.username || "").toLowerCase().includes(searchLower)
    )
  })

  // Calculer les stats globales
  const totalCreators = creators.length
  const totalBalance = creators.reduce((sum, c) => sum + c.balance, 0)
  const totalEarnedPlatform = creators.reduce((sum, c) => sum + c.total_earned, 0)
  const bannedCreators = creators.filter((c) => c.is_banned).length

  const handleToggleBan = async (creator: CreatorWithWallet) => {
    const isBanned = creator.is_banned === true
    if (!window.confirm(`Voulez-vous ${isBanned ? "débannir" : "bannir"} ce créateur ?\nCela coupera immédiatement son accès à la plateforme.`)) return

    setActionLoadingId(creator.id)
    try {
      const result = isBanned ? await unbanUserAction(creator.id) : await banUserAction(creator.id)
      if (result.success) {
        router.refresh() // Rafraîchit les données serveur pour mettre à jour l'UI
      } else {
        alert("Erreur : " + result.message)
      }
    } catch (error) {
      console.error("Erreur action:", error)
      alert("Une erreur inattendue est survenue.")
    } finally {
      setActionLoadingId(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(amount)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Gestion des Créateurs</h1>
        <p className="text-gray-500">Gérez les créateurs validés, consultez leurs soldes et modérez leurs accès.</p>
      </div>

      {/* Stats Rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-violet-600/10 rounded-lg">
            <Users className="text-violet-500" size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Total Créateurs</p>
            <p className="text-2xl font-bold text-white">{totalCreators}</p>
          </div>
        </div>
        
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-green-600/10 rounded-lg">
            <DollarSign className="text-green-500" size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Solde Total (À payer)</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalBalance)}</p>
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-600/10 rounded-lg">
            <TrendingUp className="text-blue-500" size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Gains Totaux Générés</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalEarnedPlatform)}</p>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Rechercher un créateur par nom ou username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 bg-[#1A1A1A] border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
        />
      </div>

      {/* Tableau des Créateurs */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Créateur</th>
                <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Tarifs</th>
                <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Abonnés</th>
                <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Solde Actuel</th>
                <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Gains Totaux</th>
                <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Statut</th>
                <th className="text-right px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCreators.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    {search ? "Aucun créateur ne correspond à cette recherche." : "Aucun créateur enregistré pour le moment."}
                  </td>
                </tr>
              ) : (
                filteredCreators.map((creator) => (
                  <tr key={creator.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {creator.avatar_url ? (
                          <img src={creator.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold border border-white/10">
                            {(creator.full_name || creator.username || "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium flex items-center gap-2">
                            {creator.full_name || "Sans nom"}
                            {creator.is_verified && <ShieldCheck size={14} className="text-blue-500" />}
                          </p>
                          <p className="text-gray-500 text-sm">@{creator.username || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 space-y-1">
                        <p>Premium: <span className="text-white font-medium">{formatCurrency(creator.premium_price || 0)}</span></p>
                        <p>Pro: <span className="text-white font-medium">{formatCurrency(creator.pro_price || 0)}</span></p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-white font-medium">
                        <Users size={16} className="text-gray-500" />
                        {creator.followers_count || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${creator.balance > 0 ? "text-green-500" : "text-gray-500"}`}>
                        {formatCurrency(creator.balance)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-blue-400">
                        {formatCurrency(creator.total_earned)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        creator.is_banned === true ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                      }`}>
                        {creator.is_banned === true ? "Banni" : "Actif"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/admin/users/${creator.id}`)}
                          className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition"
                          title="Voir le profil détaillé"
                        >
                          <Eye size={16} />
                        </button>
                        
                        <button
                          onClick={() => handleToggleBan(creator)}
                          disabled={actionLoadingId === creator.id}
                          className={`p-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                            creator.is_banned === true
                              ? "hover:bg-green-500/10 text-gray-400 hover:text-green-500"
                              : "hover:bg-red-500/10 text-gray-400 hover:text-red-500"
                          }`}
                          title={creator.is_banned === true ? "Débannir ce créateur" : "Bannir ce créateur"}
                        >
                          {actionLoadingId === creator.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : creator.is_banned === true ? (
                            <ShieldCheck size={16} />
                          ) : (
                            <Ban size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}