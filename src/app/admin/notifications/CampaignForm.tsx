// src/app/admin/notifications/CampaignForm.tsx
'use client'; // ✅ Cette ligne dit à Next.js que ce composant peut utiliser onChange

import { Send } from 'lucide-react';
import { sendCampaign } from './actions';

export default function CampaignForm() {
  return (
    <form action={sendCampaign} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Titre de la notification</label>
        <input 
          name="title" 
          required
          placeholder="Ex: Mise à jour importante !" 
          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
        <textarea 
          name="message" 
          required
          rows={4}
          placeholder="Ex: Découvrez les nouvelles fonctionnalités..." 
          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#8B5CF6] transition-colors resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Cible</label>
        <select 
          name="targetType" 
          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
          onChange={(e) => {
            const specificInput = document.getElementById('specificUserId');
            if (specificInput) {
              specificInput.style.display = e.target.value === 'specific' ? 'block' : 'none';
            }
          }}
        >
          <option value="all">🌍 Tous les utilisateurs</option>
          <option value="fans">👥 Uniquement les Fans</option>
          <option value="creators">🎥 Uniquement les Créateurs</option>
          <option value="specific">🎯 Utilisateur spécifique (par ID)</option>
        </select>
      </div>

      <div id="specificUserId" className="hidden">
        <label className="block text-sm font-medium text-gray-300 mb-2">ID de l'utilisateur</label>
        <input 
          name="targetUserId" 
          placeholder="Collez l'UUID ici" 
          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
        />
      </div>

      <button 
        type="submit" 
        className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 mt-4"
      >
        <Send className="w-4 h-4" />
        Envoyer la campagne
      </button>
    </form>
  );
}