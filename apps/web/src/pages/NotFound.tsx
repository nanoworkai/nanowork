import { Link } from "react-router-dom";
import { Terminal } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 text-content-primary font-bold text-[15px] mb-12 hover:opacity-70 transition-opacity uppercase tracking-wider">
        <div className="w-6 h-6 rounded-lg bg-accent-primary flex items-center justify-center">
          <Terminal className="w-3.5 h-3.5 text-white" />
        </div>
        Nanowork
      </Link>

      <p className="text-[120px] leading-none font-bold text-content-tertiary mb-6">404</p>
      <h1 className="text-3xl font-bold text-content-primary mb-3">Page not found</h1>
      <p className="text-content-secondary max-w-sm mb-8 leading-relaxed">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-accent-primary hover:bg-accent-primary/90 text-white font-bold transition-colors text-sm uppercase tracking-wider"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Back to home
      </Link>
    </div>
  );
}
