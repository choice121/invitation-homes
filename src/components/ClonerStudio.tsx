import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Eye, 
  Code, 
  Palette, 
  Image as ImageIcon, 
  Layers, 
  Monitor, 
  Smartphone, 
  Tablet, 
  RefreshCw,
  AlertCircle,
  Play
} from 'lucide-react';
import JSZip from 'jszip';
import { PRESET_SITES } from '../data/presets';
import { ClonedSiteData } from '../types';
import { InvitationHomesApp } from './InvitationHomesApp';

export const ClonerStudio: React.FC = () => {
  const [targetUrl, setTargetUrl] = useState('https://www.invitationhomes.com/');
  const [rawHtmlInput, setRawHtmlInput] = useState('');
  const [inputMode, setInputMode] = useState<'preset' | 'url' | 'raw'>('preset');
  const [selectedPresetId, setSelectedPresetId] = useState('invitation-homes');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cloned data state
  const [data, setData] = useState<ClonedSiteData | null>(null);
  const [activeView, setActiveView] = useState<'replica' | 'preview' | 'components' | 'nextjs' | 'tokens' | 'assets'>('replica');
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(0);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  // Initialize with Invitation Homes on mount
  useEffect(() => {
    handleClonePreset(PRESET_SITES[0]);
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleClonePreset = async (preset: typeof PRESET_SITES[0]) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: preset.url, rawHtml: preset.html }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Cloning failed');
      setData(result);
      setSelectedSectionIndex(0);
      if (preset.id === 'invitation-homes') {
        setActiveView('replica');
      } else {
        setActiveView('preview');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while cloning.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunClone = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const payload: any = {};
      if (inputMode === 'raw') {
        if (!rawHtmlInput.trim()) {
          throw new Error('Please enter raw HTML to transpile.');
        }
        payload.rawHtml = rawHtmlInput;
        payload.url = 'https://custom-pasted-html.local';
      } else {
        if (!targetUrl.trim()) {
          throw new Error('Please enter a target URL.');
        }
        payload.url = targetUrl;
      }

      const res = await fetch('/api/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to fetch and parse website');
      setData(result);
      setSelectedSectionIndex(0);
      if (payload.url.includes('invitationhomes.com')) {
        setActiveView('replica');
      } else {
        setActiveView('preview');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to clone target URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!data) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // README
      zip.file(
        'README.md',
        `# Cloned Web Application - ${data.title}
Source URL: ${data.url}
Generated using: Zero-AI Deterministic Cloner & Component Transpiler
No external AI API keys or tokens were used.

## Architecture
- Framework: Next.js 15+ / React 19
- Styling: Tailwind CSS v4
- Components: Fully decomposed modular sections

## Getting Started
1. Run \`npm install\`
2. Run \`npm run dev\`
3. Open http://localhost:3000
`
      );

      // package.json
      zip.file(
        'package.json',
        JSON.stringify(
          {
            name: 'cloned-invitation-homes',
            version: '1.0.0',
            private: true,
            scripts: {
              dev: 'next dev',
              build: 'next build',
              start: 'next start',
            },
            dependencies: {
              react: '^19.0.0',
              'react-dom': '^19.0.0',
              next: '^15.0.0',
              'lucide-react': '^0.546.0',
            },
            devDependencies: {
              typescript: '^5.0.0',
              '@types/react': '^19.0.0',
              '@types/node': '^20.0.0',
              tailwindcss: '^4.0.0',
              '@tailwindcss/postcss': '^4.0.0',
              postcss: '^8.4.0',
            },
          },
          null,
          2
        )
      );

      // tailwind.config.js
      zip.file('tailwind.config.js', data.tailwindConfigSnippet);

      // app/page.tsx
      zip.file('app/page.tsx', data.nextjsPageCode);

      // individual components
      const compFolder = zip.folder('components');
      data.sections.forEach((sec) => {
        const fileName = `${sec.id.replace(/[^a-zA-Z0-9]/g, '')}.tsx`;
        compFolder?.file(fileName, sec.reactCode);
      });

      // site-tokens.json
      zip.file(
        'site-tokens.json',
        JSON.stringify(
          {
            title: data.title,
            metaDescription: data.metaDescription,
            colors: data.colors,
            fonts: data.fonts,
            assets: data.assets,
            stats: data.stats,
          },
          null,
          2
        )
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `cloned-invitationhomes-${Date.now()}.zip`;
      link.click();
    } catch (err: any) {
      alert('Failed to generate ZIP: ' + err.message);
    } finally {
      setIsZipping(false);
    }
  };

  const currentSection = data?.sections[selectedSectionIndex];
  const isInvitationHomes = data?.url?.includes('invitationhomes') || selectedPresetId === 'invitation-homes';

  return (
    <div className="space-y-6">
      {/* Top Banner & Context */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Active Clone: Invitation Homes (https://www.invitationhomes.com/)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cloned: Houses for Rent | Invitation Homes
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Successfully reverse-engineered the single-family leasing platform into modular <strong>React 19 + Tailwind CSS</strong> components. Explored below: interactive replica with location search, 4 &quot;More&quot; value pillars, 16 metro areas, design tokens, and downloadable project bundle.
          </p>
        </div>
      </div>

      {/* Input Control Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        {/* Mode Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target Selector:</span>
            <div className="flex rounded-lg bg-slate-800 p-1">
              <button
                onClick={() => setInputMode('preset')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  inputMode === 'preset' ? 'bg-[#04a54f] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Curated Presets
              </button>
              <button
                onClick={() => setInputMode('url')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  inputMode === 'url' ? 'bg-[#04a54f] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Custom URL
              </button>
              <button
                onClick={() => setInputMode('raw')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  inputMode === 'raw' ? 'bg-[#04a54f] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Raw HTML / Snippet
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Zero AI Keys • Cheerio DOM Engine Active
          </div>
        </div>

        {/* Input Details depending on Mode */}
        <div className="mt-4">
          {inputMode === 'preset' && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PRESET_SITES.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      setTargetUrl(preset.url);
                      handleClonePreset(preset);
                    }}
                    className={`text-left p-3.5 rounded-lg border transition-all ${
                      selectedPresetId === preset.id
                        ? 'border-[#04a54f] bg-emerald-950/40 shadow-md shadow-emerald-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">{preset.category}</span>
                      {selectedPresetId === preset.id && <span className="text-xs text-emerald-400">✓ Active</span>}
                    </div>
                    <div className="font-semibold text-white text-sm">{preset.name}</div>
                    <div className="text-xs text-slate-400 mt-1 line-clamp-2">{preset.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {inputMode === 'url' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Target Website URL:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://www.invitationhomes.com/"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#04a54f]"
                  />
                </div>
                <button
                  onClick={handleRunClone}
                  disabled={isLoading}
                  className="px-5 py-2 bg-[#04a54f] hover:bg-[#0b763c] disabled:bg-slate-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Clone URL</span>
                </button>
              </div>
            </div>
          )}

          {inputMode === 'raw' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Paste HTML from DevTools:
              </label>
              <textarea
                value={rawHtmlInput}
                onChange={(e) => setRawHtmlInput(e.target.value)}
                placeholder="<div class='header'>...</div>"
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#04a54f]"
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleRunClone}
                  disabled={isLoading}
                  className="px-5 py-2 bg-[#04a54f] hover:bg-[#0b763c] text-white text-sm font-semibold rounded-lg flex items-center gap-2"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Transpile HTML</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <div>
              <span className="font-semibold">Notice:</span> {errorMsg}
            </div>
          </div>
        )}
      </div>

      {/* Cloned Metrics Bar */}
      {data && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <div className="text-xs text-slate-400">Target Page</div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5 truncate max-w-xs sm:max-w-md">
                {data.title}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>
            <div>
              <div className="text-xs text-slate-400">Total DOM Nodes</div>
              <div className="text-sm font-bold text-cyan-400">{data.stats.totalElements} nodes</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Modular Sections</div>
              <div className="text-sm font-bold text-emerald-400">{data.stats.totalSections} sections</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Brand Palette</div>
              <div className="text-sm font-bold text-lime-400">Forest Green & Lime ({data.colors.length} tokens)</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">API Cost</div>
              <div className="text-sm font-bold text-emerald-400">$0.00 (Zero AI Tokens)</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-md shadow-emerald-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isZipping ? 'Creating ZIP...' : 'Export Project ZIP'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Studio View Tabs */}
      {data && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {/* Sub Navigation Bar */}
          <div className="bg-slate-950/70 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex space-x-1 sm:space-x-2">
              {isInvitationHomes && (
                <button
                  onClick={() => setActiveView('replica')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeView === 'replica'
                      ? 'bg-[#04a54f] text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 text-lime-300" />
                  <span>Interactive React Replica</span>
                </button>
              )}

              <button
                onClick={() => setActiveView('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeView === 'preview'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>Sandbox HTML Preview</span>
              </button>

              <button
                onClick={() => setActiveView('components')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeView === 'components'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>React Components ({data.sections.length})</span>
              </button>

              <button
                onClick={() => setActiveView('nextjs')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeView === 'nextjs'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>Full Next.js Code</span>
              </button>

              <button
                onClick={() => setActiveView('tokens')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeView === 'tokens'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-purple-400" />
                <span>Tokens & Tailwind</span>
              </button>

              <button
                onClick={() => setActiveView('assets')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeView === 'assets'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Assets ({data.assets.length})</span>
              </button>
            </div>

            {/* Viewport size controls for preview */}
            {activeView === 'preview' && (
              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-md">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded ${previewDevice === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                  title="Desktop 100%"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewDevice('tablet')}
                  className={`p-1.5 rounded ${previewDevice === 'tablet' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                  title="Tablet (768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded ${previewDevice === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                  title="Mobile (375px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Tab 0: Interactive React Replica */}
          {activeView === 'replica' && (
            <div className="p-4 sm:p-6 bg-slate-950">
              <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Live Interactive React 19 Component • Test location search, pillar highlights, and market cards
                </span>
                <button
                  onClick={() => setActiveView('components')}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  View component code →
                </button>
              </div>
              <InvitationHomesApp />
            </div>
          )}

          {/* Tab 1: Live Preview */}
          {activeView === 'preview' && (
            <div className="p-4 bg-slate-950 flex justify-center min-h-[550px] overflow-auto">
              <div
                className={`transition-all duration-300 bg-white rounded-lg shadow-2xl overflow-hidden border border-slate-700 flex flex-col ${
                  previewDevice === 'desktop'
                    ? 'w-full'
                    : previewDevice === 'tablet'
                    ? 'w-[768px]'
                    : 'w-[375px]'
                }`}
                style={{ height: '620px' }}
              >
                {/* Browser frame mockup bar */}
                <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center justify-between text-xs text-slate-400 select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                  </div>
                  <div className="bg-slate-800 px-3 py-0.5 rounded text-slate-300 font-mono text-[11px] truncate max-w-sm">
                    {data.url}
                  </div>
                  <div className="text-[10px] text-slate-400">Sandbox Preview</div>
                </div>

                {/* Rendered HTML inside an iframe sandbox */}
                <iframe
                  title="Cloned Preview"
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>${data.title}</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                          body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
                        </style>
                      </head>
                      <body>
                        ${data.sections.map((s) => s.htmlSnippet).join('\n')}
                      </body>
                    </html>
                  `}
                  className="w-full flex-1 border-0"
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Modular React Components */}
          {activeView === 'components' && (
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[550px]">
              {/* Sidebar with sections list */}
              <div className="md:col-span-4 border-r border-slate-800 bg-slate-950/40 p-3 space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Extracted Sections ({data.sections.length})
                </div>
                {data.sections.map((sec, idx) => (
                  <button
                    key={sec.id}
                    onClick={() => setSelectedSectionIndex(idx)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition flex items-center justify-between ${
                      selectedSectionIndex === idx
                        ? 'bg-[#04a54f] text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-medium">{sec.name}</div>
                      <div className={`text-[10px] ${selectedSectionIndex === idx ? 'text-emerald-100' : 'text-slate-500'}`}>
                        &lt;{sec.tag}&gt; • {sec.elementCount} elements
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20">
                      .tsx
                    </span>
                  </button>
                ))}
              </div>

              {/* Code viewer for selected component */}
              <div className="md:col-span-8 flex flex-col bg-slate-950">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-emerald-400 font-semibold">
                      components/{currentSection?.id.replace(/[^a-zA-Z0-9]/g, '')}.tsx
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({currentSection?.elementCount} DOM nodes)
                    </span>
                  </div>
                  <button
                    onClick={() => currentSection && handleCopy(currentSection.reactCode, currentSection.id)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-md transition"
                  >
                    {copiedKey === currentSection?.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-300" />
                        <span>Copy TSX</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 flex-1 overflow-auto">
                  <pre className="text-xs font-mono text-slate-200 leading-relaxed overflow-x-auto whitespace-pre">
                    <code>{currentSection?.reactCode}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Full Next.js Page Code */}
          {activeView === 'nextjs' && (
            <div className="flex flex-col bg-slate-950 min-h-[550px]">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-400 font-semibold">app/page.tsx</span>
                  <span className="text-[11px] text-slate-400">Complete Next.js 15+ Layout</span>
                </div>
                <button
                  onClick={() => handleCopy(data.nextjsPageCode, 'full-nextjs')}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-md transition"
                >
                  {copiedKey === 'full-nextjs' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-300" />
                      <span>Copy Full Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 flex-1 overflow-auto">
                <pre className="text-xs font-mono text-slate-200 leading-relaxed overflow-x-auto whitespace-pre">
                  <code>{data.nextjsPageCode}</code>
                </pre>
              </div>
            </div>
          )}

          {/* Tab 4: Design Tokens & Tailwind Config */}
          {activeView === 'tokens' && (
            <div className="p-6 bg-slate-950 min-h-[550px] space-y-6">
              {/* Colors */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-emerald-400" />
                  Extracted Brand Color Palette ({data.colors.length} tokens)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {data.colors.map((color, i) => (
                    <div
                      key={i}
                      onClick={() => handleCopy(color, `color-${i}`)}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition group"
                    >
                      <div
                        className="w-full h-12 rounded-md shadow-inner mb-2 border border-white/10"
                        style={{ backgroundColor: color }}
                      ></div>
                      <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                        <span>{color}</span>
                        <span className="text-[10px] text-slate-500 group-hover:text-emerald-400">
                          {copiedKey === `color-${i}` ? '✓' : 'Copy'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tailwind Config Generator */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-white">Generated tailwind.config.js for Invitation Homes</h3>
                  <button
                    onClick={() => handleCopy(data.tailwindConfigSnippet, 'tw-config')}
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    {copiedKey === 'tw-config' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'tw-config' ? 'Copied' : 'Copy Config'}</span>
                  </button>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                  <pre className="text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre">
                    <code>{data.tailwindConfigSnippet}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Assets */}
          {activeView === 'assets' && (
            <div className="p-6 bg-slate-950 min-h-[550px]">
              <div className="text-sm font-bold text-white mb-4 flex items-center justify-between">
                <span>Extracted Contentful Assets & Media ({data.assets.length})</span>
                <span className="text-xs font-normal text-slate-400">All external URLs resolved & verified</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {data.assets.map((asset, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-3 overflow-hidden flex flex-col justify-between">
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          {asset.type}
                        </span>
                        <button
                          onClick={() => handleCopy(asset.url, `asset-${i}`)}
                          className="text-[10px] text-slate-400 hover:text-white"
                        >
                          {copiedKey === `asset-${i}` ? 'Copied URL!' : 'Copy URL'}
                        </button>
                      </div>
                      {asset.type === 'image' && (
                        <div className="w-full h-28 bg-slate-950 rounded flex items-center justify-center overflow-hidden border border-slate-800">
                          <img
                            src={asset.url}
                            alt={asset.alt || 'Asset'}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              (e.target as any).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-mono text-slate-400 truncate mt-1" title={asset.url}>
                      {asset.url}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
