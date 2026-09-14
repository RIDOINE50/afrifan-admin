"use client"

import { useState } from "react"
import { Filter, ShoppingBag, CheckCircle, XCircle, Clock, AlertCircle, DollarSign, FileText, Image as ImageIcon, Video, Music } from "lucide-react"

interface Purchase {
  id: string
  product_id: string
  buyer_id: string
  creator_id: string
  amount_paid: number
  currency: string
  payment_status: "pending" | "completed" | "failed" | "refunded"
  payment_method: string | null
  purchase_date: string
  buyer: { full_name: string; username: string } | null
  creator: { full_name: string; username: string } | null
  // ✅ Interface mise à jour avec les vraies colonnes de digital_products
  product: { title: string; media_type: string; price: number } | null
}

type Period = "1m" | "3m" | "6m" | "1y" | "all"
type StatusFilter = "all" | "completed" | "pending" | "failed" | "refunded"

export default function PurchasesListClient({ purchases }: { purchases: Purchase[] }) {
  const [period, setPeriod] = useState<Period>("1m")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [search, setSearch] = useState("")

  const getStartDate = (p: Period) => {
    const date = new Date()
    if (p === "1m") date.setMonth(date.getMonth() - 1)
    else if (p === "3m") date.setMonth(date.getMonth() - 3)
    else if (p === "6m") date.setMonth(date.getMonth() - 6)
    else if (p === "1y") date.setFullYear(date.getFullYear() - 1)
    return date.toISOString()
  }

  const filteredPurchases = purchases.filter((p) => {
    const isInPeriod = period === "all" || new Date(p.purchase_date) >= new Date(getStartDate(period))
    const matchesStatus = statusFilter === "all" || p.payment_status === statusFilter
    const matchesSearch = search === "" || 
      (p.buyer?.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.buyer?.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.product?.title || "").toLowerCase().includes(search.toLowerCase())
    return isInPeriod && matchesStatus && matchesSearch
  })

  // Statistiques
  const totalRevenue = filteredPurchases
    .filter((p) => p.payment_status === "completed")
    .reduce((sum, p) => sum + Number(p.amount_paid), 0)
  
  const totalPurchases = filteredPurchases.length
  const completedPurchases = filteredPurchases.filter((p) => p.payment_status === "completed").length
  const pendingPurchases = filteredPurchases.filter((p) => p.payment_status === "pending").length

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    })
  }

  const formatMoney = (amount: number) => {
    return `${Number(amount).toLocaleString("fr-FR")} FCFA`
  }

  // ✅ Badge pour le type de média
  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case "video": return <Video size={12} className="text-blue-400" />
      case "image": return <ImageIcon size={12} className="text-green-400" />
      case "audio": return <Music size={12} className="text-purple-400" />
      default: return <FileText size={12} className="text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500"><CheckCircle size={14} /> Complété</span>
      case "pending":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500"><Clock size={14} /> En attente</span>
      case "failed":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500"><XCircle size={14} /> Échoué</span>
      case "refunded":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500"><AlertCircle size={14} /> Remboursé</span>
      default:
        return <span className="text-gray-500 text-xs">{status}</span>
    }
  }

  return (
    <div className="p-8 min-h-screen bg-[#0A0A0A] text-white">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Historique des Achats</h1>
        <p className="text-gray-500">Consultez toutes les transactions de produits numériques sur la plateforme.</p>
      </div>

      {/* Stats de la période */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-violet-600/10 rounded-lg">
            <DollarSign className="text-violet-500" size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Revenus Totaux</p>
            <p className="text-2xl font-bold text-white">{formatMoney(totalRevenue)}</p>
          </div>
        </div>
        
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-600/10 rounded-lg">
            <ShoppingBag className="text-blue-500" size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Total Achats</p>
            <p className="text-2xl font-bold text-white">{totalPurchases}</p>
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-green-600/10 rounded-lg">
            <CheckCircle className="text-green-500" size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Complétés</p>
            <p className="text-2xl font-bold text-white">{completedPurchases}</p>
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-yellow-600/10 rounded-lg">
            <Clock className="text-yellow-500" size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">En Attente</p>
            <p className="text-2xl font-bold text-white">{pendingPurchases}</p>
          </div>
        </div>
      </div>

      {/* Barre de Filtres */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-4 mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Rechercher par acheteur ou produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500 shrink-0" />
            <span className="text-sm text-gray-400 shrink-0">Période :</span>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "1m", label: "1 Mois" },
                { value: "3m", label: "3 Mois" },
                { value: "6m", label: "6 Mois" },
                { value: "1y", label: "1 An" },
                { value: "all", label: "Tout" },
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value as Period)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    period === p.value ? "bg-violet-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <span className="text-sm text-gray-400 shrink-0">Statut :</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="bg-[#0A0A0A] border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 w-full lg:w-auto"
          >
            <option value="all">Tous les statuts</option>
            <option value="completed">Complétés</option>
            <option value="pending">En attente</option>
            <option value="failed">Échoués</option>
            <option value="refunded">Remboursés</option>
          </select>
        </div>
      </div>

      {/* Tableau des Achats */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden">
        {filteredPurchases.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-500">Aucun achat trouvé pour ces critères.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Produit</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Acheteur</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Créateur</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Montant</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Méthode</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">
                      {formatDate(purchase.purchase_date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-white font-medium text-sm">
                          {purchase.product?.title || "Produit inconnu"}
                        </p>
                        {/* ✅ Affichage du badge du type de média */}
                        {purchase.product?.media_type && (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-gray-500 bg-white/5 px-2 py-0.5 rounded w-fit">
                            {getMediaTypeIcon(purchase.product.media_type)}
                            {purchase.product.media_type}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium text-sm">{purchase.buyer?.full_name || "Inconnu"}</p>
                        <p className="text-gray-500 text-xs">@{purchase.buyer?.username || "—"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium text-sm">{purchase.creator?.full_name || "Inconnu"}</p>
                        <p className="text-gray-500 text-xs">@{purchase.creator?.username || "—"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-bold text-sm">{formatMoney(purchase.amount_paid)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300 capitalize">{purchase.payment_method || "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(purchase.payment_status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-500 text-center">
        Affichage de {filteredPurchases.length} achat{filteredPurchases.length > 1 ? "s" : ""} sur {purchases.length} total
      </div>
    </div>
  )
}