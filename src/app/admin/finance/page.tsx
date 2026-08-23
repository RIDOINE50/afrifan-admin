import { supabaseAdmin } from '@/lib/supabase';
import { Wallet, TrendingUp, Coffee, Star, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const COMMISSION_RATE = 0.20; 

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  }).format(date);
};

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount).replace('XOF', 'FCFA');
};

export default async function AdminFinancePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentFilter = resolvedParams.filter || 'all';

  let transactions: any[] = [];
  let fetchError = false;

  try {
    // 1. Récupérer les Pourboires (Tips)
    const { data: tips, error: tipsError } = await supabaseAdmin
      .from('tips')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(100);

    if (tipsError) console.error('Erreur Tips:', tipsError);

    // 2. Récupérer les Abonnements (Subscriptions)
    const { data: subs, error: subsError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .in('status', ['active', 'upgraded'])
      .order('created_at', { ascending: false })
      .limit(100);

    if (subsError) console.error('Erreur Subscriptions:', subsError);

    // 3. Fusionner et normaliser les données en utilisant amount_paid
    tips?.forEach((tip: any) => {
      const amount = tip.amount_paid !== undefined && tip.amount_paid !== null ? parseFloat(tip.amount_paid) : (tip.amount ? parseFloat(tip.amount) : 0);
      transactions.push({
        id: tip.id,
        type: 'Pourboire',
        category: 'tips',
        amount: amount,
        commission: amount * COMMISSION_RATE,
        date: tip.created_at || new Date().toISOString(),
        details: 'Mobile Money',
        icon: <Coffee className="w-5 h-5 text-orange-500" />,
        bgIcon: 'bg-orange-500/10',
      });
    });

    subs?.forEach((sub: any) => {
      const amount = sub.amount_paid !== undefined && sub.amount_paid !== null ? parseFloat(sub.amount_paid) : (sub.amount ? parseFloat(sub.amount) : 0);
      transactions.push({
        id: sub.id,
        type: `Abonnement ${sub.tier_type?.toUpperCase() || 'STANDARD'}`,
        category: 'subs',
        amount: amount,
        commission: amount * COMMISSION_RATE,
        date: sub.created_at || new Date().toISOString(),
        details: sub.tier_type,
        icon: <Star className="w-5 h-5 text-green-500" />,
        bgIcon: 'bg-green-500/10',
      });
    });

    // 4. Trier par date (le plus récent en premier)
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  } catch (err) {
    console.error('Erreur critique chargement finances:', err);
    fetchError = true;
  }

  // 5. Calculer les totaux globaux (sur TOUTES les transactions)
  const totalVolume = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const totalCommission = transactions.reduce((sum, tx) => sum + (tx.commission || 0), 0);
  const totalTips = transactions.filter(tx => tx.category === 'tips').reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const totalSubs = transactions.filter(tx => tx.category === 'subs').reduce((sum, tx) => sum + (tx.amount || 0), 0);

  // 6. Filtrer les transactions selon le paramètre URL
  const filteredTransactions = transactions.filter(tx => {
    if (currentFilter === 'tips') return tx.category === 'tips';
    if (currentFilter === 'subs') return tx.category === 'subs';
    return true; // 'all'
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Finances & Commissions</h1>
            <p className="text-gray-400 mt-1">Suivi des revenus de la plateforme</p>
          </div>
          <Link 
            href="/admin/finance"
            className="flex items-center gap-2 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Link>
        </div>

        {fetchError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            Une erreur est survenue lors de la récupération des données financières. Vérifiez la console du serveur.
          </div>
        )}

        {/* Cartes de Résumé */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard title="Volume Total" value={formatMoney(totalVolume)} icon={<Wallet className="w-6 h-6 text-blue-500" />} />
          <SummaryCard title="Ta Commission (20%)" value={formatMoney(totalCommission)} icon={<TrendingUp className="w-6 h-6 text-[#8B5CF6]" />} highlight />
          <SummaryCard title="Pourboires" value={formatMoney(totalTips)} icon={<Coffee className="w-6 h-6 text-orange-500" />} />
          <SummaryCard title="Abonnements" value={formatMoney(totalSubs)} icon={<Star className="w-6 h-6 text-green-500" />} />
        </div>

        {/* Liste des Transactions avec Boutons de Tri */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="p-6 border-b border-[#2A2A2A] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-bold text-white">Historique des transactions</h2>

            {/* Boutons de Filtre / Tri */}
            <div className="flex items-center bg-[#222222] p-1 rounded-lg border border-[#333333]">
              <Link
                href="/admin/finance?filter=all"
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${currentFilter === 'all' ? 'bg-[#8B5CF6] text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Tout
              </Link>
              <Link
                href="/admin/finance?filter=tips"
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${currentFilter === 'tips' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Pourboires
              </Link>
              <Link
                href="/admin/finance?filter=subs"
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${currentFilter === 'subs' ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Abonnements
              </Link>
            </div>
          </div>
          
          <div className="divide-y divide-[#2A2A2A]">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Aucune transaction trouvée pour ce filtre.</div>
            ) : (
              filteredTransactions.map((tx, index) => (
                <div key={tx.id || index} className="p-4 hover:bg-[#222222] transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${tx.bgIcon}`}>
                      {tx.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{tx.type}</p>
                      <p className="text-sm text-gray-400">{formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{formatMoney(tx.amount)}</p>
                    <p className="text-xs text-[#8B5CF6] font-medium">Gain: {formatMoney(tx.commission)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, highlight = false }: { title: string; value: string; icon: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`p-6 rounded-xl border ${highlight ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/30' : 'bg-[#1A1A1A] border-[#2A2A2A]'}`}>
      <div className="flex items-center justify-between mb-4">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-sm text-gray-400">{title}</p>
    </div>
  );
}