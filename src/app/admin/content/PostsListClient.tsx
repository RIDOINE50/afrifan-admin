"use client"

import { useState } from "react"
import { 
  Image as ImageIcon, Video, Music, FileText, Search, Filter, 
  Eye, Heart, MessageCircle, Share2, AlertTriangle, EyeOff, Eye as EyeIcon, MoreHorizontal
} from "lucide-react"

interface Post {
  id: string
  title: string | null
  content: string
  media_type: string
  content_type: string
  views_count: number
  likes_count: number
  comments_count: number
  shares_count: number
  report_count: number
  access_level: string
  is_hidden: boolean
  created_at: string
  user: { full_name: string; username: string } | null
}

type MediaTypeFilter = "all" | "image" | "video" | "audio" | "text"
type AccessFilter = "all" | "Public" | "Private"
type HiddenFilter = "all" | "hidden" | "visible"

export default function PostsListClient({ posts }: { posts: Post[] }) {
  const [search, setSearch] = useState("")
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaTypeFilter>("all")
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("all")
  const [hiddenFilter, setHiddenFilter] = useState<HiddenFilter>("all")

  // Filtrage
  const filteredPosts = posts.filter((p) => {
    const matchesSearch = search === "" || 
      (p.title || "").toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase()) ||
      (p.user?.username || "").toLowerCase().includes(search.toLowerCase())
    
    const matchesMedia = mediaTypeFilter === "all" || p.media_type === mediaTypeFilter
    const matchesAccess = accessFilter === "all" || p.access_level === accessFilter
    const matchesHidden = hiddenFilter === "all" || 
      (hiddenFilter === "hidden" && p.is_hidden) || 
      (hiddenFilter === "visible" && !p.is_hidden)

    return matchesSearch && matchesMedia && matchesAccess && matchesHidden
  })

  // Statistiques globales
  const totalPosts = filteredPosts.length
  const totalViews = filteredPosts.reduce((sum, p) => sum + (p.views_count || 0), 0)
  const totalLikes = filteredPosts.reduce((sum, p) => sum + (p.likes_count || 0), 0)
  const totalReports = filteredPosts.reduce((sum, p) => sum + (p.report_count || 0), 0)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    })
  }

  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case "video": return <Video size={14} className="text-blue-400" />
      case "image": return <ImageIcon size={14} className="text-green-400" />
      case "audio": return <Music size={14} className="text-purple-400" />
      default: return <FileText size={14} className="text-gray-400" />
    }
  }

  return (
    <div className="p-8 min-h-screen bg-[#0A0A0A] text-white">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Gestion du Contenu</h1>
        <p className="text-gray-500">Surveillez et modérez tous les posts publiés sur la plateforme.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-violet-600/10 rounded-lg"><ImageIcon className="text-violet-500" size={24} /></div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Total Posts</p>
            <p className="text-2xl font-bold text-white">{totalPosts}</p>
          </div>
        </div>
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-600/10 rounded-lg"><Eye className="text-blue-500" size={24} /></div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Vues Totales</p>
            <p className="text-2xl font-bold text-white">{totalViews.toLocaleString("fr-FR")}</p>
          </div>
        </div>
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-pink-600/10 rounded-lg"><Heart className="text-pink-500" size={24} /></div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Likes Totaux</p>
            <p className="text-2xl font-bold text-white">{totalLikes.toLocaleString("fr-FR")}</p>
          </div>
        </div>
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-red-600/10 rounded-lg"><AlertTriangle className="text-red-500" size={24} /></div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Signalements</p>
            <p className="text-2xl font-bold text-white">{totalReports}</p>
          </div>
        </div>
      </div>

      {/* Barre de Filtres */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-4 mb-6 flex flex-col xl:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Rechercher (titre, contenu, utilisateur)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-violet-500 transition"
            />
          </div>

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
              <option value="text">Texte</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full xl:w-auto">
          <select
            value={accessFilter}
            onChange={(e) => setAccessFilter(e.target.value as AccessFilter)}
            className="bg-[#0A0A0A] border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
          >
            <option value="all">Tous accès</option>
            <option value="Public">Public</option>
            <option value="Private">Privé</option>
          </select>
          <select
            value={hiddenFilter}
            onChange={(e) => setHiddenFilter(e.target.value as HiddenFilter)}
            className="bg-[#0A0A0A] border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
          >
            <option value="all">Visibilité</option>
            <option value="visible">Visible</option>
            <option value="hidden">Masqué</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-500">Aucun post ne correspond à ces critères.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Post</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Créateur</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Stats</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Accès</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">État</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="text-right px-6 py-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 max-w-xs">
                        <p className="text-white font-medium text-sm truncate">{post.title || "Sans titre"}</p>
                        <p className="text-gray-500 text-xs truncate">{post.content}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-gray-500 bg-white/5 px-2 py-0.5 rounded w-fit">
                          {getMediaTypeIcon(post.media_type)}
                          {post.media_type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium text-sm">{post.user?.full_name || "Inconnu"}</p>
                      <p className="text-gray-500 text-xs">@{post.user?.username || "—"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Eye size={12} /> {post.views_count}</span>
                        <span className="flex items-center gap-1"><Heart size={12} /> {post.likes_count}</span>
                        {post.report_count > 0 && (
                          <span className="flex items-center gap-1 text-red-400 font-medium">
                            <AlertTriangle size={12} /> {post.report_count} signalements
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded ${post.access_level === 'Public' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {post.access_level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {post.is_hidden ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-red-500/10 text-red-500">
                          <EyeOff size={12} /> Masqué
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-500/10 text-green-500">
                          <EyeIcon size={12} /> Visible
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                      {formatDate(post.created_at)}
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
        Affichage de {filteredPosts.length} post{filteredPosts.length > 1 ? "s" : ""} sur {posts.length} au total
      </div>
    </div>
  )
}