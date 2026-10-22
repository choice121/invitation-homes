import React, { useState } from 'react';
import { 
  Rocket, 
  Database, 
  Home, 
  Key, 
  DollarSign, 
  Code2, 
  Sparkles, 
  ArrowRight, 
  Copy, 
  Check, 
  Server, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink,
  Laptop
} from 'lucide-react';

interface Playbook {
  id: string;
  title: string;
  badge: string;
  icon: any;
  summary: string;
  steps: {
    title: string;
    description: string;
    code?: string;
  }[];
  architectureTip: string;
}

const PLAYBOOKS: Playbook[] = [
  {
    id: 'proptech-platform',
    title: '1. Launch a Real Estate / Rental SaaS Platform',
    badge: 'COMMERCIAL PRODUCT',
    icon: Home,
    summary: 'Transform this Invitation Homes frontend into a functional property leasing marketplace by connecting live MLS/IDX rental feeds, database models, and tenant accounts.',
    steps: [
      {
        title: 'Step 1: Connect Live MLS / Rental Data API',
        description: 'Replace the mock markets with real-time rental listings from RentCast API, SimplyRETS, or Realty Mole API.',
        code: `// lib/rentals.ts - Fetch live single-family rental listings
export async function getLiveRentals(city: string, state: string, maxPrice?: number) {
  const RENTCAST_API_KEY = process.env.RENTCAST_API_KEY;
  const url = new URL('https://api.rentcast.io/v1/listings/rental/long-term');
  url.searchParams.set('city', city);
  url.searchParams.set('state', state);
  url.searchParams.set('propertyType', 'Single Family');
  url.searchParams.set('status', 'Active');
  if (maxPrice) url.searchParams.set('maxPrice', String(maxPrice));

  const res = await fetch(url.toString(), {
    headers: { 'X-Api-Key': RENTCAST_API_KEY || '' },
    next: { revalidate: 3600 } // Cache for 1 hour in Next.js
  });
  return res.json();
}`
      },
      {
        title: 'Step 2: Database Schema (PostgreSQL / Supabase)',
        description: 'Define your persistent relational database tables for properties, lease applications, and maintenance tickets.',
        code: `-- SQL schema for Single-Family Rental Platform
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  bedrooms INT NOT NULL,
  bathrooms NUMERIC(3,1) NOT NULL,
  square_feet INT NOT NULL,
  monthly_rent NUMERIC(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'available', -- available, pending, leased
  images TEXT[] DEFAULT '{}',
  smart_home_enabled BOOLEAN DEFAULT true,
  pet_friendly BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lease_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT NOT NULL,
  monthly_income NUMERIC(10,2) NOT NULL,
  credit_score INT,
  status VARCHAR(20) DEFAULT 'under_review',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`
      },
      {
        title: 'Step 3: Manual Staff Payment Verification & Audit Records',
        description: 'Record and verify manual payments (Zelle, Venmo, Cash App, Card receipts, ACH) with staff attribution and audit reference codes.',
        code: `// services/adminOperations.ts
export async function recordPayment(applicationId: string, method: string, ref: string, amount: number) {
  // Permanent manual payment tracking with staff audit logging
  return recordManualPayment(applicationId, {
    paymentType: 'holding_deposit',
    method: method as any,
    referenceCode: ref,
    amount,
    status: 'verified',
    verifiedBy: 'Staff Operator'
  });
}`
      }
    ],
    architectureTip: 'You now possess a $20,000+ agency-grade single-family rental frontend that only needs API endpoints connected to become a full business.'
  },
  {
    id: 'agency-cloner',
    title: '2. Agency / Freelance Client Modernization Engine',
    badge: 'CLIENT WORKFLOW',
    icon: Laptop,
    summary: 'Use the cloner tool to instantly reverse-engineer prospective clients’ outdated websites and pitch them a modern Next.js 15 + Tailwind revamp on day one.',
    steps: [
      {
        title: 'Step 1: Scrape Prospective Client Site in 5 Seconds',
        description: 'Paste any prospect’s website URL into the Cloner Studio. The AST engine automatically extracts their logo, colors, copy, and layout into modular React components.',
      },
      {
        title: 'Step 2: Export Clean Next.js Project Bundle',
        description: 'Click "Export Project ZIP" to download a clean repository with 0 legacy bloat (no bloated WordPress PHP, jQuery, or outdated plugins).',
      },
      {
        title: 'Step 3: Present a Live Working Prototype Before Signing',
        description: 'Deploy to Vercel in 60 seconds with `vercel --prod`. Send the client a lightning-fast modern prototype during your discovery call to dramatically increase close rates.',
      }
    ],
    architectureTip: 'Agency pitch advantage: "While other agencies take 4 weeks to show wireframes, we already transformed your current site into modern React 19."'
  },
  {
    id: 'offline-agent',
    title: '3. Unlimited $0 Local AI Coding Studio',
    badge: 'ZERO API COSTS',
    icon: Code2,
    summary: 'Run the exact JCodesMore agent methodology indefinitely on your local machine using free open-source models with zero token bills.',
    steps: [
      {
        title: 'Step 1: Setup Local Ollama Backend',
        description: 'Run `ollama serve` and pull `qwen2.5-coder:14b` or `qwen2.5-coder:7b`.',
        code: `# Run once in your terminal:
curl -fsSL https://ollama.com/install.sh | sh
ollama run qwen2.5-coder:14b`
      },
      {
        title: 'Step 2: Connect Aider / Cursor without API Keys',
        description: 'Point your agent directly to localhost:11434 with zero Anthropic/OpenAI keys.',
        code: `# Connect Aider to your local Ollama:
aider --model ollama_chat/qwen2.5-coder:14b \\
      --openai-api-base http://localhost:11434/v1 \\
      --openai-api-key "no-key-required"`
      },
      {
        title: 'Step 3: Batch Process Unlimited Websites',
        description: 'Feed any extracted HTML from our tool into your local agent to refactor into shadcn/ui components, write tests, or generate documentation with zero dollars spent.',
      }
    ],
    architectureTip: 'Zero cloud dependencies, zero privacy leaks, zero monthly subscriptions.'
  },
  {
    id: 'deployment-guide',
    title: '4. 1-Click Production Deployment to Vercel / Cloudflare',
    badge: 'DEPLOYMENT',
    icon: Rocket,
    summary: 'Take any cloned project and deploy it publicly with global CDN edge routing and free SSL in under 2 minutes.',
    steps: [
      {
        title: 'Step 1: Unzip the Exported Project',
        description: 'Extract `cloned-invitationhomes.zip` onto your computer.',
        code: `unzip cloned-invitationhomes.zip -d my-rental-app
cd my-rental-app
npm install`
      },
      {
        title: 'Step 2: Push to GitHub',
        description: 'Create a private or public repository on GitHub.',
        code: `git init
git add .
git commit -m "Initial commit from Zero-AI Cloner"
git branch -M main
git remote add origin https://github.com/yourusername/my-rental-app.git
git push -u origin main`
      },
      {
        title: 'Step 3: Deploy to Vercel / Cloudflare Pages',
        description: 'Import the GitHub repo into Vercel or run the CLI for instant deployment.',
        code: `# Using Vercel CLI:
npx vercel deploy --prod`
      }
    ],
    architectureTip: 'Next.js 15 is automatically recognized by Vercel and builds with zero configuration.'
  }
];

export const FutureUseCases: React.FC = () => {
  const [activePlaybookId, setActivePlaybookId] = useState<string>('proptech-platform');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activePlaybook = PLAYBOOKS.find((p) => p.id === activePlaybookId)!;

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/40 border border-emerald-500/30 rounded-2xl p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
          <Rocket className="w-3.5 h-3.5" />
          Production Playbooks &amp; Long-Term Value
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          How to Use This Project in the Future
        </h1>
        <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
          This project gives you both a <strong>production-ready PropTech frontend</strong> and a <strong>reusable Zero-AI cloning engine</strong>. Below are four battle-tested strategic playbooks for leveraging it in commercial products, client freelancing, and local offline development:
        </p>

        {/* Playbook Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {PLAYBOOKS.map((p) => {
            const Icon = p.icon;
            const isActive = activePlaybookId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePlaybookId(p.id)}
                className={`text-left p-4 rounded-xl border transition flex flex-col justify-between ${
                  isActive
                    ? 'border-[#04a54f] bg-emerald-950/40 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {p.badge}
                    </span>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1">{p.title}</h3>
                </div>
                <div className="text-xs text-slate-400 mt-2 line-clamp-2">
                  {p.summary}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Playbook Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              {activePlaybook.title}
            </h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300">
              {activePlaybook.badge}
            </span>
          </div>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed max-w-3xl">
            {activePlaybook.summary}
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Actionable Roadmap
          </h3>
          <div className="space-y-4">
            {activePlaybook.steps.map((step, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#04a54f]/20 text-[#04a54f] flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <h4 className="font-bold text-white text-sm sm:text-base">{step.title}</h4>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-8">
                  {step.description}
                </p>

                {step.code && (
                  <div className="ml-8 relative">
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 overflow-hidden">
                      <pre className="text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre leading-relaxed">
                        <code>{step.code}</code>
                      </pre>
                    </div>
                    <button
                      onClick={() => handleCopy(step.code!, `step-${idx}`)}
                      className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1 font-medium transition"
                    >
                      {copiedKey === `step-${idx}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pro Tip Box */}
        <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-emerald-400 block mb-0.5">Strategic Advantage:</strong>
            {activePlaybook.architectureTip}
          </div>
        </div>
      </div>
    </div>
  );
};
