// src/app/admin/reports/page.tsx
import { supabaseAdmin } from '@/lib/supabase';
import { Flag, Trash2, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import { dismissReport, deleteTargetContent } from './actions';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(date);
};

export default async function AdminReportsPage() {
  // Récupérer les signalements avec les infos du rapporteur
  const { data: reports, error } = await supabaseAdmin
    .from('reports')
    .select(`
      id,
      target_id,
      target_type,
      reason,
      created_at,
      reporter:profiles!reports_reporter_id_fkey (full_name, username)
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Erreur chargement signalements:', error);
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Flag className="w-8 h-8 text-red-500" />
            Modération & Signalements
          </h1>
          <p className="text-gray-400 mt-2">Gérez les contenus et profils signalés par la communauté.</p>
        </div>

        {/* Liste des signalements */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="p-6 border-b border-[#2A2A2A] flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Signalements récents</h2>
            <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-sm font-bold">
              {reports?.length || 0} en attente
            </span>
          </div>
          
          <div className="divide-y divide-[#2A2A2A]">
            {!reports || reports.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
                <p className="text-lg font-medium">Aucun signalement en attente.</p>
                <p className="text-sm mt-1">Tout est calme sur la plateforme !</p>
              </div>
            ) : (
              reports.map((report: any) => {
                const reporterName = report.reporter?.full_name || report.reporter?.username || 'Utilisateur inconnu';
                const isPost = report.target_type === 'post';
                
                return (
                  <div key={report.id} className="p-5 hover:bg-[#222222] transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      
                      {/* Infos du signalement */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {isPost ? (
                            <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                              <EyeOff className="w-3 h-3" /> POST
                            </span>
                          ) : (
                            <span className="bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> PROFIL
                            </span>
                          )}
                          <span className="text-xs text-gray-500">{formatDate(report.created_at)}</span>
                        </div>
                        
                        <p className="text-white font-medium mb-1">
                          Signalé par : <span className="text-[#8B5CF6]">{reporterName}</span>
                        </p>
                        <p className="text-gray-300 text-sm mb-2">
                          <span className="text-gray-500">Motif :</span> {report.reason}
                        </p>
                        <p className="text-xs text-gray-500 font-mono bg-[#0A0A0A] inline-block px-2 py-1 rounded border border-[#2A2A2A]">
                          ID Cible : {report.target_id}
                        </p>
                      </div>

                      {/* Boutons d'action */}
                      <div className="flex flex-row md:flex-col gap-2 md:min-w-[160px]">
                        <form action={dismissReport.bind(null, report.id)}>
                          <button 
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#2A2A2A] hover:bg-[#333333] text-gray-300 rounded-lg text-sm font-medium transition-colors border border-[#3A3A3A]"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Ignorer
                          </button>
                        </form>
                        
                        <form action={deleteTargetContent.bind(null, report.target_id, report.target_type)}>
                          <button 
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            {isPost ? 'Supprimer le Post' : 'Bannir le Profil'}
                          </button>
                        </form>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}