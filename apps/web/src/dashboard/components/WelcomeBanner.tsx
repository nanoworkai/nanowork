import { useState, useEffect } from "react";
import { X, Sparkles, History, Zap } from "lucide-react";

interface WelcomeBannerProps {
  userName?: string;
  onDismiss?: () => void;
}

export default function WelcomeBanner({ userName, onDismiss }: WelcomeBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner was previously dismissed
    const isDismissed = localStorage.getItem("nanowork_welcome_dismissed");
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("nanowork_welcome_dismissed", "true");
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 mb-8 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl" />
      </div>

      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        aria-label="Dismiss welcome banner"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Welcome to Nanowork{userName ? `, ${userName}` : ""}
            </h2>
            <p className="text-base text-white/60 leading-relaxed max-w-2xl">
              Turn your ideas into production-ready applications in minutes.
              We handle the complexity so you can focus on growing your business.
            </p>
          </div>
        </div>

        {/* Quick Tour */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-white">Create Your First Build</h3>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Describe your application in detail and our AI will generate a complete,
              deployable project for you.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <History className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-white">Track Your Builds</h3>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Monitor progress in real-time and access all your builds from your history dashboard.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-white">Deploy & Scale</h3>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Your applications are production-ready with built-in deployment pipelines and scaling support.
            </p>
          </div>
        </div>

        {/* Next Step CTA */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-sm text-white/60">
            <span className="font-semibold text-white">Ready to get started?</span> Create your first build below and see your application come to life in minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
