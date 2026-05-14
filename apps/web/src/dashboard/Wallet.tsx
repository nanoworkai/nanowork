import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Coins, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface CreditTransaction {
  id: string;
  amount: number;
  balance_after: number;
  type: 'topup' | 'spend' | 'refund';
  description: string | null;
  created_at: string;
}

interface CreditBundle {
  id: string;
  credits: number;
  priceUsd: number;
  label: string;
}

export default function Wallet() {
  const { session } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [bundles, setBundles] = useState<CreditBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWalletData();
    fetchBundles();
  }, [session]);

  const fetchWalletData = async () => {
    if (!session?.access_token) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';

      // Fetch balance
      const balanceRes = await fetch(`${apiUrl}/api/wallet/balance`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (balanceRes.ok) {
        const { balance: bal } = await balanceRes.json();
        setBalance(bal);
      }

      // Fetch transactions
      const transactionsRes = await fetch(`${apiUrl}/api/wallet/transactions?limit=20`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (transactionsRes.ok) {
        const { transactions: txns } = await transactionsRes.json();
        setTransactions(txns);
      }
    } catch (err) {
      console.error('Failed to fetch wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBundles = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/wallet/bundles`);

      if (res.ok) {
        const { bundles: bundleData } = await res.json();
        setBundles(bundleData);
      }
    } catch (err) {
      console.error('Failed to fetch bundles:', err);
    }
  };

  const handleTopUp = async (bundleId: string) => {
    if (!session?.access_token) return;

    setPurchasing(bundleId);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';

      // Create payment intent
      const res = await fetch(`${apiUrl}/api/wallet/topup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bundle: bundleId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create payment');
      }

      const { clientSecret } = await res.json();

      // Redirect to Stripe checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret);

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Refresh wallet data
      await fetchWalletData();
    } catch (err) {
      console.error('Top-up error:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete purchase');
    } finally {
      setPurchasing(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const lowBalance = balance !== null && balance < 10;
  const zeroBalance = balance === 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Wallet</h1>
        <p className="text-zinc-500 text-sm mt-1">Manage your credit balance and view transaction history.</p>
      </div>

      {/* Balance Card */}
      <div className="mb-6 p-6 rounded-2xl border border-white/10 bg-surface-1">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-zinc-400" />
              <p className="text-sm font-medium text-zinc-400">Current Balance</p>
            </div>
            <p className="text-4xl font-bold text-white">{balance ?? '—'} <span className="text-xl text-zinc-500">credits</span></p>
          </div>
          {lowBalance && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${zeroBalance ? 'bg-red-500/10 border border-red-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'}`}>
              <AlertCircle className={`w-4 h-4 ${zeroBalance ? 'text-red-400' : 'text-yellow-400'}`} />
              <span className={`text-xs font-semibold ${zeroBalance ? 'text-red-400' : 'text-yellow-400'}`}>
                {zeroBalance ? 'Out of credits' : 'Low balance'}
              </span>
            </div>
          )}
        </div>

        {zeroBalance && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/10">
            <p className="text-sm text-red-400">
              Your agent is out of credits. Top up your balance to continue using agent features.
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Credit Bundles */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Top Up Credits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className={`p-6 rounded-2xl border transition-all ${
                bundle.id === 'popular'
                  ? 'border-white/20 bg-surface-2 ring-2 ring-white/10'
                  : 'border-white/5 bg-surface-1 hover:border-white/10'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">{bundle.label}</h3>
                  <p className="text-2xl font-bold text-white">{bundle.credits} <span className="text-sm text-zinc-500">credits</span></p>
                </div>
                {bundle.id === 'popular' && (
                  <span className="px-2 py-1 rounded-lg bg-white/10 text-xs font-semibold text-white">
                    Popular
                  </span>
                )}
              </div>
              <p className="text-zinc-400 text-sm mb-4">${bundle.priceUsd} USD</p>
              <button
                onClick={() => handleTopUp(bundle.id)}
                disabled={purchasing !== null}
                className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  purchasing === bundle.id
                    ? 'bg-white/10 text-zinc-400'
                    : bundle.id === 'popular'
                    ? 'bg-white text-black hover:bg-zinc-100'
                    : 'bg-surface-3 text-white hover:bg-surface-4 border border-white/10'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {purchasing === bundle.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Buy now'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Transaction History</h2>
        <div className="rounded-2xl border border-white/5 bg-surface-1 overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-8 text-center">
              <Coins className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm text-zinc-500 mb-1">No transactions yet</p>
              <p className="text-xs text-zinc-600">Your credit activity will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 hover:bg-white/3 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${
                        tx.type === 'topup'
                          ? 'bg-green-500/10'
                          : tx.type === 'spend'
                          ? 'bg-red-500/10'
                          : 'bg-blue-500/10'
                      }`}>
                        {tx.type === 'topup' ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {tx.description || (tx.type === 'topup' ? 'Credit top-up' : 'Credit spent')}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {formatDate(tx.created_at)} · Balance after: {tx.balance_after} credits
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-semibold ${
                        tx.amount > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
