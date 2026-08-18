export type Profile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  role: string | null
  is_verified: boolean | null
  created_at: string
}

export type Post = {
  id: string
  user_id: string
  content: string | null
  media_url: string | null
  media_type: string | null
  likes_count: number | null
  comments_count: number | null
  created_at: string
}

export type AuthUserInfo = {
  email: string | null
  lastSignIn: string | null
  createdAt: string | null
}