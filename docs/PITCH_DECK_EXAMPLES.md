# Pitch Deck Generator - Integration Examples

## Example 1: Add to Dashboard Create Page

Show a promotional card on the main Create page to introduce users to the pitch deck feature.

```typescript
// apps/web/src/dashboard/Create.tsx

import PitchDeckQuickStart from "./components/PitchDeckQuickStart";

export default function Create() {
  // ... existing code ...

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Existing welcome banner */}
      <WelcomeBanner userName={profile?.name} />

      {/* Add pitch deck promo */}
      <div className="mb-8">
        <PitchDeckQuickStart />
      </div>

      {/* Existing create form */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* ... rest of component ... */}
      </div>
    </div>
  );
}
```

## Example 2: Launch from Business Idea

Allow users to generate a pitch deck directly from their business description in the Create flow.

```typescript
// apps/web/src/dashboard/Create.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Presentation } from "lucide-react";

export default function Create() {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  const handleCreatePitchDeck = () => {
    // Store the business description in session storage
    sessionStorage.setItem('pitchDeckDraft', prompt);
    // Navigate to pitch deck generator
    navigate('/dashboard/pitch-deck');
  };

  return (
    <div>
      <form onSubmit={handleCreateBuild}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your business..."
        />

        {/* Existing submit button */}
        <button type="submit">
          Start Building
        </button>

        {/* New pitch deck button */}
        {prompt.length > 50 && (
          <button
            type="button"
            onClick={handleCreatePitchDeck}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-2 hover:bg-surface-2/80 border border-white/10 text-white"
          >
            <Presentation className="w-5 h-5" />
            Create Pitch Deck Instead
          </button>
        )}
      </form>
    </div>
  );
}
```

Then in PitchDeck.tsx:

```typescript
// apps/web/src/dashboard/PitchDeck.tsx

import { useEffect, useState } from "react";

export default function PitchDeck() {
  const [initialDescription, setInitialDescription] = useState("");

  useEffect(() => {
    // Check if there's a draft from Create page
    const draft = sessionStorage.getItem('pitchDeckDraft');
    if (draft) {
      setInitialDescription(draft);
      sessionStorage.removeItem('pitchDeckDraft');
    }
  }, []);

  // ... rest of component with initialDescription
}
```

## Example 3: Pitch Deck Library (Future)

Show user's saved pitch decks with ability to edit, duplicate, or create new.

```typescript
// apps/web/src/dashboard/PitchDeckLibrary.tsx

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Presentation, Plus, Edit, Copy, Trash } from "lucide-react";

interface SavedDeck {
  id: string;
  companyName: string;
  tagline: string;
  slideCount: number;
  template: string;
  createdAt: string;
  updatedAt: string;
}

export default function PitchDeckLibrary() {
  const { session } = useAuth();
  const [decks, setDecks] = useState<SavedDeck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || "";
    try {
      const response = await fetch(`${apiUrl}/api/pitch-deck/list`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const data = await response.json();
      setDecks(data.decks);
    } catch (error) {
      console.error("Failed to load decks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (deckId: string) => {
    // Navigate to editor with deck ID
  };

  const handleDuplicate = async (deckId: string) => {
    // Clone deck
  };

  const handleDelete = async (deckId: string) => {
    // Delete deck
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Pitch Decks</h1>
        <button
          onClick={() => window.location.href = "/dashboard/pitch-deck"}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-zinc-100 text-black font-medium"
        >
          <Plus className="w-4 h-4" />
          New Pitch Deck
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : decks.length === 0 ? (
        <div className="text-center py-12">
          <Presentation className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/60">No pitch decks yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <div
              key={deck.id}
              className="p-6 rounded-xl bg-surface-2 border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <Presentation className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(deck.id)}
                    className="p-2 rounded hover:bg-white/5"
                  >
                    <Edit className="w-4 h-4 text-white/60" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(deck.id)}
                    className="p-2 rounded hover:bg-white/5"
                  >
                    <Copy className="w-4 h-4 text-white/60" />
                  </button>
                  <button
                    onClick={() => handleDelete(deck.id)}
                    className="p-2 rounded hover:bg-red-500/10"
                  >
                    <Trash className="w-4 h-4 text-red-400/60" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">
                {deck.companyName}
              </h3>
              <p className="text-sm text-white/60 mb-4">{deck.tagline}</p>

              <div className="flex items-center justify-between text-xs text-white/40">
                <span>{deck.slideCount} slides</span>
                <span>{deck.template}</span>
                <span>{new Date(deck.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Example 4: API Integration with Spreadsheet Data

Pull financial data from the spreadsheet tool to auto-populate financial projections.

```typescript
// apps/web/src/components/PitchDeckEditor.tsx

const handleGenerateWithSpreadsheetData = async () => {
  // Fetch spreadsheet data
  const apiUrl = import.meta.env.VITE_API_URL || "";
  const spreadsheetResponse = await fetch(
    `${apiUrl}/api/spreadsheet/financial-summary`,
    {
      headers: { Authorization: `Bearer ${session.access_token}` },
    }
  );

  const spreadsheetData = await spreadsheetResponse.json();

  // Generate deck with financial data
  const response = await fetch(`${apiUrl}/api/pitch-deck/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      businessDescription,
      companyName,
      tagline,
      targetRaise,
      spreadsheetData: {
        revenue: spreadsheetData.totalRevenue,
        expenses: spreadsheetData.totalExpenses,
        projections: spreadsheetData.projections,
      },
    }),
  });

  const data = await response.json();
  setDeck(data.deck);
};
```

## Example 5: Embed in Email Campaign

Generate pitch deck and send to investors directly.

```typescript
// apps/web/src/components/InvestorOutreach.tsx

import { useState } from "react";
import { Send, Presentation } from "lucide-react";

export default function InvestorOutreach({ deckId }: { deckId: string }) {
  const [recipients, setRecipients] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendPitchDeck = async () => {
    setSending(true);

    const apiUrl = import.meta.env.VITE_API_URL || "";
    try {
      await fetch(`${apiUrl}/api/pitch-deck/${deckId}/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients: recipients.split(",").map((r) => r.trim()),
          message,
          includeLink: true,
          includePDF: true,
        }),
      });

      alert("Pitch deck sent!");
    } catch (error) {
      console.error("Failed to send:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 rounded-xl bg-surface-2 border border-white/10">
      <h3 className="text-lg font-bold text-white mb-4">
        Send to Investors
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-white/80 mb-2">
            Email Addresses (comma-separated)
          </label>
          <input
            type="text"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            placeholder="investor1@vc.com, investor2@angels.com"
            className="w-full px-4 py-2 rounded-lg bg-surface-1 border border-white/10 text-white outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-white/80 mb-2">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hi [Name], I'd love to share our pitch deck..."
            className="w-full h-32 px-4 py-2 rounded-lg bg-surface-1 border border-white/10 text-white outline-none resize-none"
          />
        </div>

        <button
          onClick={handleSendPitchDeck}
          disabled={!recipients || sending}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white hover:bg-zinc-100 disabled:bg-white/10 text-black disabled:text-white/30 font-medium"
        >
          {sending ? (
            "Sending..."
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Pitch Deck
            </>
          )}
        </button>
      </div>
    </div>
  );
}
```

## Example 6: Analytics & Tracking

Track views and engagement on shared pitch decks.

```typescript
// Backend API endpoint
// apps/worker/src/routes/pitch-deck.ts

app.get('/:deckId/analytics', requireAuth, async (c) => {
  const { deckId } = c.req.param();
  
  // Fetch analytics from database
  const analytics = await db.query(`
    SELECT 
      view_count,
      unique_viewers,
      avg_time_per_slide,
      most_viewed_slide,
      last_viewed_at
    FROM pitch_deck_analytics
    WHERE deck_id = ?
  `, [deckId]);

  return c.json({ analytics });
});

// Frontend component
// apps/web/src/components/PitchDeckAnalytics.tsx

export default function PitchDeckAnalytics({ deckId }: { deckId: string }) {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [deckId]);

  const loadAnalytics = async () => {
    const response = await fetch(
      `${apiUrl}/api/pitch-deck/${deckId}/analytics`,
      {
        headers: { Authorization: `Bearer ${session.access_token}` },
      }
    );
    const data = await response.json();
    setAnalytics(data.analytics);
  };

  return (
    <div className="p-6 rounded-xl bg-surface-2 border border-white/10">
      <h3 className="text-lg font-bold text-white mb-4">Deck Analytics</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-2xl font-bold text-white">
            {analytics?.viewCount || 0}
          </div>
          <div className="text-sm text-white/60">Total Views</div>
        </div>
        
        <div>
          <div className="text-2xl font-bold text-white">
            {analytics?.uniqueViewers || 0}
          </div>
          <div className="text-sm text-white/60">Unique Viewers</div>
        </div>
        
        <div>
          <div className="text-2xl font-bold text-white">
            {analytics?.avgTimePerSlide || 0}s
          </div>
          <div className="text-sm text-white/60">Avg. Time/Slide</div>
        </div>
        
        <div>
          <div className="text-2xl font-bold text-white">
            Slide {analytics?.mostViewedSlide || '-'}
          </div>
          <div className="text-sm text-white/60">Most Viewed</div>
        </div>
      </div>
    </div>
  );
}
```

## Example 7: Version History

Track changes and allow reverting to previous versions.

```typescript
// apps/web/src/components/PitchDeckVersionHistory.tsx

interface Version {
  id: string;
  timestamp: string;
  changes: string;
  author: string;
}

export default function PitchDeckVersionHistory({ deckId }: { deckId: string }) {
  const [versions, setVersions] = useState<Version[]>([]);

  const handleRestore = async (versionId: string) => {
    if (!confirm("Restore this version? Current changes will be saved as a new version.")) {
      return;
    }

    await fetch(`${apiUrl}/api/pitch-deck/${deckId}/restore/${versionId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    window.location.reload();
  };

  return (
    <div className="space-y-3">
      {versions.map((version) => (
        <div
          key={version.id}
          className="p-4 rounded-lg bg-surface-2 border border-white/10"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white">
                {new Date(version.timestamp).toLocaleString()}
              </p>
              <p className="text-xs text-white/60 mt-1">{version.changes}</p>
              <p className="text-xs text-white/40 mt-1">by {version.author}</p>
            </div>
            <button
              onClick={() => handleRestore(version.id)}
              className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-xs text-white"
            >
              Restore
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Example 8: Collaboration Features

Allow team members to comment on slides.

```typescript
// apps/web/src/components/SlideComments.tsx

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  slideIndex: number;
}

export default function SlideComments({
  deckId,
  slideIndex,
}: {
  deckId: string;
  slideIndex: number;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = async () => {
    const response = await fetch(
      `${apiUrl}/api/pitch-deck/${deckId}/comments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slideIndex,
          text: newComment,
        }),
      }
    );

    const data = await response.json();
    setComments([...comments, data.comment]);
    setNewComment("");
  };

  return (
    <div className="p-4 rounded-xl bg-surface-2 border border-white/10">
      <h4 className="text-sm font-bold text-white mb-3">Comments</h4>

      <div className="space-y-3 mb-4">
        {comments.map((comment) => (
          <div key={comment.id} className="p-3 rounded-lg bg-surface-1">
            <p className="text-xs font-medium text-white/80">
              {comment.author}
            </p>
            <p className="text-sm text-white mt-1">{comment.text}</p>
            <p className="text-xs text-white/40 mt-1">
              {new Date(comment.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-3 py-2 rounded-lg bg-surface-1 border border-white/10 text-white text-sm outline-none"
        />
        <button
          onClick={handleAddComment}
          disabled={!newComment.trim()}
          className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-100 disabled:bg-white/10 text-black disabled:text-white/30 text-sm font-medium"
        >
          Post
        </button>
      </div>
    </div>
  );
}
```

## Example 9: Custom Branding

Allow users to upload logo and customize colors.

```typescript
// apps/web/src/components/PitchDeckBranding.tsx

export default function PitchDeckBranding({ deckId }: { deckId: string }) {
  const [logo, setLogo] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#ffffff");

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);

    const response = await fetch(
      `${apiUrl}/api/pitch-deck/${deckId}/branding/logo`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      }
    );

    const data = await response.json();
    setLogo(data.logoUrl);
  };

  return (
    <div className="p-6 rounded-xl bg-surface-2 border border-white/10">
      <h3 className="text-lg font-bold text-white mb-4">Custom Branding</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-white/80 mb-2">Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="text-sm text-white"
          />
          {logo && (
            <img
              src={logo}
              alt="Logo"
              className="mt-2 h-12 object-contain"
            />
          )}
        </div>

        <div>
          <label className="block text-sm text-white/80 mb-2">
            Primary Color
          </label>
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-full h-10 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm text-white/80 mb-2">
            Secondary Color
          </label>
          <input
            type="color"
            value={secondaryColor}
            onChange={(e) => setSecondaryColor(e.target.value)}
            className="w-full h-10 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
```

These examples show how the pitch deck generator can be integrated throughout the Nanowork platform to provide a seamless fundraising experience for users.
