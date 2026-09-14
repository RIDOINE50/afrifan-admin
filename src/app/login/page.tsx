"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Crown, Eye, EyeOff, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // 1. Connexion avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        setError("Email ou mot de passe incorrect")
        setLoading(false)
        return
      }

      // 2. Vérifier que l'utilisateur est bien un admin
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single()

      if (profileError || !profile || profile.role !== "admin") {
        // Si pas admin, on déconnecte immédiatement
        await supabase.auth.signOut()
        setError("Accès réservé aux administrateurs")
        setLoading(false)
        return
      }

      // 3. Rediriger vers le dashboard admin
      router.push("/admin")
    } catch (err) {
      setError("Une erreur est survenue")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center">
            <Crown size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Afrifan</h1>
            <p className="text-gray-500 text-sm">Espace Administrateur</p>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-2">Connexion</h2>
          <p className="text-gray-500 text-sm mb-6">Entrez vos identifiants pour accéder au panel admin</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@afrifan.com"
                required
                className="w-full bg-[#0A0A0A] border border-white/10 text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500 transition"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0A0A0A] border border-white/10 text-white text-sm rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-violet-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-700 disabled:text-gray-400 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          © 2025 Afrifan. Tous droits réservés.
        </p>
      </div>
    </div>
  )
}