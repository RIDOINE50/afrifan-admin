"use client"

import { useState } from "react"
import { Search, Ban, Eye, MoreVertical, Loader2, ShieldCheck } from "lucide-react"
import { Profile } from "@/lib/types"
import Link from "next/link"
import { banUserAction, unbanUserAction } from "@/app/admin/actions"

// ✅ Type étendu pour inclure is_banned sans toucher à lib/types
type ProfileWithBan = Profile & { is_banned?: boolean }

export default function UsersClient({ profiles }: { profiles: ProfileWithBan[] }) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "users" | "creators" | "banned">("all")
  
  // ✅ États pour gérer l'interface dynamiquement sans recharger la page
  const [localProfiles, setLocalProfiles] = useState<ProfileWithBan[]>(profiles)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // ✅ FILTRAGE CORRIGÉ : On utilise is_banned, pas le rôle
  const filteredProfiles = localProfiles.filter((profile) => {
    const matchesSearch =
      (profile.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (profile.username || "").toLowerCase().includes(search.toLowerCase())

    let matchesFilter = true
    if (filter === "users") matchesFilter = (profile.role === "user" || !profile.role) && !profile.is_banned
    if (filter === "creators") matchesFilter = profile.role === "creator" && !profile.is_banned
    if (filter === "banned") matchesFilter = profile.is_banned === true // ✅ C'est ici que ça change

    return matchesSearch && matchesFilter
  })

  const getRoleColor = (role: string | null | undefined) => {
    switch (role) {
      case "creator": return "bg-violet-600/10 text-violet-500"
      case "admin": return "bg-red-600/10 text-red-500"
      default: return "bg-blue-600/10 text-blue-500" // Les utilisateurs bannis gardent leur couleur de rôle d'origine
    }
  }

  const getRoleLabel = (role: string | null | undefined) => {
    switch (role) {
      case "creator": return "Créateur"
      case "admin": return "Admin"
      default: return "Utilisateur"
    }
  }

  // ✅ Fonction pour Bannir un utilisateur
  const handleBan = async (profile: ProfileWithBan) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir bannir ${profile.full_name || profile.username} ?\nIl sera déconnecté et ne pourra plus se connecter.`)) return

    setActionLoadingId(profile.id)
    try {
      const result = await banUserAction(profile.id)
      if (!result.success) throw new Error(result.message)

      // Mise à jour instantanée de l'interface (Optimistic UI) : on change is_banned, PAS le rôle
      setLocalProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, is_banned: true } : p))
    } catch (error) {
      console.error("Erreur bannissement:", error)
      alert("Erreur lors du bannissement.")
    } finally {
      setActionLoadingId(null)
    }
  }

  // ✅ Fonction pour Débannir un utilisateur
  const handleUnban = async (profile: ProfileWithBan) => {
    if (!window.confirm(`Voulez-vous vraiment débannir ${profile.full_name || profile.username} ?`)) return

    setActionLoadingId(profile.id)
    try {
      const result = await unbanUserAction(profile.id)
      if (!result.success) throw new Error(result.message)

      // Mise à jour instantanée : on remet is_banned à false, le rôle reste intact (ex: un créateur reste créateur)
      setLocalProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, is_banned: false } : p))
    } catch (error) {
      console.error("Erreur débannissement:", error)
      alert("Erreur lors du débannissement.")
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Utilisateurs</h1>
        <p className="text-gray-500">
          Gère les {localProfiles.length} utilisateurs de la plateforme Afrifan
        </p>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom ou username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="flex gap-2">
          {(["all", "users", "creators", "banned"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                filter === f
                  ? "bg-violet-600 text-white"
                  : "bg-[#1A1A1A] border border-white/10 text-gray-400 hover:bg-white/5"
              }`}
            >
              {f === "all" ? "Tous" : f === "users" ? "Utilisateurs" : f === "creators" ? "Créateurs" : "Bannis"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1A1A1A] border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-xs mb-1">Total</p>
          <p className="text-2xl font-bold text-white">{localProfiles.length}</p>
        </div>
        <div className="bg-[#1A1A1A] border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-xs mb-1">Utilisateurs actifs</p>
          <p className="text-2xl font-bold text-blue-500">
            {localProfiles.filter((p) => (p.role === "user" || !p.role) && !p.is_banned).length}
          </p>
        </div>
        <div className="bg-[#1A1A1A] border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-xs mb-1">Créateurs actifs</p>
          <p className="text-2xl font-bold text-violet-500">
            {localProfiles.filter((p) => p.role === "creator" && !p.is_banned).length}
          </p>
        </div>
        <div className="bg-[#1A1A1A] border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-xs mb-1">Bannis</p>
          <p className="text-2xl font-bold text-red-500">
            {/* ✅ COMPTE LES is_banned, PAS LES RÔLES */}
            {localProfiles.filter((p) => p.is_banned === true).length}
          </p>
        </div>
      </div>

      {/* Table des utilisateurs */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Utilisateur</th>
              <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Rôle</th>
              <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Inscrit le</th>
              <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Statut</th>
              <th className="text-right px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProfiles.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">
                  {search ? "Aucun utilisateur trouvé pour cette recherche" : "Aucun utilisateur"}
                </td>
              </tr>
            ) : (
              filteredProfiles.map((profile) => (
                <tr key={profile.id} className="border-t border-white/5 hover:bg-white/5 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.full_name || ""} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold">
                          {(profile.full_name || profile.username || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{profile.full_name || "Sans nom"}</p>
                        <p className="text-gray-500 text-sm">@{profile.username || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(profile.role)}`}>
                      {getRoleLabel(profile.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {profile.created_at 
                      ? new Date(profile.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
                      : "Date inconnue"
                    }
                  </td>
                  <td className="px-6 py-4">
                    {/* ✅ AFFICHAGE DU STATUT BASÉ SUR is_banned */}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      profile.is_banned === true ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                    }`}>
                      {profile.is_banned === true ? "Banni" : "Actif"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/users/${profile.id}`}
                        className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition"
                        title="Voir le profil"
                      >
                        <Eye size={16} />
                      </Link>
                      
                      {/* ✅ BOUTON BANNIR / DÉBANNIR BASÉ SUR is_banned */}
                      {profile.is_banned === true ? (
                        <button
                          onClick={() => handleUnban(profile)}
                          disabled={actionLoadingId === profile.id}
                          className="p-2 rounded-lg hover:bg-green-500/10 text-gray-400 hover:text-green-500 transition disabled:opacity-50"
                          title="Débannir l'utilisateur"
                        >
                          {actionLoadingId === profile.id ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBan(profile)}
                          disabled={actionLoadingId === profile.id}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition disabled:opacity-50"
                          title="Bannir l'utilisateur"
                        >
                          {actionLoadingId === profile.id ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
                        </button>
                      )}

                      <button
                        className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition"
                        title="Plus d'options"
                      >
                        <MoreVertical size={16} />
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
  )
}