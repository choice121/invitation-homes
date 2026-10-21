import React, { useState } from 'react';
import { 
  Github, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Coins, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { REPO_OVERVIEW, REPO_ANALYSIS } from '../data/repoBreakdown';

export const RepoAnalysis: React.FC = () => {
  const [pagesToClone, setPagesToClone] = useState(3);
  const [modelType, setModelType] = useState<'claude-3-7' | 'claude-3-5' | 'gpt-4o'>('claude-3-7');

  // Calculate token cost
  const tokensPerPage = 85000;
  const totalTokens = pagesToClone * tokensPerPage;
  const costPerMillion = modelType === 'claude-3-7' ? 15 : modelType === 'claude-3-5' ? 9 : 10;
  const estimatedCost = ((totalTokens / 1000000) * costPerMillion).toFixed(2);

  return (
    <div className="space-y-8">
      {/* Hero Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                GitHub Repository Analysis
              </span>
              <span className="text-xs text-slate-400">35k+ Stars • MIT License</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>{REPO_OVERVIEW.name}</span>
            </h1>
            <p className="mt-2 text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
              Created by <strong className="text-white">JCodesMore</strong>, this repository is one of the most viral AI agent templates for web development. It was specifically engineered to work with <strong>Claude Code</strong> (Anthropic's terminal CLI agent) and <strong>Chrome MCP</strong> (Model Context Protocol).
            </p>
          </div>

          <a
            href={REPO_OVERVIEW.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition shadow-sm"
          >
            <Github className="w-4 h-4" />
            <span>View Source on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>

        {/* Tech Stack Pills */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">Core Stack:</span>
          {REPO_OVERVIEW.techStack.map((tech, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-200"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Internal Architecture Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          How JCodesMore Cloner Works Under the Hood
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Understanding the 4-phase pipeline Claude Code executes when you type <code className="text-cyan-400 font-mono">/clone-website &lt;url&gt;</code>:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs mb-3">
              1
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Target Observation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Launches headless Chromium via Chrome MCP. Renders JavaScript, measures computed styles (fonts, paddings, hex colors, responsive flex/grid).
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs mb-3">
              2
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Asset Extraction</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scrapes SVG icons, hero images, and WebP assets into the <code className="text-slate-300">public/</code> directory and maps typography to Google Fonts or system fonts.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs mb-3">
              3
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Component Synthesis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI writes clean React 19 JSX components styled with Tailwind CSS v4 and shadcn/ui primitives inside <code className="text-slate-300">components/</code>.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs mb-3">
              4
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Visual QA Loop</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Agent takes screenshots of both the original URL and localhost:3000 to iteratively adjust spacing, padding, and layout alignment.
            </p>
          </div>
        </div>
      </div>

      {/* Honest Critique: Pros vs Cons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pros */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">What Makes It Great (The Pros)</h3>
          </div>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold mt-0.5">✓</span>
              <span><strong>Clean Code Output:</strong> Unlike ancient scrapers (HTTrack, wget) that dump unreadable mangled webpack bundles, this produces clean, editable, modular TypeScript React components.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold mt-0.5">✓</span>
              <span><strong>Modern Tooling:</strong> Ships with Next.js 15+, React 19, and Tailwind CSS v4, which aligns with 2026 industry standards.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold mt-0.5">✓</span>
              <span><strong>Computed Styles over Raw HTML:</strong> By using Chrome MCP to read rendered computed CSS, it accurately captures CSS variables and dynamic layouts.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold mt-0.5">✓</span>
              <span><strong>Educational & Prototyping Value:</strong> Fantastic for junior developers studying how production SaaS landing pages are structured.</span>
            </li>
          </ul>
        </div>

        {/* Cons / Reality Check */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">Critical Shortcomings & Reality Check (The Cons)</h3>
          </div>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold mt-0.5">⚠</span>
              <span><strong>Severe Token Burn:</strong> Running Claude 3.7 or Opus to clone a complete website easily costs $5 to $20+ per website in Anthropic API usage.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold mt-0.5">⚠</span>
              <span><strong>Frontend Shell Only:</strong> It CANNOT clone backend logic, database schemas, API authentication, or user state. It is strictly a visual replica.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold mt-0.5">⚠</span>
              <span><strong>Anti-Bot Roadblocks:</strong> Sites protected by Cloudflare Turnstile, Akamai, or Datadome block headless Chrome automation without manual intervention.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold mt-0.5">⚠</span>
              <span><strong>DMCA / Legal Hazards:</strong> Copying commercial sites, trademarks, or copyrighted assets violates terms of service and intellectual property laws.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Interactive Token Cost Calculator vs Zero-AI */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-bold text-white">Commercial AI Token Cost vs. Zero-AI Engine</h3>
          </div>
          <span className="text-xs text-slate-400">Context Window & API Economics</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Pages to Clone: <span className="text-blue-400 font-bold text-base">{pagesToClone}</span> pages
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={pagesToClone}
              onChange={(e) => setPagesToClone(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer mb-4"
            />

            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Target AI Model:
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setModelType('claude-3-7')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  modelType === 'claude-3-7'
                    ? 'border-blue-500 bg-blue-950 text-white'
                    : 'border-slate-800 text-slate-400'
                }`}
              >
                Claude 3.7 Sonnet ($15/MTok)
              </button>
              <button
                onClick={() => setModelType('claude-3-5')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  modelType === 'claude-3-5'
                    ? 'border-blue-500 bg-blue-950 text-white'
                    : 'border-slate-800 text-slate-400'
                }`}
              >
                Claude 3.5 Sonnet ($9/MTok)
              </button>
              <button
                onClick={() => setModelType('gpt-4o')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  modelType === 'gpt-4o'
                    ? 'border-blue-500 bg-blue-950 text-white'
                    : 'border-slate-800 text-slate-400'
                }`}
              >
                GPT-4o ($10/MTok)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/80 border border-red-500/30 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-400 mb-1">Commercial API Cost</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-red-400">${estimatedCost}</div>
              <div className="text-[11px] text-slate-500 mt-1">~{(totalTokens / 1000).toLocaleString()}k input/output tokens</div>
            </div>

            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-4 text-center relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-emerald-500/20 rounded-full blur-xl"></div>
              <div className="text-xs text-slate-400 mb-1">Zero-AI Engine</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">$0.00</div>
              <div className="text-[11px] text-emerald-500/80 mt-1">100% Free Forever • 0 Tokens</div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-hidden">
        <h3 className="text-lg font-bold text-white mb-4">Direct Methodology Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Feature</th>
                <th className="p-3 text-cyan-400 font-bold">JCodesMore Template</th>
                <th className="p-3 text-emerald-400 font-bold">Algorithmic Cloner</th>
                <th className="p-3 text-purple-400 font-bold">Local LLM (Ollama)</th>
                <th className="p-3 text-slate-300">SingleFile CLI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="p-3 font-semibold text-white">Cost per Clone</td>
                <td className="p-3 text-red-400 font-semibold">$5 – $20 (Anthropic API)</td>
                <td className="p-3 text-emerald-400 font-semibold">$0.00 (Zero API)</td>
                <td className="p-3 text-emerald-400 font-semibold">$0.00 (Local GPU)</td>
                <td className="p-3 text-emerald-400 font-semibold">$0.00</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Requires API Key?</td>
                <td className="p-3 text-amber-400">Yes (Anthropic / OpenAI)</td>
                <td className="p-3 text-emerald-400 font-bold">NO (Zero Keys)</td>
                <td className="p-3 text-emerald-400 font-bold">NO (Zero Keys)</td>
                <td className="p-3 text-emerald-400 font-bold">NO</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Code Modularity</td>
                <td className="p-3 text-emerald-400">High (Modular Next.js)</td>
                <td className="p-3 text-emerald-400">High (Modular Sections)</td>
                <td className="p-3 text-emerald-400">High (Modular Next.js)</td>
                <td className="p-3 text-red-400">Low (1 Huge Static File)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Execution Speed</td>
                <td className="p-3 text-amber-400">3 – 8 minutes</td>
                <td className="p-3 text-emerald-400 font-bold">&lt; 1 second</td>
                <td className="p-3 text-amber-400">1 – 3 minutes</td>
                <td className="p-3 text-emerald-400">2 – 5 seconds</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Data Privacy</td>
                <td className="p-3 text-amber-400">Sent to Cloud API</td>
                <td className="p-3 text-emerald-400 font-bold">100% Local</td>
                <td className="p-3 text-emerald-400 font-bold">100% Local / Offline</td>
                <td className="p-3 text-emerald-400 font-bold">100% Local</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
