import { Link } from "react-router-dom";
import { Terminal } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-fintech-border bg-surface-0 mt-16 sm:mt-20 lg:mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-sm font-semibold text-fintech-navy mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-fintech-slate">
              <li><Link to="/marketplace" className="hover:text-fintech-navy transition-colors">Marketplace</Link></li>
              <li><Link to="/dashboard" className="hover:text-fintech-navy transition-colors">Dashboard</Link></li>
              <li><Link to="/pricing" className="hover:text-fintech-navy transition-colors">Pricing</Link></li>
              <li><a href="#docs" className="hover:text-fintech-navy transition-colors">Documentation</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-fintech-navy mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-fintech-slate">
              <li><Link to="/about" className="hover:text-fintech-navy transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-fintech-navy transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-fintech-navy mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-fintech-slate">
              <li><Link to="/privacy" className="hover:text-fintech-navy transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-fintech-navy transition-colors">Terms</Link></li>
              <li><Link to="/security" className="hover:text-fintech-navy transition-colors">Security</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-fintech-navy mb-4">Status</h3>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-fintech-green" />
              <span className="text-sm text-fintech-slate">All systems operational</span>
            </div>
            <p className="text-sm text-fintech-slate">
              Enterprise infrastructure
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-fintech-divider flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-fintech-slate">
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4" />
            <span className="font-semibold text-fintech-navy">Nanowork</span>
          </div>
          <div>
            © {new Date().getFullYear()} Nanowork Inc.
          </div>
        </div>
      </div>
    </footer>
  );
}
