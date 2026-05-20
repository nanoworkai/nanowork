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
  const { profile } = useAuth();
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [filter, setFilter] = useState<'all' | 'inbound' | 'outbound'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
      return <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-green-50 text-green-600 border border-green-200">✓ Replied</span>;
    }
    if (email.status === 'processing') {
      return <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">⋯ Processing</span>;
    }
    if (email.status === 'failed') {
      return <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200">✗ Failed</span>;
    }
    if (email.direction === 'outbound' && email.status === 'sent') {
      return <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">Sent</span>;
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Inbox</h1>
        <p className="text-sm text-slate-500">
          Messages sent to and from your AI agent at{" "}
          <span className="font-mono text-slate-600">{profile?.aiEmail}</span>
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('inbound')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'inbound'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <InboxIcon className="w-3 h-3" />
            Received
          </button>
          <button
            onClick={() => setFilter('outbound')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'outbound'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 hover:shadow-sm'
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
          className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:shadow-sm transition-all disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Email Grid */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Email List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {loading && emails.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">Loading messages...</p>
            </div>
          ) : emails.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-600 mb-1">No messages yet</p>
              <p className="text-xs text-slate-400">
                {filter === 'all'
                  ? 'Messages will appear here when contacts email your agent'
                  : `No ${filter} messages`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[calc(100vh-300px)] overflow-y-auto">
              {emails.map((email) => (
                <button
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${
                    selectedEmail?.id === email.id ? 'bg-slate-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {email.direction === 'inbound' ? (
                        <InboxIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      ) : (
                        <Send className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      )}
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {email.direction === 'inbound'
                          ? email.from_name || email.from_address
                          : email.to_address}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(email.received_at)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 font-semibold mb-1 truncate">
                    {email.subject || '(No subject)'}
                  </p>
                  {email.body_text && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">
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
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {selectedEmail ? (
            <div>
              {/* Header */}
              <div className="mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-slate-900 mb-2">
                      {selectedEmail.subject || '(No subject)'}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span className="font-semibold text-slate-700">
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
                    <span className="text-xs text-slate-400">
                      {new Date(selectedEmail.received_at).toLocaleString()}
                    </span>
                    {getStatusBadge(selectedEmail)}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="prose prose-slate prose-sm max-w-none">
                {selectedEmail.body_html ? (
                  <div
                    className="text-slate-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }}
                  />
                ) : (
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedEmail.body_text || '(No content)'}
                  </p>
                )}
              </div>

              {/* AI Response */}
              {selectedEmail.ai_response && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                      <span className="text-xs">🤖</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">AI Agent Response</span>
                  </div>
                  <div className="pl-8 text-sm text-slate-600 leading-relaxed">
                    {selectedEmail.ai_response}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Select an email to read</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
