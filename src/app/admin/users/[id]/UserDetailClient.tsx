"use client"

import Link from "next/link"
import {
  ArrowLeft,
  Mail,
  Calendar,
  FileText,
  Heart,
  Users,
  UserPlus,
  Ban,
  ShieldCheck,
  MessageSquare,
  Hash,
} from "lucide-react"
import { Profile, Post, AuthUserInfo } from "@/lib/types"

type Props = {
  profile: Profile
  authUser: AuthUserInfo | null
  posts: Post[]
  stats: {
    postsCount: number
    totalLikes: number
    followersCount: number
    followingCount: number
  }
}

export default function UserDetailClient({ profile, authUser, posts, stats }: Props) {
  const statCards = [
    { label: "Publications", value: stats.postsCount, icon: FileText, color: "text-violet-500" },
    { label: "Likes reçus", value: stats.totalLikes, icon: Heart, color: "text-red-500" },
    { label: "Abonnés", value: stats.followersCount, icon: Users, color: "text-blue-500" },
    { label: "Abonnements", value: stats.followingCount, icon: UserPlus, color: "text-green-500" },
  ]

  return (
    <div className="p-8">
      {/* Bouton retour */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft size={18} />
        Retour aux utilisateurs
      </Link>

      {/* En-tête profil */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-violet-600 flex items-center justify-center text-white text-4xl font-bold">
              {(profile.full_name || profile.username || "?").charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">
              {profile.full_name || "Sans nom"}
            </h1>
            <p className="text-gray-500 mb-3">@{profile.username || "—"}</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-violet-600/10 text-violet-500 text-xs font-medium">
                {profile.role || "user"}
              </span>
              <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                Actif
              </span>
              {profile.is_verified && (
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium inline-flex items-center gap-1">
                  <ShieldCheck size={12} /> Vérifié
                </span>
              )}
            </div>
          </div>

          <button className="px-4 py-2 rounded-lg bg-red-600/20 text-red-500 hover:bg-red-600/30 text-sm font-medium inline-flex items-center gap-2">
            <Ban size={16} /> Bannir
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <Icon size={20} className={s.color} />
                <div>
                  <p className="text-gray-400 text-xs">{s.label}</p>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations personnelles */}
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Informations personnelles</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-gray-500 shrink-0" />
              <div>
                <p className="text-gray-500 text-xs">Email</p>
                <p className="text-white text-sm">{authUser?.email || "Non renseigné"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-gray-500 shrink-0" />
              <div>
                <p className="text-gray-500 text-xs">Inscrit le</p>
                <p className="text-white text-sm">
                  {new Date(profile.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
            {authUser?.lastSignIn && (
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-gray-500 shrink-0" />
                <div>
                  <p className="text-gray-500 text-xs">Dernière connexion</p>
                  <p className="text-white text-sm">
                    {new Date(authUser.lastSignIn).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Hash size={16} className="text-gray-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-gray-500 text-xs">ID utilisateur</p>
                <p className="text-white text-xs font-mono break-all">{profile.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Publications récentes */}
        <div className="lg:col-span-2 bg-[#1A1A1A] border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">
            Dernières publications ({posts.length})
          </h3>
          {posts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune publication</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {posts.slice(0, 6).map((post) => (
                <div key={post.id} className="bg-white/5 rounded-lg overflow-hidden">
                  {post.media_url ? (
                    <img src={post.media_url} alt="" className="w-full h-32 object-cover" />
                  ) : (
                    <div className="w-full h-32 bg-white/5 flex items-center justify-center text-gray-600">
                      <FileText size={24} />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-gray-300 text-xs line-clamp-2 mb-2">
                      {post.content || "(Sans légende)"}
                    </p>
                    <div className="flex items-center gap-3 text-gray-500 text-xs">
                      <span className="inline-flex items-center gap-1">
                        <Heart size={12} /> {post.likes_count || 0}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare size={12} /> {post.comments_count || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}