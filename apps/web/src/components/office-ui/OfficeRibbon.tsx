/**
 * OfficeRibbon - Microsoft Office-style ribbon toolbar
 *
 * Features:
 * - Tab-based navigation (Home, Insert, Format, etc.)
 * - Grouped commands with labels
 * - Icon + text buttons
 * - Collapsible for mobile
 * - Terminal aesthetic adaptation
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface RibbonCommand {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  type?: 'button' | 'toggle' | 'dropdown';
  active?: boolean;
  items?: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }>;
}

export interface RibbonGroup {
  id: string;
  label: string;
  commands: RibbonCommand[];
}

export interface RibbonTab {
  id: string;
  label: string;
  groups: RibbonGroup[];
}

interface OfficeRibbonProps {
  tabs: RibbonTab[];
  defaultTab?: string;
  className?: string;
}

export default function OfficeRibbon({ tabs, defaultTab, className = '' }: OfficeRibbonProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [collapsed, setCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const currentTab = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className={`bg-surface-1 border-b border-white/10 ${className}`}>
      {/* Tabs Strip */}
      <div className="flex items-center border-b border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setCollapsed(false);
            }}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
              activeTab === tab.id
                ? 'bg-surface-0 text-white border-b-2 border-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto px-3 py-2 text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          title={collapsed ? 'Expand ribbon' : 'Collapse ribbon'}
        >
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Command Groups */}
      {!collapsed && currentTab && (
        <div className="flex items-start gap-1 p-2 overflow-x-auto">
          {currentTab.groups.map((group) => (
            <div
              key={group.id}
              className="flex flex-col border-r border-white/10 pr-3 mr-2 last:border-r-0"
            >
              {/* Commands */}
              <div className="flex items-center gap-1 mb-2">
                {group.commands.map((command) => (
                  <RibbonButton
                    key={command.id}
                    command={command}
                    isDropdownOpen={openDropdown === command.id}
                    onDropdownToggle={() =>
                      setOpenDropdown(openDropdown === command.id ? null : command.id)
                    }
                  />
                ))}
              </div>

              {/* Group Label */}
              <div className="text-[10px] font-mono text-white/40 text-center uppercase tracking-wide">
                {group.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RibbonButton({
  command,
  isDropdownOpen,
  onDropdownToggle,
}: {
  command: RibbonCommand;
  isDropdownOpen: boolean;
  onDropdownToggle: () => void;
}) {
  if (command.type === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={onDropdownToggle}
          disabled={command.disabled}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-none transition-colors ${
            command.disabled
              ? 'opacity-40 cursor-not-allowed'
              : isDropdownOpen
              ? 'bg-white/20 text-white'
              : 'hover:bg-white/10 text-white/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-1">
            {command.icon}
            <ChevronDown className="w-3 h-3" />
          </div>
          <span className="text-[10px] font-mono uppercase">{command.label}</span>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && command.items && (
          <div className="absolute top-full left-0 mt-1 bg-surface-1 border border-white/20 rounded-none shadow-xl z-50 min-w-[160px]">
            {command.items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  item.onClick();
                  onDropdownToggle();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left"
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={command.onClick}
      disabled={command.disabled}
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-none transition-colors ${
        command.disabled
          ? 'opacity-40 cursor-not-allowed'
          : command.active
          ? 'bg-white text-black'
          : 'hover:bg-white/10 text-white/80 hover:text-white'
      }`}
      title={command.label}
    >
      {command.icon}
      <span className="text-[10px] font-mono uppercase">{command.label}</span>
    </button>
  );
}
