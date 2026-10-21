import React, { useState } from 'react';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Maximize2, 
  Minimize2, 
  Columns, 
  ExternalLink, 
  Sparkles, 
  RefreshCw,
  Eye,
  Check,
  Copy
} from 'lucide-react';
import { InvitationHomesApp } from './InvitationHomesApp';

export const LiveCloneView: React.FC = () => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile' | 'full'>('full');
  const [viewMode, setViewMode] = useState<'interactive' | 'split' | 'sandbox'>('interactive');
  const [copied, setCopied] = useState(false);

  const originalUrl = 'https://www.invitationhomes.com/';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Floating Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 px-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
        {/* Left: Mode Toggles */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Display Mode:</span>
          <div className="flex bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('interactive')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                viewMode === 'interactive'
                  ? 'bg-[#04a54f] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-lime-300" />
              <span>Full Cloned Replica</span>
            </button>

            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                viewMode === 'split'
                  ? 'bg-[#04a54f] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side-by-Side Split View</span>
            </button>
          </div>
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-[#9fcc3b] border border-emerald-500/20 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9fcc3b] animate-pulse"></span>
            All 13 Official SVGs Downloaded &amp; Active
          </span>
        </div>

        {/* Center: Device Viewport Switcher */}
        {viewMode !== 'split' && (
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg">
            <button
              onClick={() => setDevice('full')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition ${
                device === 'full' ? 'bg-[#04a54f] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Full width"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">100% Full Width</span>
            </button>
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded transition ${
                device === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop 1200px"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded transition ${
                device === 'tablet' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet 768px"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded transition ${
                device === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile 375px"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right: Quick Links */}
        <div className="flex items-center gap-2">
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition"
          >
            <span>Original Site</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Link Copied!' : 'Share Live Link'}</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'interactive' && (
        <div className="flex justify-center transition-all duration-300 overflow-x-auto pb-6">
          <div
            className={`transition-all duration-300 ${
              device === 'full'
                ? 'w-full'
                : device === 'desktop'
                ? 'w-[1200px] shadow-2xl rounded-2xl overflow-hidden border border-slate-700'
                : device === 'tablet'
                ? 'w-[768px] shadow-2xl rounded-2xl overflow-hidden border border-slate-700'
                : 'w-[375px] shadow-2xl rounded-2xl overflow-hidden border border-slate-700'
            }`}
          >
            {device !== 'full' && (
              <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center justify-between text-xs text-slate-400 select-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                </div>
                <span className="font-mono text-[11px] text-slate-300">
                  https://www.invitationhomes.com/ (Cloned React 19)
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  {device === 'desktop' ? '1200px' : device === 'tablet' ? '768px' : '375px'}
                </span>
              </div>
            )}
            <InvitationHomesApp />
          </div>
        </div>
      )}

      {/* Split Screen Mode: Clone vs Original */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[800px]">
          {/* Left: Cloned Version */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-bold text-white">Cloned React 19 Replica</span>
              </div>
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono font-semibold">
                Tailwind CSS v4 + Zero-AI AST
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <InvitationHomesApp />
            </div>
          </div>

          {/* Right: Original Website Reference */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span className="text-xs font-bold text-white">Original InvitationHomes.com Reference</span>
              </div>
              <a
                href={originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 font-mono"
              >
                <span>Live Origin</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex-1 bg-white">
              <iframe
                src="https://www.invitationhomes.com/"
                title="Original Invitation Homes"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
