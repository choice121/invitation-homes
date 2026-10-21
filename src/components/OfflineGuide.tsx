import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  Cpu, 
  HardDrive, 
  FolderCode, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Download
} from 'lucide-react';
import { ZERO_AI_GUIDE } from '../data/repoBreakdown';

export const OfflineGuide: React.FC = () => {
  const [activeMethodId, setActiveMethodId] = useState<'method-1' | 'method-2' | 'method-3'>('method-1');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const selectedMethod = ZERO_AI_GUIDE.methods.find((m) => m.id === activeMethodId)!;

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          100% Free • No Credit Card • Zero API Key Setup
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          How to Setup & Clone Websites Without Any API Key or External AI
        </h1>
        <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
          You do not need to pay Anthropic or OpenAI to reverse-engineer web pages. Depending on whether you want an <strong>instant algorithmic converter</strong> (deterministic, 0ms, zero-AI) or a <strong>free local AI model running on your computer GPU</strong>, choose your preferred method below:
        </p>

        {/* Method selector buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          {ZERO_AI_GUIDE.methods.map((method) => (
            <button
              key={method.id}
              onClick={() => setActiveMethodId(method.id as any)}
              className={`text-left p-4 rounded-xl border transition ${
                activeMethodId === method.id
                  ? 'border-blue-500 bg-blue-950/40 shadow-lg shadow-blue-500/10'
                  : 'border-slate-800 bg-slate-950 hover:border-slate-700'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                {method.tag}
              </div>
              <div className="font-semibold text-white text-sm mb-1">{method.title}</div>
              <div className="text-xs text-slate-400">{method.difficulty}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Method Walkthrough */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{selectedMethod.title}</h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300">
              {selectedMethod.difficulty}
            </span>
          </div>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            {selectedMethod.description}
          </p>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Step-by-Step Walkthrough
          </h3>
          <div className="space-y-3">
            {selectedMethod.steps.map((step, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  {step.startsWith('```') ? (
                    <div className="mt-1 relative font-mono text-xs bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <pre className="text-cyan-300 overflow-x-auto whitespace-pre">
                        <code>{step.replace(/```(bash)?\n?/g, '').trim()}</code>
                      </pre>
                      <button
                        onClick={() => handleCopy(step.replace(/```(bash)?\n?/g, '').trim(), `step-${idx}`)}
                        className="absolute top-2 right-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center gap-1"
                      >
                        {copiedKey === `step-${idx}` ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  ) : (
                    step
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Runnable Code Snippet */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FolderCode className="w-4 h-4 text-cyan-400" />
              Copyable Script / Command
            </h3>
            <button
              onClick={() => handleCopy(selectedMethod.codeSnippet, 'main-snippet')}
              className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
            >
              {copiedKey === 'main-snippet' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied Script!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Complete Script</span>
                </>
              )}
            </button>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-hidden">
            <pre className="text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre leading-relaxed">
              <code>{selectedMethod.codeSnippet}</code>
            </pre>
          </div>
        </div>

        {/* Local Ollama Recommended Models Table if Method 2 */}
        {activeMethodId === 'method-2' && (
          <div className="mt-6 pt-6 border-t border-slate-800">
            <h3 className="text-sm font-bold text-white mb-3">Best 100% Free Coding Models for Local Web Cloning</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <div className="font-semibold text-white text-xs">Qwen 2.5 Coder 14B</div>
                <div className="text-[11px] text-emerald-400 mt-0.5">Top Recommendation</div>
                <div className="text-xs text-slate-400 mt-2">Requires ~9GB VRAM. Superior React & Tailwind JSX generation.</div>
                <code className="block mt-2 text-[10px] font-mono bg-slate-900 p-1.5 rounded text-cyan-300">
                  ollama run qwen2.5-coder:14b
                </code>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <div className="font-semibold text-white text-xs">Qwen 2.5 Coder 7B</div>
                <div className="text-[11px] text-blue-400 mt-0.5">Best for standard Laptops</div>
                <div className="text-xs text-slate-400 mt-2">Requires ~4.5GB RAM. Runs smoothly on any M1/M2 Mac or 6GB GPU.</div>
                <code className="block mt-2 text-[10px] font-mono bg-slate-900 p-1.5 rounded text-cyan-300">
                  ollama run qwen2.5-coder:7b
                </code>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <div className="font-semibold text-white text-xs">DeepSeek Coder V2 Lite</div>
                <div className="text-[11px] text-purple-400 mt-0.5">MoE Efficiency</div>
                <div className="text-xs text-slate-400 mt-2">Fast 16B parameter Mixture-of-Experts with 2.4B active params.</div>
                <code className="block mt-2 text-[10px] font-mono bg-slate-900 p-1.5 rounded text-cyan-300">
                  ollama run deepseek-coder-v2:lite
                </code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
