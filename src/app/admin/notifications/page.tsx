// src/app/admin/notifications/page.tsx
import { supabaseAdmin } from '@/lib/supabase';
import { Bell, History, Users, User } from 'lucide-react';
import CampaignForm from './CampaignForm'; // ✅ On importe le formulaire client

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(date);
};

export default async function AdminNotificationsPage() {
  // Récupérer l'historique (côté serveur, sécurisé)
  const { data: campaigns, error } = await supabaseAdmin
    .from('admin_campaigns')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Erreur chargement campagnes:', error);
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-[#8B5CF6]" />
            Notifications & Campagnes
          </h1>
          <p className="text-gray-400 mt-2">Envoyez des messages à vos utilisateurs et suivez l'historique.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLONNE GAUCHE : Le Formulaire (importé) */}
          <div className="lg:col-span-1">
            <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6 sticky top-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                Nouvelle Campagne
              </h2>
              <CampaignForm /> {/* ✅ Le formulaire interactif est ici */}
            </div>
          </div> 

          {/* COLONNE DROITE : Historique */}
          <div className="lg:col-span-2">
            <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
              <div className="p-6 border-b border-[#2A2A2A] flex items-center gap-2">
                <History className="w-5 h-5 text-gray-400" />
                <h2 className="text-xl font-bold text-white">Historique des envois</h2>
              </div>
              
              <div className="divide-y divide-[#2A2A2A]">
                {!campaigns || campaigns.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Aucune campagne envoyée pour le moment.</p>
                  </div>
                ) : (
                  campaigns.map((camp: any) => (
                    <div key={camp.id} className="p-5 hover:bg-[#222222] transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          {camp.target_type === 'all' && <Users className="w-5 h-5 text-blue-400" />}
                          {camp.target_type === 'fans' && <Users className="w-5 h-5 text-green-400" />}
                          {camp.target_type === 'creators' && <Users className="w-5 h-5 text-orange-400" />}
                          {camp.target_type === 'specific' && <User className="w-5 h-5 text-purple-400" />}
                          
                          <div>
                            <h3 className="font-bold text-white">{camp.title}</h3>
                            <p className="text-sm text-gray-400 mt-1">{camp.message}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400">
                          Envoyé
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <History className="w-3 h-3" />
                          {formatDate(camp.created_at)}
                        </span>
                        <span className="bg-[#0A0A0A] px-2 py-1 rounded border border-[#2A2A2A]">
                          Cible : {camp.target_type === 'all' ? 'Tous' : camp.target_type === 'specific' ? `Utilisateur: ${camp.target_user_id?.slice(0, 8)}...` : camp.target_type}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}