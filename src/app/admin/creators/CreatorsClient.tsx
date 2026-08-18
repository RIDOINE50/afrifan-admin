"use client"

import { Check, X, FileText, User, Calendar } from "lucide-react"
import { useState } from "react"

// On définit le type de base. Tu peux ajouter tes propres colonnes ici.
type Application = {
  id: string
  user_id: string
  status?: string
  documents?: string | string[] // Adapte selon si c'est un lien ou un JSON
  message?: string
  created_at: string
[key: string]: unknown // Permet d'accepter n'importe quelle autre colonne de ta table
}

export default function CreatorsClient({ applications }: { applications: Application[] }) {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Demandes de Créateurs</h1>
      <p className="text-gray-500 mb-8">
        {applications.length} demande(s) en attente de validation
      </p>

      {applications.length === 0 ? (
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-12 text-center">
          <p className="text-gray-500">Aucune demande en attente pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {applications.map((app) => (
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
                  <User size={18} />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Utilisateur</p>
                  <p className="text-gray-500 text-xs font-mono truncate max-w-[150px]">{app.user_id}</p>
                </div>
              </div>

              {app.message && (
                <p className="text-gray-400 text-sm mb-4 line-clamp-2 bg-white/5 p-2 rounded">
                  {app.message}
                </p>
              )}

              <div className="flex gap-2">
                <button className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-500 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                  <Check size={16} /> Valider
                </button>
                <button className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-500 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                  <X size={16} /> Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de détails (s'ouvre au clic sur une carte) */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setSelectedApp(null)}>
          <div className="bg-[#1A1A1A] border border-white/10 rounded-xl max-w-2xl w-full p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">Détails de la demande</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-xs uppercase mb-1">ID Utilisateur</p>
                <p className="text-white font-mono text-sm break-all">{selectedApp.user_id}</p>
              </div>

              {selectedApp.message && (
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-1">Message / Motivation</p>
                  <p className="text-white bg-white/5 p-3 rounded-lg text-sm">{selectedApp.message}</p>
                </div>
              )}

              {/* Affichage des documents (à adapter selon ta structure) */}
              <div>
                <p className="text-gray-500 text-xs uppercase mb-2">Documents envoyés</p>
                {selectedApp.documents ? (
                  <div className="bg-white/5 p-3 rounded-lg">
                    <pre className="text-gray-300 text-xs overflow-x-auto">
                      {JSON.stringify(selectedApp.documents, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Aucun document joint.</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2">
                <Check size={18} /> Valider le créateur
              </button>
              <button className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-500 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2">
                <X size={18} /> Refuser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}