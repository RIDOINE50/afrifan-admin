// src/app/admin/content/page.tsx

import { supabaseAdmin } from "@/lib/supabase"
import PostsListClient from "./PostsListClient"

export const dynamic = "force-dynamic"

interface PostData {
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
  user_id: string
  user: { full_name: string; username: string } | null
}

export default async function ContentPage() {
  // 1. Récupérer tous les posts
  const { data: posts, error: postsError } = await supabaseAdmin
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })

  if (postsError) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <h2 className="text-red-500 font-semibold mb-2">Erreur de chargement du contenu</h2>
          <p className="text-gray-400">{postsError.message}</p>
        </div>
      </div>
    )
  }

  // 2. Récupérer tous les profils
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, username")

  if (profilesError) {
    console.error("Erreur chargement profils:", profilesError)
  }

  // 3. Créer un map pour associer rapidement les profils aux posts
  const profilesMap = new Map(
    (profiles || []).map((p) => [p.id, { full_name: p.full_name, username: p.username }])
  )

  // 4. Associer chaque post à son profil
  const postsWithUsers: PostData[] = (posts || []).map((post) => ({
    ...post,
    user: profilesMap.get(post.user_id) || null
  }))

  return <PostsListClient posts={postsWithUsers} />
}