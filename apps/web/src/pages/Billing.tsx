/**
 * Billing Page
 *
 * Complete billing management dashboard showing:
 * - Current plan & usage
 * - Invoice history
 * - Payment methods
 * - Stripe Customer Portal access
 *
 * @page
 */

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { createCustomerPortalSession } from "../lib/stripe";
import type { Invoice, PaymentMethod } from "../types/database";

export default function Billing() {
  const { profile } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  /**
   * Load billing data on mount
   */
  useEffect(() => {
    loadBillingData();
  }, []);

  /**
   * Fetch invoices and payment methods
   */
  const loadBillingData = async () => {
    try {
      const [invoicesData, pmData] = await Promise.all([
        supabase
          .from("invoices")
          .select("*")
          .order("invoice_date", { ascending: false })
          .limit(10),
        supabase
          .from("payment_methods")
          .select("*")
          .eq("status", "active")
          .order("is_default", { ascending: false }),
      ]);

      if (invoicesData.data) setInvoices(invoicesData.data as Invoice[]);
      if (pmData.data) setPaymentMethods(pmData.data as PaymentMethod[]);
    } catch (error) {
      console.error("Error loading billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Open Stripe Customer Portal
   */
  const openCustomerPortal = async () => {
    if (!profile?.stripeCustomerId) {
      alert("No billing account found. Please subscribe to a plan first.");
      return;
    }

    setPortalLoading(true);
    try {
      const { url, error } = await createCustomerPortalSession(
        profile.stripeCustomerId,
        window.location.href
      );

      if (error) {
        alert(`Error: ${error}`);
        return;
      }

      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error("Portal error:", err);
      alert("Failed to open billing portal.");
    } finally {
      setPortalLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-surface-0 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Billing</h1>
          <p className="text-zinc-400 mt-2">
            Manage your subscription and payment methods
          </p>
        </div>

        {/* Current Plan Card */}
        <div className="bg-surface-1 rounded-xl border border-white/10 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Current Plan: {profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)}
              </h2>
              <div className="space-y-1 text-sm text-zinc-400">
                <div>Credits: {profile.creditsBalance.toLocaleString()}</div>
                <div>Companies: {profile.monthlyCompanyLimit}</div>
                {profile.subscriptionStatus && (
                  <div>Status: {profile.subscriptionStatus}</div>
                )}
              </div>
            </div>
            <button
              onClick={openCustomerPortal}
              disabled={portalLoading}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
            >
              {portalLoading ? "Loading..." : "Manage Billing"}
            </button>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-surface-1 rounded-xl border border-white/10 p-8">
          <h2 className="text-xl font-bold text-white mb-6">Payment Methods</h2>
          {paymentMethods.length === 0 ? (
            <p className="text-zinc-500">No payment methods on file</p>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-surface-2 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    {pm.type === "card" ? (
                      <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <div>
                      <div className="text-white font-medium">
                        {pm.card_brand} •••• {pm.card_last4 || pm.bank_last4}
                      </div>
                      {pm.card_exp_month && pm.card_exp_year && (
                        <div className="text-xs text-zinc-500">
                          Expires {pm.card_exp_month}/{pm.card_exp_year}
                        </div>
                      )}
                    </div>
                  </div>
                  {pm.is_default && (
                    <div className="px-2 py-1 rounded bg-brand-600/20 text-brand-400 text-xs font-medium">
                      DEFAULT
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoice History */}
        <div className="bg-surface-1 rounded-xl border border-white/10 p-8">
          <h2 className="text-xl font-bold text-white mb-6">Invoice History</h2>
          {loading ? (
            <p className="text-zinc-500">Loading...</p>
          ) : invoices.length === 0 ? (
            <p className="text-zinc-500">No invoices yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-zinc-500 border-b border-white/10">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Invoice #</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-white/5 text-sm">
                      <td className="py-4 text-white">
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-zinc-400">
                        {invoice.invoice_number || "—"}
                      </td>
                      <td className="py-4 text-white font-medium">
                        ${invoice.amount_due.toFixed(2)}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            invoice.status === "paid"
                              ? "bg-green-500/20 text-green-400"
                              : invoice.status === "open"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-zinc-500/20 text-zinc-400"
                          }`}
                        >
                          {invoice.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4">
                        {invoice.invoice_pdf_url && (
                          <a
                            href={invoice.invoice_pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-400 hover:text-brand-300 text-sm"
                          >
                            Download PDF
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
