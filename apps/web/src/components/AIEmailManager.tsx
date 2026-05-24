import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Mail, Send, Check, AlertCircle } from "lucide-react";

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
      const apiUrl = import.meta.env.VITE_API_URL ?? '';
      const response = await fetch(`${apiUrl}/api/email/status`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

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
      const apiUrl = import.meta.env.VITE_API_URL ?? '';
      const response = await fetch(`${apiUrl}/api/email/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
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
      const apiUrl = import.meta.env.VITE_API_URL ?? '';
      const response = await fetch(`${apiUrl}/api/email/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Email Status */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">AI Email Address</h2>
        </div>

        {hasAIEmail && aiEmail ? (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Your AI Email:</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">{aiEmail}</div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Assign an AI email address to send emails from your AI agent.
            </p>

            {assignError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-red-700">{assignError}</span>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g., nova, atlas, sage"
                disabled={assigning}
                className="flex-1 px-3 py-2 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 outline-none transition-all disabled:opacity-50 disabled:bg-gray-50"
              />
              <button
                onClick={handleAssignEmail}
                disabled={!agentName.trim() || assigning}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
              >
                {assigning ? "Assigning…" : "Assign"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Send Email Form (only show if AI email is assigned) */}
      {hasAIEmail && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Send className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Send Email</h2>
          </div>

          {sendSuccess && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-green-700 font-medium">Email sent successfully!</span>
            </div>
          )}

          {sendError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-red-700">{sendError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com"
                disabled={sending}
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 outline-none transition-all disabled:opacity-50 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                disabled={sending}
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 outline-none transition-all disabled:opacity-50 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message..."
                disabled={sending}
                rows={6}
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 outline-none transition-all disabled:opacity-50 disabled:bg-gray-50 resize-none"
              />
            </div>

            <button
              onClick={handleSendEmail}
              disabled={!to.trim() || !subject.trim() || !message.trim() || sending}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-200 border-t-white rounded-full animate-spin" />
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
