"use client"

import { Check, X, User, Calendar, Loader2, CreditCard, FileText } from "lucide-react"
import { useState } from "react"
import { updateCreatorApplication } from "@/app/admin/actions"

// Type adapté à TA vraie base de données
type Application = {
  id: string
  user_id: string
  full_name?: string
  category?: string
  city?: string
  id_card_url?: string
  selfie_url?: string
  payment_method?: string
  payment_account_number?: string
  payment_holder_name?: string
  status?: string
  created_at: string
  [key: string]: unknown
}

export default function CreatorsClient({ applications }: { applications: Application[] }) {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Ne garder que les demandes en attente
  const pendingApps = applications.filter(app => app.status === 'pending' || !app.status)
  const handleAction = async (action: "approve" | "reject") => {
    if (!selectedApp) return
    setIsProcessing(true)
    
    const result = await updateCreatorApplication(selectedApp.id, selectedApp.user_id, action)
    
    if (result.success) {
      setSelectedApp(null) // Ferme la modale et la page se rafraîchit
    } else {
      alert("Erreur : " + result.message)
    }
    setIsProcessing(false)
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Demandes de Créateurs</h1>
      <p className="text-gray-500 mb-8">{pendingApps.length} demande(s) en attente de validation</p>

      {pendingApps.length === 0 ? (
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-12 text-center">
          <p className="text-gray-500">Aucune demande en attente pour le moment. 🎉</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingApps.map((app) => (
            <div 
              key={app.id} 
              className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 hover:border-violet-500/50 transition cursor-pointer"
              onClick={() => setSelectedApp(app)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <Calendar size={14} />
                  {new Date(app.created_at).toLocaleDateString("fr-FR")}
                </div>
                <span className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-500 text-xs font-medium">
                  En attente
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold">
                  {(app.full_name || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{app.full_name || "Utilisateur"}</p>
                  <p className="text-gray-500 text-xs">{app.category || "Catégorie non spécifiée"}</p>
                </div>
              </div>

              <button className="w-full bg-green-600/20 hover:bg-green-600/30 text-green-500 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                <Check size={16} /> Voir & Valider
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODALE DE DÉTAILS */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => !isProcessing && setSelectedApp(null)}>
          <div className="bg-[#1A1A1A] border border-white/10 rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Détails de la demande</h2>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Colonne Gauche : Identité */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <FileText size={18} className="text-violet-500" /> Identité
                </h3>
                
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-2">Pièce d identité</p>
                  {selectedApp.id_card_url ? (
                    <a href={selectedApp.id_card_url} target="_blank" rel="noopener noreferrer">
                      <img src={selectedApp.id_card_url} alt="CNI" className="w-full h-48 object-cover rounded-lg border border-white/10 hover:opacity-90 transition" />
                    </a>
                  ) : <p className="text-gray-500 text-sm bg-white/5 p-4 rounded-lg text-center">Aucun document</p>}
                </div>


                <div>
                  <p className="text-gray-500 text-xs uppercase mb-2">Selfie avec pièce</p>
                  {selectedApp.selfie_url ? (
                    <a href={selectedApp.selfie_url} target="_blank" rel="noopener noreferrer">
                      <img src={selectedApp.selfie_url} alt="Selfie" className="w-full h-48 object-cover rounded-lg border border-white/10 hover:opacity-90 transition" />
                    </a>
                  ) : <p className="text-gray-500 text-sm bg-white/5 p-4 rounded-lg text-center">Aucun document</p>}
                </div>
              </div>

              {/* Colonne Droite : Infos & Paiement */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <User size={18} className="text-violet-500" /> Informations
                </h3>
                <div className="bg-white/5 p-4 rounded-lg space-y-3">
                  <div>
                    <p className="text-gray-500 text-xs">Nom complet</p>
                    <p className="text-white text-sm">{selectedApp.full_name || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Catégorie</p>
                    <p className="text-white text-sm">{selectedApp.category || "Non renseignée"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Ville</p>
                    <p className="text-white text-sm">{selectedApp.city || "Non renseignée"}</p>
                  </div>
                </div>

                <h3 className="text-white font-semibold flex items-center gap-2 mt-6">
                  <CreditCard size={18} className="text-green-500" /> Paiement (Pour futurs retraits)
                </h3>
                <div className="bg-white/5 p-4 rounded-lg space-y-3">
                  <div>
                    <p className="text-gray-500 text-xs">Méthode</p>
                    <p className="text-white text-sm capitalize">{selectedApp.payment_method || "Non renseignée"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Nom du titulaire</p>
                    <p className="text-white text-sm">{selectedApp.payment_holder_name || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Numéro de compte / Téléphone</p>
                    <p className="text-white text-sm font-mono">{selectedApp.payment_account_number || "Non renseigné"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
              <button 
                onClick={() => handleAction("approve")}
                disabled={isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />} 
                Valider et rendre Créateur
              </button>
              <button 
                onClick={() => handleAction("reject")}
                disabled={isProcessing}
                className="flex-1 bg-red-600/20 hover:bg-red-600/30 disabled:opacity-50 text-red-500 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <X size={20} />} 
                Refuser la demande
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}