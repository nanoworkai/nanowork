import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Mail, Inbox as InboxIcon, Send, Search, RefreshCw } from "lucide-react";

interface EmailMessage {
  id: string;
  from_address: string;
  from_name: string | null;
  to_address: string;
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  direction: 'inbound' | 'outbound';
  status: string;
  received_at: string;
  ai_processed: boolean;
  ai_response: string | null;
}

export default function Inbox() {
  const { profile, session } = useAuth();
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [filter, setFilter] = useState<'all' | 'inbound' | 'outbound'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [agentEmail, setAgentEmail] = useState<string>('');

  // Fetch agent email address
  useEffect(() => {
    const fetchAgentEmail = async () => {
      if (!session?.access_token) return;

      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${apiUrl}/agents/me`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (res.ok) {
          const agent = await res.json();
          setAgentEmail(agent.email || '');
        }
      } catch (error) {
        console.error('Failed to fetch agent email:', error);
      }
    };

    fetchAgentEmail();
  }, [session?.access_token]);

  const fetchEmails = async () => {
    if (!profile?.id) return;

    setLoading(true);

    let query = supabase
      .from('email_messages')
      .select('*')
      .eq('user_id', profile.id)
      .order('received_at', { ascending: false })
      .limit(50);

    if (filter !== 'all') {
      query = query.eq('direction', filter);
    }

    const { data, error } = await query;

    if (!error && data) {
      let filteredData = data;
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        filteredData = data.filter(email =>
          email.subject?.toLowerCase().includes(search) ||
          email.from_address.toLowerCase().includes(search) ||
          email.from_name?.toLowerCase().includes(search) ||
          email.body_text?.toLowerCase().includes(search)
        );
      }
      setEmails(filteredData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmails();
  }, [profile?.id, filter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEmails();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (email: EmailMessage) => {
    if (email.status === 'processed' && email.ai_processed) {
      return <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">✓ Replied</span>;
    }
    if (email.status === 'processing') {
      return <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">⋯ Processing</span>;
    }
    if (email.status === 'failed') {
      return <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">✗ Failed</span>;
    }
    if (email.direction === 'outbound' && email.status === 'sent') {
      return <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-zinc-400 border border-white/10">Sent</span>;
    }
    return null;
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col max-w-[1600px] mx-auto px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Inbox</h1>
        <p className="text-sm text-white/60">
          Messages sent to and from your AI agent at{" "}
          <span className="font-mono text-white/80">{agentEmail || 'loading...'}</span>
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-surface-2 border border-white/10 focus:border-white/20 text-sm text-white placeholder-white/40 outline-none transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-white text-black shadow-sm'
                : 'bg-surface-2 text-white/60 hover:text-white hover:bg-surface-3 border border-white/10'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('inbound')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'inbound'
                ? 'bg-white text-black shadow-sm'
                : 'bg-surface-2 text-white/60 hover:text-white hover:bg-surface-3 border border-white/10'
            }`}
          >
            <InboxIcon className="w-3.5 h-3.5" />
            Received
          </button>
          <button
            onClick={() => setFilter('outbound')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'outbound'
                ? 'bg-white text-black shadow-sm'
                : 'bg-surface-2 text-white/60 hover:text-white hover:bg-surface-3 border border-white/10'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Sent
          </button>
        </div>

        {/* Refresh */}
        <button
          onClick={fetchEmails}
          disabled={loading}
          className="px-3 py-2.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-white/10 text-white/60 hover:text-white transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Email Grid - Two Pane Layout */}
      <div className="flex-1 grid lg:grid-cols-5 gap-5 min-h-0">
        {/* Message List - 2/5 width */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden border border-white/10 bg-surface-2 flex flex-col">
          {loading && emails.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-12">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-white/60">Loading messages...</p>
              </div>
            </div>
          ) : emails.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-12">
              <div className="text-center">
                <Mail className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-base font-medium text-white/80 mb-2">No messages yet</p>
                <p className="text-sm text-white/40 max-w-xs">
                  {filter === 'all'
                    ? 'Messages will appear here when contacts email your agent'
                    : `No ${filter} messages`}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {emails.map((email) => (
                <button
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`w-full text-left px-5 py-4 hover:bg-white/5 transition-all ${
                    selectedEmail?.id === email.id ? 'bg-white/10 border-l-2 border-white' : ''
                  }`}
                >
                  {/* Sender + Timestamp */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {email.direction === 'inbound' ? (
                        <InboxIcon className="w-4 h-4 text-white/40 flex-shrink-0" />
                      ) : (
                        <Send className="w-4 h-4 text-white/40 flex-shrink-0" />
                      )}
                      <p className="text-sm font-semibold text-white truncate">
                        {email.direction === 'inbound'
                          ? email.from_name || email.from_address
                          : email.to_address}
                      </p>
                    </div>
                    <span className="text-xs text-white/40 whitespace-nowrap flex-shrink-0">
                      {formatDate(email.received_at)}
                    </span>
                  </div>

                  {/* Subject */}
                  <p className="text-sm text-white/90 font-medium mb-2 truncate">
                    {email.subject || '(No subject)'}
                  </p>

                  {/* Preview */}
                  {email.body_text && (
                    <p className="text-xs text-white/50 line-clamp-2 leading-relaxed mb-3">
                      {email.body_text}
                    </p>
                  )}

                  {/* Status Badge */}
                  {getStatusBadge(email)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail - 3/5 width */}
        <div className="lg:col-span-3 rounded-xl border border-white/10 bg-surface-2 flex flex-col overflow-hidden">
          {selectedEmail ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Email Header */}
              <div className="px-8 py-6 border-b border-white/10 flex-shrink-0">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h2 className="text-xl font-bold text-white flex-1">
                    {selectedEmail.subject || '(No subject)'}
                  </h2>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-xs text-white/40">
                      {new Date(selectedEmail.received_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                    {getStatusBadge(selectedEmail)}
                  </div>
                </div>

                {/* From/To */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-white/60">
                    {selectedEmail.direction === 'inbound' ? 'From:' : 'To:'}
                  </span>
                  <span className="font-mono text-white/80">
                    {selectedEmail.direction === 'inbound'
                      ? selectedEmail.from_name
                        ? `${selectedEmail.from_name} <${selectedEmail.from_address}>`
                        : selectedEmail.from_address
                      : selectedEmail.to_address}
                  </span>
                </div>
              </div>

              {/* Email Body - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                  {/* Main Email Content */}
                  <div className="bg-white/5 rounded-lg p-6 mb-6 border border-white/5">
                    {selectedEmail.body_html ? (
                      <div
                        className="prose prose-invert prose-sm max-w-none text-white/90 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }}
                      />
                    ) : (
                      <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedEmail.body_text || '(No content)'}
                      </p>
                    )}
                  </div>

                  {/* AI Response Section */}
                  {selectedEmail.ai_response && (
                    <div className="bg-green-500/5 rounded-lg p-6 border border-green-500/20">
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <span className="text-base">🤖</span>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-green-400">AI Agent Response</span>
                          <p className="text-xs text-white/40">Automatically sent by your agent</p>
                        </div>
                      </div>
                      <div className="text-sm text-white/80 leading-relaxed pl-10">
                        {selectedEmail.ai_response}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Mail className="w-20 h-20 text-white/10 mx-auto mb-5" />
                <p className="text-base text-white/60">Select an email to read</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
