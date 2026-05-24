import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";

export default function Create() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [creating, setCreating] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || '';

  const handleCreateBuild = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim() || !session?.access_token) return;

    setCreating(true);

    try {
      // Generate AI name for the build
      const nameRes = await fetch(`${apiUrl}/api/builds/generate-name`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      let buildName = 'New Build';
      if (nameRes.ok) {
        const { name } = await nameRes.json();
        buildName = name;
      }

      // Create the build
      const res = await fetch(`${apiUrl}/api/builds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: buildName,
          prompt: prompt.trim(),
        }),
      });

      if (res.ok) {
        const { build } = await res.json();
        setPrompt('');

        // Navigate to the build detail page
        navigate(`/dashboard/builds/${build.id}`);
      }
    } catch (err) {
      console.error('Failed to create build:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What would you like to build?
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Describe your project and our AI will generate a complete application for you
          </p>
        </div>

        {/* Prompt Form */}
        <form onSubmit={handleCreateBuild} className="space-y-6">
          {/* Textarea */}
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Build a booking system for my dog grooming business. I need customers to be able to book appointments, see available time slots, and receive confirmation emails. Include a dashboard where I can manage appointments and customer information."
              className="w-full h-64 px-6 py-5 rounded-2xl bg-surface-2 border-2 border-white/10 focus:border-white/30 text-white placeholder-white/30 text-base leading-relaxed outline-none resize-none transition-all"
              disabled={creating}
              autoFocus
            />

            {/* Character count */}
            <div className="absolute bottom-4 right-4 text-xs text-white/30">
              {prompt.length} characters
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={!prompt.trim() || creating}
              className="group relative px-10 py-5 rounded-2xl bg-white hover:bg-zinc-100 disabled:bg-white/10 disabled:cursor-not-allowed text-black disabled:text-white/30 font-bold text-base transition-all disabled:hover:bg-white/10 shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              <span className="flex items-center gap-3">
                {creating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating your build...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Create Build
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </div>
        </form>

        {/* Helper Text */}
        <div className="mt-12 text-center">
          <p className="text-sm text-white/40">
            Be specific about features, design preferences, and any special requirements
          </p>
        </div>
      </div>
    </div>
  );
}
