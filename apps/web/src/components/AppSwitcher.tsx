/**
 * AppSwitcher - Office 365-style waffle menu for switching between apps
 *
 * Provides familiar navigation for agent managers to access:
 * - Spreadsheets (Excel-like)
 * - Documents (Word-like)
 * - Presentations (PowerPoint-like)
 * - Files (OneDrive-like)
 * - Other dashboard features
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Grid3x3,
  FileSpreadsheet,
  FileText,
  Presentation,
  FolderOpen,
  Mail,
  Wallet,
  History,
  Settings,
  X,
} from 'lucide-react';

interface AppItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  description: string;
}

const APPS: AppItem[] = [
  {
    id: 'spreadsheets',
    name: 'SHEETS',
    icon: FileSpreadsheet,
    path: '/dashboard/spreadsheets',
    description: 'Spreadsheets - Financial models and data analysis',
  },
  {
    id: 'documents',
    name: 'DOCS',
    icon: FileText,
    path: '/dashboard/documents',
    description: 'Documents - Reports and briefings',
  },
  {
    id: 'presentations',
    name: 'SLIDES',
    icon: Presentation,
    path: '/dashboard/presentations',
    description: 'Presentations - Pitch decks and slide shows',
  },
  {
    id: 'files',
    name: 'FILES',
    icon: FolderOpen,
    path: '/dashboard/files',
    description: 'Files - File storage and sharing',
  },
  {
    id: 'inbox',
    name: 'INBOX',
    icon: Mail,
    path: '/dashboard/inbox',
    description: 'Inbox - Messages and notifications',
  },
  {
    id: 'wallet',
    name: 'WALLET',
    icon: Wallet,
    path: '/dashboard/wallet',
    description: 'Wallet - Credits and billing',
  },
  {
    id: 'history',
    name: 'HISTORY',
    icon: History,
    path: '/dashboard/history',
    description: 'History - Activity and builds',
  },
  {
    id: 'settings',
    name: 'SETTINGS',
    icon: Settings,
    path: '/dashboard/settings',
    description: 'Settings - Account preferences',
  },
];

export default function AppSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleAppClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Waffle Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-none transition-colors ${
          isOpen
            ? 'bg-white/20 text-white'
            : 'text-white/60 hover:text-white hover:bg-white/5'
        }`}
        aria-label="App switcher"
        title="Switch apps"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Grid3x3 className="w-5 h-5" />
        )}
      </button>

      {/* Overlay Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 z-40" />

          {/* Menu Panel */}
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl p-4">
            <div className="bg-surface-1 border border-white/20 rounded-none shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="border-b border-white/10 p-4 bg-surface-0">
                <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                  Nanowork Apps
                </h2>
                <p className="text-xs font-mono text-white/40 mt-1">
                  Switch between your workspace tools
                </p>
              </div>

              {/* Apps Grid */}
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {APPS.map((app) => {
                    const Icon = app.icon;
                    const isActive = location.pathname === app.path;

                    return (
                      <button
                        key={app.id}
                        onClick={() => handleAppClick(app.path)}
                        title={app.description}
                        className={`flex flex-col items-center gap-3 p-5 rounded-none border transition-all ${
                          isActive
                            ? 'bg-white/10 border-white/30 text-white'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <Icon className="w-8 h-8" />
                        <div className="text-xs font-mono font-bold uppercase tracking-wider">
                          {app.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 p-3 bg-surface-0">
                <p className="text-xs font-mono text-white/40 text-center">
                  Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white">ESC</kbd> to
                  close
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
