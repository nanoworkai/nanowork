import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Mail, Send, Check, AlertCircle } from "lucide-react";
import { apiFetch } from "../lib/apiFetch";

/**
 * AI Email Manager Component
 * Allows users to assign an AI email and send emails from that address
 */
export default function AIEmailManager() {
  const { profile, session } = useAuth();
  const [hasAIEmail, setHasAIEmail] = useState(false);
  const [aiEmail, setAIEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Assignment form
  const [agentName, setAgentName] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Send email form
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Check if user has AI email on mount
  useEffect(() => {
    checkEmailStatus();
  }, [profile]);

  const checkEmailStatus = async () => {
    if (!session) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiFetch('/api/email/status');

      if (response.ok) {
        const data = await response.json();
        setHasAIEmail(data.hasAIEmail);
        setAIEmail(data.aiEmail);
      }
    } catch (error) {
      console.error("Failed to check email status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignEmail = async () => {
    if (!agentName.trim() || !session) return;

    setAssigning(true);
    setAssignError(null);

    try {
      const response = await apiFetch('/api/email/assign', {
        method: 'POST',
        body: JSON.stringify({ agentName: agentName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to assign email');
      }

      const data = await response.json();
      setHasAIEmail(true);
      setAIEmail(data.email);
      setAgentName("");
    } catch (error) {
      setAssignError(error instanceof Error ? error.message : 'Failed to assign email');
    } finally {
      setAssigning(false);
    }
  };

  const handleSendEmail = async () => {
    if (!to.trim() || !subject.trim() || !message.trim() || !session) return;

    setSending(true);
    setSendError(null);
    setSendSuccess(false);

    try {
      const response = await apiFetch('/api/email/send', {
        method: 'POST',
        body: JSON.stringify({
          to: to.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send email');
      }

      setSendSuccess(true);
      setTo("");
      setSubject("");
      setMessage("");

      setTimeout(() => setSendSuccess(false), 3000);
    } catch (error) {
      setSendError(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="card rounded-none border border-white/10 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Email Status */}
      <div className="card rounded-none border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-5 h-5 text-white/60" />
          <h2 className="text-lg font-mono font-bold text-white">AI Email Address</h2>
        </div>

        {hasAIEmail && aiEmail ? (
          <div className="bg-surface-2 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-sm font-mono text-white/60">Your AI Email:</span>
            </div>
            <div className="text-lg font-mono text-white">{aiEmail}</div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-white/60">
              Assign an AI email address to send emails from your AI agent.
            </p>

            {assignError && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-red-400">{assignError}</span>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g., nova, atlas, sage"
                disabled={assigning}
                className="flex-1 px-3 py-2 rounded-lg bg-surface-2 border border-white/10 focus:border-white/20 text-sm text-white outline-none transition-colors disabled:opacity-50"
              />
              <button
                onClick={handleAssignEmail}
                disabled={!agentName.trim() || assigning}
                className="px-4 py-2 rounded-lg bg-white text-black font-mono text-sm font-bold uppercase hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {assigning ? "Assigning…" : "Assign"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Send Email Form (only show if AI email is assigned) */}
      {hasAIEmail && (
        <div className="card rounded-none border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Send className="w-5 h-5 text-white/60" />
            <h2 className="text-lg font-mono font-bold text-white">Send Email</h2>
          </div>

          {sendSuccess && (
            <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg mb-4">
              <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-green-400">Email sent successfully!</span>
            </div>
          )}

          {sendError && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-red-400">{sendError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-white/60 mb-2">To</label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com"
                disabled={sending}
                className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 focus:border-white/20 text-sm text-white outline-none transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-white/60 mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                disabled={sending}
                className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 focus:border-white/20 text-sm text-white outline-none transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-white/60 mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message..."
                disabled={sending}
                rows={6}
                className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 focus:border-white/20 text-sm text-white outline-none transition-colors disabled:opacity-50 resize-none"
              />
            </div>

            <button
              onClick={handleSendEmail}
              disabled={!to.trim() || !subject.trim() || !message.trim() || sending}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white text-black font-mono text-sm font-bold uppercase hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Email
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
