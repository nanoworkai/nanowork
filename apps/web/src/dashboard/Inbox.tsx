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
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Inbox</h1>
        <p className="text-sm text-white/60">
          Messages sent to and from your AI agent at{" "}
          <span className="font-mono text-white/80">{agentEmail || 'loading...'}</span>
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-xl bg-surface-2 border border-white/10 focus:border-white/20 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-white text-black'
                : 'bg-surface-2 text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('inbound')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'inbound'
                ? 'bg-white text-black'
                : 'bg-surface-2 text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            <InboxIcon className="w-3 h-3" />
            Received
          </button>
          <button
            onClick={() => setFilter('outbound')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'outbound'
                ? 'bg-white text-black'
                : 'bg-surface-2 text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            <Send className="w-3 h-3" />
            Sent
          </button>
        </div>

        {/* Refresh */}
        <button
          onClick={fetchEmails}
          disabled={loading}
          className="p-2 rounded-lg bg-surface-2 hover:bg-surface-3 border border-white/10 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Email Grid */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Email List */}
        <div className="lg:col-span-2 card rounded-2xl overflow-hidden">
          {loading && emails.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-zinc-500">Loading messages...</p>
            </div>
          ) : emails.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm text-zinc-400 mb-1">No messages yet</p>
              <p className="text-xs text-zinc-600">
                {filter === 'all'
                  ? 'Messages will appear here when contacts email your agent'
                  : `No ${filter} messages`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[calc(100vh-300px)] overflow-y-auto">
              {emails.map((email) => (
                <button
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`w-full text-left p-4 hover:bg-white/3 transition-colors ${
                    selectedEmail?.id === email.id ? 'bg-white/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {email.direction === 'inbound' ? (
                        <InboxIcon className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                      ) : (
                        <Send className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                      )}
                      <p className="text-sm font-semibold text-zinc-200 truncate">
                        {email.direction === 'inbound'
                          ? email.from_name || email.from_address
                          : email.to_address}
                      </p>
                    </div>
                    <span className="text-xs text-zinc-600 whitespace-nowrap">
                      {formatDate(email.received_at)}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 font-medium mb-1 truncate">
                    {email.subject || '(No subject)'}
                  </p>
                  {email.body_text && (
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-2">
                      {email.body_text}
                    </p>
                  )}
                  {getStatusBadge(email)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Email Detail */}
        <div className="lg:col-span-3 card rounded-2xl p-6">
          {selectedEmail ? (
            <div>
              {/* Header */}
              <div className="mb-6 pb-6 border-b border-white/5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-white mb-2">
                      {selectedEmail.subject || '(No subject)'}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <span className="font-medium text-zinc-300">
                        {selectedEmail.direction === 'inbound' ? 'From:' : 'To:'}
                      </span>
                      <span className="font-mono">
                        {selectedEmail.direction === 'inbound'
                          ? `${selectedEmail.from_name || ''} <${selectedEmail.from_address}>`
                          : selectedEmail.to_address}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-zinc-500">
                      {new Date(selectedEmail.received_at).toLocaleString()}
                    </span>
                    {getStatusBadge(selectedEmail)}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="prose prose-invert prose-sm max-w-none">
                {selectedEmail.body_html ? (
                  <div
                    className="text-zinc-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }}
                  />
                ) : (
                  <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {selectedEmail.body_text || '(No content)'}
                  </p>
                )}
              </div>

              {/* AI Response */}
              {selectedEmail.ai_response && (
                <div className="mt-6 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-xs">🤖</span>
                    </div>
                    <span className="text-sm font-semibold text-zinc-300">AI Agent Response</span>
                  </div>
                  <div className="pl-8 text-sm text-zinc-400 leading-relaxed">
                    {selectedEmail.ai_response}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <Mail className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500">Select an email to read</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
