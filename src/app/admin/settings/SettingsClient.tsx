"use client"

import { useState } from "react"
import { 
  Save, Eye, EyeOff, Settings as SettingsIcon, DollarSign, Users, 
  Shield, Bell, CreditCard, BarChart3, Globe, Database, Headphones
} from "lucide-react"

interface Setting {
  id: string
  category: string
  key: string
  value: string | null
  is_secret: boolean
}

interface SettingsClientProps {
  settings: Setting[]
}

const categories = [
  { id: "general", name: "Général", icon: SettingsIcon },
  { id: "finances", name: "Finances & Commissions", icon: DollarSign },
  { id: "users", name: "Utilisateurs & Inscriptions", icon: Users },
  { id: "moderation", name: "Modération & Sécurité", icon: Shield },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "payments", name: "Paiements", icon: CreditCard },
  { id: "analytics", name: "Statistiques & Analytics", icon: BarChart3 },
  { id: "seo", name: "SEO & Réseaux Sociaux", icon: Globe },
  { id: "backup", name: "Sauvegarde & Maintenance", icon: Database },
  { id: "support", name: "Support & Contact", icon: Headphones },
]

export default function SettingsClient({ settings }: SettingsClientProps) {
  const [activeCategory, setActiveCategory] = useState("general")
  const [localSettings, setLocalSettings] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    settings.forEach((s) => {
      initial[`${s.category}.${s.key}`] = s.value || ""
    })
    return initial
  })
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const toggleSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const updateSetting = (category: string, key: string, value: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      [`${category}.${key}`]: value
    }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: localSettings })
      })
      
      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error("Erreur sauvegarde:", error)
    } finally {
      setSaving(false)
    }
  }

  const renderInput = (category: string, key: string, label: string, type: "text" | "number" | "password" | "textarea" = "text", placeholder: string = "") => {
    const settingKey = `${category}.${key}`
    const value = localSettings[settingKey] || ""
    const isSecret = type === "password"
    const isVisible = showSecrets[settingKey]

    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
        <div className="relative">
          {type === "textarea" ? (
            <textarea
              value={value}
              onChange={(e) => updateSetting(category, key, e.target.value)}
              placeholder={placeholder}
              rows={3}
              className="w-full bg-[#0A0A0A] border border-white/10 text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-violet-500 transition resize-none"
            />
          ) : (
            <input
              type={isSecret && !isVisible ? "password" : "text"}
              value={value}
              onChange={(e) => updateSetting(category, key, e.target.value)}
              placeholder={placeholder}
              className="w-full bg-[#0A0A0A] border border-white/10 text-white text-sm rounded-lg px-4 py-2.5 pr-12 focus:outline-none focus:border-violet-500 transition"
            />
          )}
          {isSecret && (
            <button
              type="button"
              onClick={() => toggleSecret(settingKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
            >
              {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      </div>
    )
  }

  const renderToggle = (category: string, key: string, label: string) => {
    const settingKey = `${category}.${key}`
    const value = localSettings[settingKey] === "true"

    return (
      <div className="mb-6 flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <button
          type="button"
          onClick={() => updateSetting(category, key, value ? "false" : "true")}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            value ? "bg-violet-600" : "bg-gray-700"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              value ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    )
  }

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case "general":
        return (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Paramètres Généraux</h2>
            {renderInput("general", "platform_name", "Nom de la plateforme", "text", "Afrifan")}
            {renderInput("general", "platform_description", "Description", "textarea", "La plateforme de créateurs...")}
            {renderInput("general", "default_currency", "Devise par défaut", "text", "FCFA")}
            {renderInput("general", "default_language", "Langue par défaut", "text", "fr")}
            {renderInput("general", "timezone", "Fuseau horaire", "text", "Africa/Abidjan")}
          </div>
        )
      case "finances":
        return (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Finances & Commissions</h2>
            {renderInput("finances", "product_commission", "Commission sur produits (%)", "number", "10")}
            {renderInput("finances", "subscription_commission", "Commission sur abonnements (%)", "number", "15")}
            {renderInput("finances", "tip_commission", "Commission sur pourboires (%)", "number", "5")}
            {renderInput("finances", "min_withdrawal", "Montant minimum de retrait", "number", "5000")}
            {renderInput("finances", "withdrawal_delay", "Délai de traitement des retraits (heures)", "number", "24")}
            {renderInput("finances", "transaction_fee", "Frais de transaction (%)", "number", "2")}
          </div>
        )
      case "users":
        return (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Utilisateurs & Inscriptions</h2>
            {renderToggle("users", "allow_registration", "Autoriser les nouvelles inscriptions")}
            {renderToggle("users", "require_email_verification", "Vérification email obligatoire")}
            {renderToggle("users", "require_phone_verification", "Vérification téléphone obligatoire")}
            {renderInput("users", "default_suspension_days", "Durée de suspension par défaut (jours)", "number", "7")}
            {renderInput("users", "max_reports_before_hide", "Nombre max de signalements avant masquage", "number", "5")}
          </div>
        )
      case "moderation":
        return (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Modération & Sécurité</h2>
            {renderInput("moderation", "auto_hide_threshold", "Seuil de signalements pour masquage auto", "number", "10")}
            {renderToggle("moderation", "enable_comments", "Activer les commentaires globalement")}
            {renderInput("moderation", "banned_words", "Mots interdits (séparés par des virgules)", "textarea", "mot1,mot2,mot3")}
            {renderInput("moderation", "min_password_length", "Longueur minimum mot de passe", "number", "8")}
            {renderToggle("moderation", "require_2fa_admin", "2FA obligatoire pour les admins")}
          </div>
        )
      case "notifications":
        return (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Notifications</h2>
            {renderToggle("notifications", "enable_email_notifications", "Activer les notifications par email")}
            {renderToggle("notifications", "enable_push_notifications", "Activer les notifications push")}
            {renderInput("notifications", "smtp_host", "Serveur SMTP", "text", "smtp.gmail.com")}
            {renderInput("notifications", "smtp_port", "Port SMTP", "number", "587")}
            {renderInput("notifications", "smtp_username", "Nom d'utilisateur SMTP", "text", "")}
            {renderInput("notifications", "smtp_password", "Mot de passe SMTP", "password", "")}
          </div>
        )
      case "payments":
        return (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Paiements</h2>
            {renderToggle("payments", "enable_mobile_money", "Activer Mobile Money")}
            {renderToggle("payments", "enable_card_payment", "Activer paiement par carte")}
            {renderInput("payments", "payment_api_key", "Clé API passerelle de paiement", "password", "")}
            {renderInput("payments", "payment_secret_key", "Clé secrète passerelle de paiement", "password", "")}
            {renderInput("payments", "payment_webhook_url", "URL Webhook paiement", "text", "")}
          </div>
        )
      case "analytics":
        return (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Statistiques & Analytics</h2>
            {renderToggle("analytics", "enable_view_tracking", "Activer le tracking des vues")}
            {renderInput("analytics", "data_retention_days", "Durée de rétention des données (jours)", "number", "365")}
            {renderInput("analytics", "google_analytics_id", "Google Analytics ID", "text", "G-XXXXXXXXXX")}
          </div>
        )
      case "seo":
        return (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">SEO & Réseaux Sociaux</h2>
            {renderInput("seo", "meta_description", "Meta description", "textarea", "Description de votre site...")}
            {renderInput("seo", "meta_keywords", "Meta keywords (séparés par des virgules)", "textarea", "mot1,mot2,mot3")}
            {renderInput("seo", "facebook_url", "URL Facebook", "text", "https://facebook.com/...")}
            {renderInput("seo", "instagram_url", "URL Instagram", "text", "https://instagram.com/...")}
            {renderInput("seo", "twitter_url", "URL Twitter/X", "text", "https://twitter.com/...")}
          </div>
        )
      case "backup":
        return (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Sauvegarde & Maintenance</h2>
            {renderInput("backup", "backup_frequency", "Fréquence des sauvegardes (heures)", "number", "24")}
            {renderToggle("backup", "maintenance_mode", "Mode maintenance activé")}
            {renderInput("backup", "maintenance_message", "Message de maintenance", "textarea", "Nous effectuons une maintenance...")}
          </div>
        )
      case "support":
        return (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Support & Contact</h2>
            {renderInput("support", "support_email", "Email de support", "text", "support@afrifan.com")}
            {renderInput("support", "support_phone", "Téléphone de support", "text", "+225 XX XX XX XX")}
            {renderInput("support", "support_address", "Adresse physique", "textarea", "Abidjan, Côte d'Ivoire")}
            {renderInput("support", "support_hours", "Horaires d'ouverture", "text", "Lun-Ven 9h-18h")}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-8 min-h-screen bg-[#0A0A0A] text-white">
      {/* En-tête */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Paramètres de la Plateforme</h1>
          <p className="text-gray-500">Configurez tous les aspects de votre application</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
            saved
              ? "bg-green-600 text-white"
              : saving
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-violet-600 hover:bg-violet-700 text-white"
          }`}
        >
          <Save size={18} />
          {saved ? "Sauvegardé !" : saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Navigation latérale */}
        <div className="w-64 shrink-0">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-2 sticky top-8">
            {categories.map((cat) => {
              const Icon = cat.icon
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
                    isActive
                      ? "bg-violet-600 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{cat.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 bg-[#1A1A1A] border border-white/10 rounded-xl p-8">
          {renderCategoryContent()}
        </div>
      </div>
    </div>
  )
}