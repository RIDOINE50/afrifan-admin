import { supabase } from '@/lib/supabase';

// ========================================
// TYPES
// ========================================

export interface Withdrawal {
  id: string;
  creator_id: string;
  amount: number;
  payment_method: string;
  account_number: string;
  status: 'pending' | 'completed' | 'rejected' | 'failed';
  admin_notes: string | null;
  created_at: string;
  processed_at: string | null;
  profiles: {
    username: string;
    full_name: string;
  };
}

export interface ProcessResult {
  success: boolean;
  message: string;
  transactionId?: string;
}

// ========================================
// SERVICE DE PAIEMENT
// ========================================

export const paymentService = {
  /**
   * Récupère tous les retraits en attente de validation
   */
  async getPendingWithdrawals(): Promise<Withdrawal[]> {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select(`
          id,
          creator_id,
          amount,
          payment_method,
          account_number,
          status,
          admin_notes,
          created_at,
          processed_at,
          profiles:creator_id (username, full_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedData = (data || []).map((item: Record<string, unknown>) => {
        const profilesArray = item.profiles as { username: string; full_name: string }[] | undefined;
        return {
          ...item,
          profiles: profilesArray?.[0] || { username: 'inconnu', full_name: 'Inconnu' }
        } as Withdrawal;
      });

      return formattedData;
    } catch (error) {
      console.error('❌ Erreur getPendingWithdrawals:', error);
      return [];
    }
  },

  /**
   * Récupère l'historique complet des retraits (pour l'admin)
   */
  async getWithdrawalHistory(limit: number = 50): Promise<Withdrawal[]> {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select(`
          id,
          creator_id,
          amount,
          payment_method,
          account_number,
          status,
          admin_notes,
          created_at,
          processed_at,
          profiles:creator_id (username, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const formattedData = (data || []).map((item: Record<string, unknown>) => {
        const profilesArray = item.profiles as { username: string; full_name: string }[] | undefined;
        return {
          ...item,
          profiles: profilesArray?.[0] || { username: 'inconnu', full_name: 'Inconnu' }
        } as Withdrawal;
      });

      return formattedData;
    } catch (error) {
      console.error('❌ Erreur getWithdrawalHistory:', error);
      return [];
    }
  },

  /**
   * VALIDE le traitement d'un retrait
   * ✅ CORRECTION : On ne déduit PAS l'argent ici, car il a déjà été déduit 
   * lors de la création de la demande dans Flutter. On change juste le statut.
   */
  async processWithdrawal(withdrawalId: string): Promise<ProcessResult> {
    try {
      console.log('🔄 VALIDATION DU RETRAIT...');

      const { data: withdrawal, error: fetchError } = await supabase
        .from('withdrawals')
        .select('amount, payment_method, account_number')
        .eq('id', withdrawalId)
        .single();

      if (fetchError || !withdrawal) {
        throw new Error('Retrait introuvable');
      }

      // Simulation d'attente réseau
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const isSuccess = Math.random() > 0.1; // 90% de succès

      if (isSuccess) {
        console.log('✅ TRANSFERT RÉUSSI (simulation)');

        // ✅ On met juste à jour le statut, le solde a déjà été débité !
        await supabase
          .from('withdrawals')
          .update({
            status: 'completed',
            processed_at: new Date().toISOString(),
            admin_notes: 'Transfert simulé avec succès',
          })
          .eq('id', withdrawalId);

        return {
          success: true,
          message: `Transfert de ${withdrawal.amount} FCFA validé avec succès`,
          transactionId: `SIM_${Date.now()}`,
        };
      } else {
        console.log('❌ ÉCHEC DU TRANSFERT (simulation)');

        await supabase
          .from('withdrawals')
          .update({
            status: 'failed',
            processed_at: new Date().toISOString(),
            admin_notes: 'Erreur de transfert simulée',
          })
          .eq('id', withdrawalId);

        return {
          success: false,
          message: 'Erreur lors du transfert. Veuillez réessayer.',
        };
      }
    } catch (error) {
      console.error('❌ Erreur processWithdrawal:', error);
      return {
        success: false,
        message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      };
    }
  },

  /**
   * Refuse un retrait et remet l'argent au créateur
   * ✅ Cette fonction est CORRECTE : elle rembourse l'argent qui avait été bloqué/déduit.
   */
  async rejectWithdrawal(withdrawalId: string, reason: string): Promise<ProcessResult> {
    try {
      const { data: withdrawal, error: fetchError } = await supabase
        .from('withdrawals')
        .select('creator_id, amount')
        .eq('id', withdrawalId)
        .single();

      if (fetchError || !withdrawal) {
        throw new Error('Retrait introuvable');
      }

      // 1. Rembourser le créateur
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('creator_id', withdrawal.creator_id)
        .single();

      const currentBalance = wallet?.balance || 0;
      const newBalance = currentBalance + withdrawal.amount;

      await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('creator_id', withdrawal.creator_id);

      // 2. Changer le statut du retrait
      await supabase
        .from('withdrawals')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString(),
          admin_notes: reason,
        })
        .eq('id', withdrawalId);

      console.log(`✅ Retrait refusé. ${withdrawal.amount} FCFA remboursés au créateur.`);

      return {
        success: true,
        message: `Retrait refusé. ${withdrawal.amount} FCFA ont été remis sur le portefeuille.`,
      };
    } catch (error) {
      console.error('❌ Erreur rejectWithdrawal:', error);
      return {
        success: false,
        message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      };
    }
  },
  
};