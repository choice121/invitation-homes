import React, { useState } from 'react';
import { Code2, Sparkles, Copy, Check, Eye, RefreshCw, Terminal } from 'lucide-react';

export const QuickTranspiler: React.FC = () => {
  const [componentName, setComponentName] = useState('MyCustomCard');
  const [inputHtml, setInputHtml] = useState(`<div class="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
  <div class="p-6">
    <div class="uppercase tracking-wide text-xs text-indigo-400 font-bold">New Release</div>
    <a href="#" class="block mt-1 text-lg leading-tight font-semibold text-white hover:underline">
      Zero-AI Deterministic Web Engine
    </a>
    <p class="mt-2 text-slate-400 text-sm">
      Transpile raw HTML into pristine React 19 JSX components without paying for LLM tokens or external APIs.
    </p>
    <div class="mt-4 flex items-center justify-between">
      <span class="text-xs text-slate-500">Instant • Deterministic</span>
      <button class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg">
        Explore Component
      </button>
    </div>
  </div>
</div>`);

  const [outputJsx, setOutputJsx] = useState('');
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTranspile = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/transpile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: inputHtml, componentName }),
      });
      const data = await res.json();
      setOutputJsx(data.code || '');
    } catch {
      // Fallback local logic
      let clean = inputHtml
        .replace(/class=/g, 'className=')
        .replace(/for=/g, 'htmlFor=')
        .replace(/<(img|input|br|hr)([^>]*)(?<!\/)>/gi, '<$1$2 />');
      setOutputJsx(`import React from 'react';\n\nexport function ${componentName}() {\n  return (\n    ${clean}\n  );\n}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Run on mount
  React.useEffect(() => {
    handleTranspile();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputJsx);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
            Pure AST Transpiler
          </span>
          <span className="text-xs text-slate-400">0 Tokens • No API Keys • 100% Client/Node Execution</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Live HTML → React 19 & Tailwind Transpiler
        </h1>
        <p className="mt-2 text-slate-300 text-sm leading-relaxed max-w-3xl">
          Inspect any element in your browser (Right-click &gt; Inspect &gt; Right-click DOM node &gt; Copy &gt; Copy outerHTML) and paste it below. It automatically handles <code className="text-cyan-300">class</code> → <code className="text-cyan-300">className</code>, style attribute conversion, self-closing void elements, and exports a production-ready TypeScript component.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold text-slate-300">Component Name:</label>
          <input
            type="text"
            value={componentName}
            onChange={(e) => setComponentName(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Editor & Preview Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[520px] overflow-hidden">
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-cyan-400" />
              Source HTML (Paste from Chrome DevTools)
            </span>
            <button
              onClick={handleTranspile}
              disabled={isProcessing}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold flex items-center gap-1"
            >
              {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Transpile</span>
            </button>
          </div>
          <textarea
            value={inputHtml}
            onChange={(e) => setInputHtml(e.target.value)}
            className="flex-1 w-full bg-slate-950 p-4 font-mono text-xs text-slate-200 resize-none focus:outline-none leading-relaxed"
            placeholder="Paste raw HTML here..."
          />
        </div>

        {/* Output Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[520px] overflow-hidden">
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  activeTab === 'code' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                React 19 TSX Code
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  activeTab === 'preview' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Rendered Preview
              </button>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded transition"
            >
              {copied ? (
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

          {activeTab === 'code' ? (
            <div className="flex-1 p-4 bg-slate-950 overflow-auto">
              <pre className="font-mono text-xs text-cyan-300 leading-relaxed whitespace-pre overflow-x-auto">
                <code>{outputJsx}</code>
              </pre>
            </div>
          ) : (
            <div className="flex-1 p-6 bg-slate-950 flex items-center justify-center overflow-auto">
              <div className="w-full max-w-md">
                <iframe
                  title="Snippet Preview"
                  sandbox="allow-scripts"
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="utf-8">
                        <script src="https://cdn.tailwindcss.com"></script>
                      </head>
                      <body class="bg-slate-950 text-slate-100 p-4 flex items-center justify-center min-h-screen">
                        ${inputHtml}
                      </body>
                    </html>
                  `}
                  className="w-full h-80 border border-slate-800 rounded-lg bg-slate-900"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
