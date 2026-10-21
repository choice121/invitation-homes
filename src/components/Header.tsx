import React from 'react';
import { ShieldCheck, Zap, BookOpen, Code2, Globe, Activity, Eye, Rocket } from 'lucide-react';

interface HeaderProps {
  activeTab: 'live' | 'future' | 'accuracy' | 'studio' | 'breakdown' | 'setup-guide' | 'transpiler';
  setActiveTab: (tab: 'live' | 'future' | 'accuracy' | 'studio' | 'breakdown' | 'setup-guide' | 'transpiler') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('live')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-[#04a54f] to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 font-bold text-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight">Invitation Homes Cloner</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Zero-AI React 19 + Tailwind v4 Replica of <code className="text-emerald-400 font-mono">invitationhomes.com</code>
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('live')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all shrink-0 ${
                activeTab === 'live'
                  ? 'bg-[#04a54f] text-white shadow-md shadow-emerald-600/30'
                  : 'text-emerald-400 hover:text-white hover:bg-slate-800 bg-emerald-950/30 border border-emerald-500/20'
              }`}
            >
              <Eye className="w-4 h-4 text-lime-300" />
              <span>Live Cloned Site</span>
            </button>

            <button
              onClick={() => setActiveTab('future')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                activeTab === 'future'
                  ? 'bg-[#04a54f] text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-400/30'
                  : 'text-amber-300 hover:text-white hover:bg-slate-800 bg-amber-950/20 border border-amber-500/20'
              }`}
            >
              <Rocket className="w-4 h-4 text-amber-400" />
              <span>Future Playbooks</span>
            </button>

            <button
              onClick={() => setActiveTab('accuracy')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 ${
                activeTab === 'accuracy'
                  ? 'bg-[#04a54f] text-white shadow-md shadow-emerald-600/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Accuracy Audit</span>
            </button>

            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 ${
                activeTab === 'studio'
                  ? 'bg-[#04a54f] text-white shadow-md shadow-emerald-600/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Cloner Studio &amp; ZIP</span>
            </button>

            <button
              onClick={() => setActiveTab('breakdown')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 ${
                activeTab === 'breakdown'
                  ? 'bg-[#04a54f] text-white shadow-md shadow-emerald-600/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Repo Breakdown</span>
            </button>

            <button
              onClick={() => setActiveTab('setup-guide')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 ${
                activeTab === 'setup-guide'
                  ? 'bg-[#04a54f] text-white shadow-md shadow-emerald-600/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Zero-API Guide</span>
            </button>

            <button
              onClick={() => setActiveTab('transpiler')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 ${
                activeTab === 'transpiler'
                  ? 'bg-[#04a54f] text-white shadow-md shadow-emerald-600/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>HTML → React</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
