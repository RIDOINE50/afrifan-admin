import { supabaseAdmin } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { Profile, Post, AuthUserInfo } from "@/lib/types"
import UserDetailClient from "./UserDetailClient"

export const dynamic = "force-dynamic"

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // 1. Profil de l'utilisateur
  const { data: profileData } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single()

  if (!profileData) {
    notFound()
  }

  const profile = profileData as unknown as Profile

  // 2. Infos auth (email, dernière connexion)
  let authUser: AuthUserInfo | null = null
  try {
    const { data } = await supabaseAdmin.auth.admin.getUserById(id)
    if (data.user) {
      authUser = {
        email: data.user.email || null,
        lastSignIn: data.user.last_sign_in_at || null,
        createdAt: data.user.created_at || null,
      }
    }
  } catch (e) {
    // Pas bloquant si ça échoue
  }

  // 3. Publications de l'utilisateur
  const { data: postsData } = await supabaseAdmin
    .from("posts")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false })

  const posts = (postsData || []) as unknown as Post[]

  // 4. Nombre d'abonnés (followers)
  const { count: followersCount } = await supabaseAdmin
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", id)

  // 5. Nombre d'abonnements (following)
  const { count: followingCount } = await supabaseAdmin
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", id)

  // 6. Total de likes reçus
  const totalLikes = posts.reduce(
    (sum, p) => sum + (p.likes_count || 0),
    0
  )

  const stats = {
    postsCount: posts.length,
    totalLikes,
    followersCount: followersCount || 0,
    followingCount: followingCount || 0,
  }

  return (
    <UserDetailClient
      profile={profile}
      authUser={authUser}
      posts={posts}
      stats={stats}
    />
  )
}