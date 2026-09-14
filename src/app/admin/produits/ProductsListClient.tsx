"use client"

import { useState } from "react"
import { 
  Package, DollarSign, TrendingUp, Archive, Search, Filter, 
  CheckCircle, Clock, Image as ImageIcon, Video, Music, FileText, MoreHorizontal
} from "lucide-react"

// Interface correspondant exactement à votre schéma Supabase + les stats calculées
interface Product {
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
  // Ces deux champs sont calculés côté serveur via la table 'purchases'
  sales_count: number
  total_revenue: number
}

type StatusFilter = "all" | "published" | "draft" | "archived"
type MediaTypeFilter = "all" | "video" | "image" | "file" | "audio"

export default function ProductsListClient({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaTypeFilter>("all")

  // Filtrage des produits
  const filteredProducts = products.filter((p) => {
    const matchesStatus = statusFilter === "all" || p.status === statusFilter
    const matchesMediaType = mediaTypeFilter === "all" || p.media_type === mediaTypeFilter
    const matchesSearch = search === "" || 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.creator?.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.creator?.username || "").toLowerCase().includes(search.toLowerCase())
    
    return matchesStatus && matchesMediaType && matchesSearch
  })

  // Statistiques globales
  const totalProducts = filteredProducts.length
  const publishedProducts = filteredProducts.filter((p) => p.status === "published").length
  const totalRevenue = filteredProducts.reduce((sum, p) => sum + Number(p.total_revenue), 0)
  const totalSales = filteredProducts.reduce((sum, p) => sum + Number(p.sales_count), 0)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "short", year: "numeric"
    })
  }

  const formatMoney = (amount: number) => {
    return `${Number(amount).toLocaleString("fr-FR")} FCFA`
  }

  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case "video": return <Video size={14} className="text-blue-400" />
      case "image": return <ImageIcon size={14} className="text-green-400" />
      case "audio": return <Music size={14} className="text-purple-400" />
      case "file": return <FileText size={14} className="text-orange-400" /> // Corrigé de "document" à "file"
      default: return <Package size={14} className="text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published": // Corrigé de "active" à "published"
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500"><CheckCircle size={14} /> Publié</span>
      case "draft":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500"><Clock size={14} /> Brouillon</span>
      case "archived":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400"><Archive size={14} /> Archivé</span>
      default:
        return <span className="text-gray-500 text-xs">{status}</span>
    }
  }

  return (
    <div className="p-8 min-h-screen bg-[#0A0A0A] text-white">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Gestion des Produits</h1>
        <p className="text-gray-500">Consultez et gérez tous les produits numériques publiés par les créateurs.</p>
      </div>

      {/* Stats de la période */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-violet-600/10 rounded-lg">
            <Package className="text-violet-500" size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Total Produits</p>
            <p className="text-2xl font-bold text-white">{totalProducts}</p>
          </div>
        </div>
        
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-green-600/10 rounded-lg">
            <CheckCircle className="text-green-500" size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Produits Publiés</p>
            <p className="text-2xl font-bold text-white">{publishedProducts}</p>
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-600/10 rounded-lg">
            <DollarSign className="text-blue-500" size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Revenus Générés</p>
            <p className="text-2xl font-bold text-white">{formatMoney(totalRevenue)}</p>
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-orange-600/10 rounded-lg">
            <TrendingUp className="text-orange-500" size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Ventes Totales</p>
            <p className="text-2xl font-bold text-white">{totalSales}</p>
          </div>
        </div>
      </div>

      {/* Barre de Filtres */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-4 mb-6 flex flex-col xl:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          {/* Recherche */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Rechercher un produit ou un créateur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-violet-500 transition"
            />
          </div>

          {/* Filtre Type de média */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500 shrink-0" />
            <select
              value={mediaTypeFilter}
              onChange={(e) => setMediaTypeFilter(e.target.value as MediaTypeFilter)}
              className="bg-[#0A0A0A] border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
            >
              <option value="all">Tous les médias</option>
              <option value="image">Images</option>
              <option value="video">Vidéos</option>
              <option value="audio">Audio</option>
              <option value="file">Fichiers</option> {/* Corrigé de "Documents" à "Fichiers" */}
            </select>
          </div>
        </div>

        {/* Filtre Statut */}
        <div className="flex items-center gap-2 w-full xl:w-auto">
          <span className="text-sm text-gray-400 shrink-0">Statut :</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="bg-[#0A0A0A] border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 w-full xl:w-auto"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publiés</option> {/* Corrigé de "Actifs" à "Publiés" */}
            <option value="draft">Brouillons</option>
            <option value="archived">Archivés</option>
          </select>
        </div>
      </div>

      {/* Tableau des Produits */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-500">Aucun produit ne correspond à ces critères.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Produit</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Créateur</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Prix</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Ventes</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Revenus</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Statut</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="text-right px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-white font-medium text-sm">{product.title}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-gray-500 bg-white/5 px-2 py-0.5 rounded w-fit">
                          {getMediaTypeIcon(product.media_type)}
                          {product.media_type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium text-sm">{product.creator?.full_name || "Inconnu"}</p>
                        <p className="text-gray-500 text-xs">@{product.creator?.username || "—"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-bold text-sm">{formatMoney(product.price)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300">{product.sales_count}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-green-400 font-medium">{formatMoney(product.total_revenue)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                      {formatDate(product.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-500 text-center">
        Affichage de {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""} sur {products.length} au total
      </div>
    </div>
  )
}