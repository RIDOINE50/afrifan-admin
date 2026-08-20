'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import WithdrawalCard from '@/components/admin/WithdrawalCard';
import ConfirmModal from '@/components/admin/ConfirmModal';

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

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadPendingWithdrawals() {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('withdrawals')
        .select(`
          id,
          creator_id,
          amount,
          payment_method,
          account_number,
          status,
          created_at,
          profiles:creator_id (username, full_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        console.error('❌ Erreur Supabase:', supabaseError);
        setError(`Erreur de base de données: ${supabaseError.message}`);
        setWithdrawals([]);
        return;
      }

      const formattedData: Withdrawal[] = (data || []).map((item) => {
        try {
          let profileData = { username: 'inconnu', full_name: 'Inconnu' };
          if (item.profiles) {
            if (Array.isArray(item.profiles) && item.profiles.length > 0) {
              profileData = item.profiles[0];
            } else if (typeof item.profiles === 'object' && !Array.isArray(item.profiles)) {
              profileData = item.profiles;
            }
          }

          return {
            id: String(item.id || ''),
            creator_id: String(item.creator_id || ''),
            amount: Number(item.amount || 0),
            payment_method: String(item.payment_method || ''),
            account_number: String(item.account_number || ''),
            status: String(item.status || 'pending'),
            created_at: String(item.created_at || ''),
            profiles: {
              username: String(profileData.username || 'inconnu'),
              full_name: String(profileData.full_name || 'Inconnu'),
            },
          };
        } catch (mapError) {
          console.error('❌ Erreur lors du formatage:', mapError, item);
          return null;
        }
      }).filter((item): item is Withdrawal => item !== null);

      setWithdrawals(formattedData);
    } catch (error) {
      console.error('❌ Erreur chargement retraits:', error);
      setError(`Erreur inattendue: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setWithdrawals([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPendingWithdrawals();
  }, []);

  const handleApprove = async (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setModalAction('approve');
  };

  const handleReject = async (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setModalAction('reject');
  };

  const confirmAction = async (reason?: string) => {
    if (!selectedWithdrawal || !modalAction) return;

    try {
      if (modalAction === 'approve') {
        const isSuccess = Math.random() > 0.1;

        if (isSuccess) {
          await supabase
            .from('withdrawals')
            .update({
              status: 'completed',
              processed_at: new Date().toISOString(),
              admin_notes: 'Transfert automatique simulé avec succès',
            })
            .eq('id', selectedWithdrawal.id);

          // ✅ NOUVEAU : Envoyer la notification de succès au créateur
          await supabase.from('notifications').insert({
            user_id: selectedWithdrawal.creator_id,
            type: 'withdrawal_approved',
            title: 'Retrait validé ✅',
            message: `Votre retrait de ${selectedWithdrawal.amount.toLocaleString('fr-FR')} FCFA a été envoyé avec succès sur votre compte.`,
            data: { withdrawal_id: selectedWithdrawal.id, amount: selectedWithdrawal.amount },
            is_read: false
          });

          alert(`✅ Transfert de ${selectedWithdrawal.amount} FCFA envoyé avec succès !`);
        } else {
          await supabase
            .from('withdrawals')
            .update({
              status: 'failed',
              processed_at: new Date().toISOString(),
              admin_notes: 'Erreur de transfert simulée',
            })
            .eq('id', selectedWithdrawal.id);

          // ✅ NOUVEAU : Envoyer la notification d'échec au créateur
          await supabase.from('notifications').insert({
            user_id: selectedWithdrawal.creator_id,
            type: 'withdrawal_failed',
            title: 'Échec du transfert ❌',
            message: `Une erreur est survenue lors du transfert de votre retrait. Veuillez réessayer ou contacter le support.`,
            data: { withdrawal_id: selectedWithdrawal.id, amount: selectedWithdrawal.amount },
            is_read: false
          });

          alert('❌ Erreur lors du transfert. Veuillez réessayer.');
        }
      } else {
        const { data: withdrawal, error: fetchError } = await supabase
          .from('withdrawals')
          .select('creator_id, amount')
          .eq('id', selectedWithdrawal.id)
          .single();

        if (fetchError || !withdrawal) {
          throw new Error('Impossible de récupérer les données du retrait');
        }

        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('creator_id', withdrawal.creator_id)
          .single();

        const newBalance = (wallet?.balance || 0) + withdrawal.amount;

        await supabase
          .from('wallets')
          .update({ balance: newBalance })
          .eq('creator_id', withdrawal.creator_id);

        await supabase
          .from('withdrawals')
          .update({
            status: 'rejected',
            processed_at: new Date().toISOString(),
            admin_notes: reason || 'Retrait refusé par l\'administrateur',
          })
          .eq('id', selectedWithdrawal.id);

        // ✅ NOUVEAU : Envoyer la notification de refus au créateur
        await supabase.from('notifications').insert({
          user_id: selectedWithdrawal.creator_id,
          type: 'withdrawal_rejected',
          title: 'Retrait refusé 🚫',
          message: `Votre demande de retrait a été refusée. Motif : ${reason || 'Non spécifié'}. Le montant a été remis sur votre portefeuille.`,
          data: { withdrawal_id: selectedWithdrawal.id, amount: selectedWithdrawal.amount, reason: reason || 'Non spécifié' },
          is_read: false
        });

        alert(`❌ Retrait refusé. ${withdrawal.amount} FCFA remis au créateur.`);
      }

      await loadPendingWithdrawals();
    } catch (error) {
      console.error('❌ Erreur lors de l\'action:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSelectedWithdrawal(null);
      setModalAction(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Date inconnue';
    }
  };

  const formatMoney = (amount: number) => {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      mtn: 'MTN Mobile Money',
      orange: 'Orange Money',
      wave: 'Wave',
      moov: 'Moov Money',
    };
    return labels[method] || method;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-8">
        <div className="bg-[#1A1A1A] border border-red-500/30 rounded-xl p-8 max-w-2xl">
          <h2 className="text-2xl font-bold text-red-500 mb-4">❌ Erreur de chargement</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadPendingWithdrawals}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="bg-[#1A1A1A] border-b border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Gestion des Retraits</h1>
              <p className="text-gray-400 mt-1">
                {withdrawals.length} retrait{withdrawals.length > 1 ? 's' : ''} en attente
              </p>
            </div>
            <button
              onClick={loadPendingWithdrawals}
              className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg transition-colors font-medium"
            >
              Actualiser
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]"></div>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-16 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-semibold text-gray-400">Aucun retrait en attente</h2>
            <p className="text-gray-500 mt-2">Tous les retraits ont été traités</p>
          </div>
        ) : (
          <div className="space-y-4">
            {withdrawals.map((withdrawal) => (
              <WithdrawalCard
                key={withdrawal.id}
                withdrawal={withdrawal}
                onApprove={handleApprove}
                onReject={handleReject}
                formatDate={formatDate}
                formatMoney={formatMoney}
                getPaymentMethodLabel={getPaymentMethodLabel}
              />
            ))}
          </div>
        )}
      </div>

      {selectedWithdrawal && modalAction && (
        <ConfirmModal
          withdrawal={selectedWithdrawal}
          action={modalAction}
          onConfirm={confirmAction}
          onCancel={() => {
            setSelectedWithdrawal(null);
            setModalAction(null);
          }}
          formatMoney={formatMoney}
          getPaymentMethodLabel={getPaymentMethodLabel}
        />
      )}
    </div>
  );
}