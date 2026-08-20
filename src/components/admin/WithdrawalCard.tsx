'use client';

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

interface WithdrawalCardProps {
  withdrawal: Withdrawal;
  onApprove: (withdrawal: Withdrawal) => void;
  onReject: (withdrawal: Withdrawal) => void;
  formatDate: (dateString: string) => string;
  formatMoney: (amount: number) => string;
  getPaymentMethodLabel: (method: string) => string;
}

export default function WithdrawalCard({
  withdrawal,
  onApprove,
  onReject,
  formatDate,
  formatMoney,
  getPaymentMethodLabel,
}: WithdrawalCardProps) {
  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'mtn': return '📱';
      case 'orange': return '🍊';
      case 'wave': return '🌊';
      case 'moov': return '📞';
      default: return '💳';
    }
  };

  const getPaymentBadgeColor = (method: string) => {
    switch (method) {
      case 'mtn': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'orange': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'wave': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'moov': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    // ✅ CARTE NOIRE PROFOND (#1A1A1A) AVEC BORDURE SUBTILE (#2A2A2A)
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 hover:border-[#8B5CF6]/50 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        
        {/* Avatar + Infos créateur */}
        <div className="flex items-center gap-4 flex-1">
          {/* ✅ AVATAR VIOLET EXACT (#8B5CF6) */}
          <div className="w-14 h-14 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] font-bold text-lg flex-shrink-0">
            {getInitials(withdrawal.profiles?.full_name || withdrawal.profiles?.username || '')}
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">
              {withdrawal.profiles?.full_name || withdrawal.profiles?.username || 'Utilisateur inconnu'}
            </h3>
            <p className="text-gray-400 text-sm">
              @{withdrawal.profiles?.username || 'inconnu'}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              🕒 {formatDate(withdrawal.created_at)}
            </p>
          </div>
        </div>

        {/* Détails du paiement */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getPaymentBadgeColor(
                withdrawal.payment_method
              )}`}
            >
              <span>{getPaymentIcon(withdrawal.payment_method)}</span>
              {getPaymentMethodLabel(withdrawal.payment_method)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-gray-500">📞</span>
            <span className="font-mono text-sm">{withdrawal.account_number}</span>
          </div>
        </div>

        {/* Montant */}
        <div className="flex-1 text-left lg:text-right">
          <p className="text-gray-400 text-sm">Montant demandé</p>
          <p className="text-3xl font-bold text-white mt-1">
            {formatMoney(withdrawal.amount)}
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex lg:flex-col gap-3 flex-shrink-0">
          <button
            onClick={() => onApprove(withdrawal)}
            className="flex-1 lg:flex-none px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <span>✅</span>
            Valider
          </button>
          <button
            onClick={() => onReject(withdrawal)}
            // ✅ BOUTON REFUSER ASSOMBRI POUR MATCHER LE THÈME
            className="flex-1 lg:flex-none px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <span>❌</span>
            Refuser
          </button>
        </div>
      </div>
    </div>
  );
}