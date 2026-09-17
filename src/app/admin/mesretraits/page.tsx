"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Calendar, Filter, Download, CheckCircle, XCircle, AlertCircle, Clock, Loader2 } from "lucide-react"

interface Withdrawal {
  id: string
  creator_id: string
  amount: number
  payment_method: string
  account_number: string
  status: "pending" | "completed" | "rejected" | "failed"
  created_at: string
  profiles: {
    full_name: string
    username: string
  } | null
}

// ✅ CORRECTION : Ajout du '|' manquant ici
type Period = "1m" | "3m" | "6m" | "1y" | "all"
type StatusFilter = "all" | "completed" | "rejected" | "failed" | "pending"

export default function MesRetraitsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<Period>("1m")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  // Fonction pour calculer la date de début en fonction de la période
  const getStartDate = (p: Period) => {
    const date = new Date()
    if (p === "1m") date.setMonth(date.getMonth() - 1)
    else if (p === "3m") date.setMonth(date.getMonth() - 3)
    else if (p === "6m") date.setMonth(date.getMonth() - 6)
    else if (p === "1y") date.setFullYear(date.getFullYear() - 1)
    // "all" ne modifie pas la date, on récupère tout
    return date.toISOString()
  }

  const loadWithdrawals = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from("withdrawals")
        .select(`
          id,
          creator_id,
          amount,
          payment_method,
          account_number,
          status,
          created_at,
          profiles:creator_id (full_name, username)
        `)
        .gte("created_at", getStartDate(period))
        .order("created_at", { ascending: false })
        .limit(100) // Limite à 100 pour les performances

      // Ajouter le filtre de statut si ce n'est pas "all"
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter)
      }

      const { data, error } = await query

      if (error) throw error

      // ✅ CORRECTION TYPE : Supabase renvoie 'profiles' en tableau, on déballe [0]
      const formatted: Withdrawal[] = (data || []).map((w: any) => ({
        ...w,
        profiles: Array.isArray(w.profiles) ? w.profiles[0] ?? null : w.profiles ?? null,
      }))

      setWithdrawals(formatted)
    } catch (error) {
      console.error("❌ Erreur chargement historique retraits:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Recharger les données quand les filtres changent
  useEffect(() => {
    loadWithdrawals()
  }, [period, statusFilter])

  // Calculer le total retiré sur la période sélectionnée
  const totalAmount = withdrawals.reduce((sum, w) => sum + w.amount, 0)
  const completedCount = withdrawals.filter((w) => w.status === "completed").length

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatMoney = (amount: number) => {
    return `${amount.toLocaleString("fr-FR")} FCFA`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500"><CheckCircle size={14} /> Terminé</span>
      case "rejected":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500"><XCircle size={14} /> Refusé</span>
      case "failed":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500"><AlertCircle size={14} /> Échoué</span>
      case "pending":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500"><Clock size={14} /> En attente</span>
      default:
        return <span className="text-gray-500 text-xs">{status}</span>
    }
  }

  return (
    <div className="p-8 min-h-screen bg-[#0A0A0A] text-white">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Historique des Retraits</h1>
        <p className="text-gray-500">Consultez et filtrez toutes les demandes de retrait des créateurs.</p>
      </div>

      {/* Stats de la période */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-violet-600/10 rounded-lg">
            <Download className="text-violet-500" size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Total Retiré (Période)</p>
            <p className="text-2xl font-bold text-white">{formatMoney(totalAmount)}</p>
          </div>
        </div>
        
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-green-600/10 rounded-lg">
            <CheckCircle className="text-green-500" size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Retraits Validés</p>
            <p className="text-2xl font-bold text-white">{completedCount}</p>
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-600/10 rounded-lg">
            <Calendar className="text-blue-500" size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Nombre Total de Demandes</p>
            <p className="text-2xl font-bold text-white">{withdrawals.length}</p>
          </div>
        </div>
      </div>

      {/* Barre de Filtres */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Filter size={18} className="text-gray-500 shrink-0" />
          <span className="text-sm text-gray-400 shrink-0">Période :</span>
          <div className="flex gap-2">
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
                  period === p.value
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm text-gray-400 shrink-0">Statut :</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="bg-[#0A0A0A] border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="completed">Terminés</option>
            <option value="pending">En attente</option>
            <option value="rejected">Refusés</option>
            <option value="failed">Échoués</option>
          </select>
        </div>
      </div>

      {/* Tableau des Retraits */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-violet-500" size={32} />
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">Aucun retrait trouvé pour cette période et ce statut.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Créateur</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Montant</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Méthode</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Compte</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">
                      {formatDate(w.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium text-sm">{w.profiles?.full_name || "Inconnu"}</p>
                        <p className="text-gray-500 text-xs">@{w.profiles?.username || "—"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-bold text-sm">{formatMoney(w.amount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300 capitalize">{w.payment_method || "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-400 font-mono">{w.account_number || "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(w.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}