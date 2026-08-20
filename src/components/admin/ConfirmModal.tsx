'use client';

import { useState } from 'react';

interface Withdrawal {
  id: string;
  creator_id: string;
  amount: number;
  payment_method: string;
  account_number: string;
  status: string;
  created_at: string;
  profiles: {
    username: string;
    full_name: string;
  };
}

interface ConfirmModalProps {
  withdrawal: Withdrawal;
  action: 'approve' | 'reject';
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
  formatMoney: (amount: number) => string;
  getPaymentMethodLabel: (method: string) => string;
}

export default function ConfirmModal({
  withdrawal,
  action,
  onConfirm,
  onCancel,
  formatMoney,
  getPaymentMethodLabel,
}: ConfirmModalProps) {
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const isApprove = action === 'approve';

  const handleConfirm = async () => {
    if (!isApprove && !reason.trim()) {
      alert('Veuillez saisir un motif de refus');
      return;
    }

    setIsProcessing(true);
    await onConfirm(isApprove ? undefined : reason);
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* ✅ FOND DE LA MODALE EN NOIR PROFOND (#1A1A1A) */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl max-w-lg w-full shadow-2xl">
        
        {/* Header avec couleur selon l'action */}
        <div
          className={`p-6 border-b border-[#2A2A2A] ${
            isApprove ? 'bg-green-600/10' : 'bg-red-600/10'
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl ${
                isApprove ? 'bg-green-600/20' : 'bg-red-600/20'
              }`}
            >
              {isApprove ? '✅' : '❌'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isApprove ? 'Valider le retrait' : 'Refuser le retrait'}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {isApprove
                  ? 'Confirmer le transfert vers le créateur'
                  : 'Indiquer le motif du refus'}
              </p>
            </div>
          </div>
        </div>

        {/* Détails du retrait */}
        <div className="p-6 space-y-4">
          {/* Créateur */}
          <div className="flex items-center justify-between py-3 border-b border-[#2A2A2A]">
            <span className="text-gray-400">Créateur</span>
            <span className="text-white font-semibold">
              {withdrawal.profiles?.full_name || withdrawal.profiles?.username}
            </span>
          </div>

          {/* Montant (VIOLET EXACT #8B5CF6) */}
          <div className="flex items-center justify-between py-3 border-b border-[#2A2A2A]">
            <span className="text-gray-400">Montant</span>
            <span className="text-2xl font-bold text-[#8B5CF6]">
              {formatMoney(withdrawal.amount)}
            </span>
          </div>

          {/* Méthode de paiement */}
          <div className="flex items-center justify-between py-3 border-b border-[#2A2A2A]">
            <span className="text-gray-400">Méthode</span>
            <span className="text-white font-medium">
              {getPaymentMethodLabel(withdrawal.payment_method)}
            </span>
          </div>

          {/* Numéro de compte */}
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-400">Numéro</span>
            <span className="text-white font-mono font-medium">
              {withdrawal.account_number}
            </span>
          </div>

          {/* Champ motif (uniquement pour refus) */}
          {!isApprove && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Motif du refus <span className="text-red-400">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Numéro de téléphone incorrect, solde insuffisant..."
                rows={3}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors resize-none"
              />
              
              {/* Suggestions de motifs */}
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  'Numéro incorrect',
                  'Compte bloqué',
                  'Vérification requise',
                  'Autre',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setReason(suggestion)}
                    className="px-3 py-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-gray-300 text-xs rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message d'avertissement pour validation */}
          {isApprove && (
            <div className="mt-4 p-4 bg-green-600/10 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-sm flex items-start gap-2">
                <span className="text-lg">💡</span>
                <span>
                  Le transfert sera simulé et le statut passera à Terminé. 
                  Le créateur recevra une notification de confirmation.
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="p-6 border-t border-[#2A2A2A] flex gap-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
              isApprove
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Traitement...
              </>
            ) : (
              <>
                <span>{isApprove ? '✅' : '❌'}</span>
                {isApprove ? 'Confirmer le transfert' : 'Refuser le retrait'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}