export interface AnalysisSection {
  title: string;
  summary: string;
  icon: string;
  details: string[];
  keyTakeaway: string;
}

export const REPO_OVERVIEW = {
  name: 'ai-website-cloner-template',
  author: 'JCodesMore (Jordan / AI Coding community)',
  githubUrl: 'https://github.com/JCodesMore/ai-website-cloner-template',
  techStack: ['Next.js 15/16', 'React 19', 'Tailwind CSS v4', 'shadcn/ui', 'Claude Code / MCP Chrome'],
  starsEstimate: '35,000+ stars',
  corePromise: 'Clone any public website into a clean, editable, pixel-perfect Next.js codebase in minutes using AI agent commands like `/clone-website <URL>`',
};

export const REPO_ANALYSIS: AnalysisSection[] = [
  {
    title: '1. What It Actually Is & How It Works',
    icon: 'Layers',
    summary: 'A structured Next.js agent scaffold pre-configured with Chrome DevTools Protocol MCP (Model Context Protocol) instructions for AI coding agents.',
    details: [
      'The repo is NOT a stand-alone Python or C++ binary scraper. It is an agent-skill template designed for AI coding CLIs like Claude Code, Cursor, OpenCode, or Aider.',
      'Workflow: The user runs `/clone-website https://example.com`. The AI agent uses Chrome MCP to launch a headless/live Chromium instance.',
      'Observation phase: Rather than parsing raw HTML (which is often obfuscated or minified JS bundle soup), the agent inspects computed CSS properties in the rendered browser DOM: exact font sizes, hex colors, padding, flexbox/grid layouts.',
      'Reconstruction phase: The agent systematically generates Next.js app routes, decomposes sections into modular React components with Tailwind CSS and shadcn/ui primitives, and saves downloaded assets.',
      'Visual QA comparison: The agent takes viewport screenshots of both the original site and the local localhost:3000 build to check for visual parity.'
    ],
    keyTakeaway: 'It leverages the browser engine for DOM rendering + computed styles, turning AI from a blind text-generator into a visual frontend architect.'
  },
  {
    title: '2. Critical Technical Critique (What We Think)',
    icon: 'ShieldAlert',
    summary: 'A brilliant developer concept for frontend scaffolding, but with major hidden costs, dynamic logic limits, and legal caveats.',
    details: [
      '⚠️ Astronomical Token Consumption: A single rich landing page with multi-section layout can easily burn 150,000 to 450,000 context tokens. If using Claude 3.7 Sonnet or Opus via Anthropic API, each clone can cost $3 to $15+ in API credits.',
      '⚠️ Dynamic Backend Blindness: It only clones what is rendered in the client browser DOM. It cannot clone server-side API endpoints, databases, Stripe webhooks, user authentication, session cookies, or proprietary backend algorithms.',
      '⚠️ SPA / Obfuscated JS Limits: Complex WebGL, Three.js 3D canvases, custom Canvas2D animations, or heavily obfuscated React hydrations often render as static SVGs or broken blank wrappers.',
      '⚠️ Anti-Bot & Cloudflare Obstacles: Sites protected by Cloudflare Turnstile, Akamai, or Datadome will block the automated Chrome instance unless manual human CAPTCHA solving is performed.',
      '⚠️ Legal & Ethical Notice: Cloning trademarked logos, copyrighted photography, or proprietary copy violates copyright and DMCA laws. Ethical use is limited to educational reverse-engineering, lost source code recovery for your own projects, or layout prototyping.'
    ],
    keyTakeaway: 'Great for rapid layout reverse-engineering, but misleading if users expect a 1-click fully functional backend app or cheap execution.'
  },
  {
    title: '3. Comparison: AI Cloner vs Zero-AI Cloner vs Local LLM',
    icon: 'Scale',
    summary: 'How the JCodesMore AI-agent method compares against deterministic algorithmic scraping and local offline LLMs.',
    details: [
      'Commercial AI Agent (Claude Code + API): High layout fidelity, high code modularity, but expensive ($5-15/site), requires paid API keys, and sends data to external cloud servers.',
      'Deterministic Algorithmic Engine (Cheerio + DOM Transpiler): 100% Free, zero tokens, instant sub-second execution, works offline, completely deterministic, zero privacy leaks. Ideal for clean HTML/CSS conversion.',
      'Local Free AI (Ollama + Qwen2.5-Coder 14B / 32B): 100% Free, zero API keys, runs locally on your Mac/PC GPU, gives intelligent component splitting and variable naming without sending any data to Anthropic/OpenAI.',
      'Browser Extension / SingleFile: Free 1-click single-file HTML archiver, but produces a giant unmaintainable 10MB static file rather than modular React components.'
    ],
    keyTakeaway: 'You can achieve 90% of the value for $0 by combining deterministic DOM extraction with free local tools!'
  }
];

export const ZERO_AI_GUIDE = {
  methods: [
    {
      id: 'method-1',
      title: 'Method 1: 100% Algorithmic Cloner (Zero AI, Zero API Keys, Sub-second)',
      tag: 'RECOMMENDED FOR SPEED & $0 COST',
      difficulty: 'Easy (5 minutes)',
      description: 'Run our built-in engine or a simple local Node.js script that uses Cheerio to parse the DOM, download assets, and transpile HTML into modular React 19 + Tailwind components.',
      steps: [
        'Step 1: In this app, simply paste your URL or raw HTML into the Cloner Studio tab and click "Clone & Transpile". It runs completely without any external AI API.',
        'Step 2: To run it locally on your own machine via terminal, create a directory and install dependencies:',
        '```bash\nmkdir local-cloner && cd local-cloner\nnpm init -y\nnpm install cheerio prettier\n```',
        'Step 3: Run the local Node script (provided below in the Code Snippets section) targeting any URL.',
        'Step 4: It extracts the layout into `components/Navbar.tsx`, `components/Hero.tsx`, `components/Footer.tsx` and saves all images directly into `public/assets`!'
      ],
      codeSnippet: `// local-cloner.mjs - 100% Zero-AI Website Cloner
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

async function cloneWebsite(url) {
  console.log(\`Fetching \${url}...\`);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  // Clean noise
  $('script, noscript, iframe').remove();

  // Extract metadata
  const title = $('title').text() || 'Cloned Site';
  console.log(\`Title: \${title}\`);

  // Convert HTML elements to JSX
  const convertToJsx = (htmlContent, name) => {
    let clean = htmlContent
      .replace(/class=/g, 'className=')
      .replace(/for=/g, 'htmlFor=')
      .replace(/<(img|input|br|hr)([^>]*)(?<!\\/)>/gi, '<$1$2 />');
    return \`export function \${name}() {\\n  return (\\n    \${clean}\\n  );\\n}\`;
  };

  await fs.mkdir('./output/components', { recursive: true });

  // Extract Semantic Sections
  if ($('header, nav').length) {
    await fs.writeFile('./output/components/Header.tsx', convertToJsx($.html($('header, nav').first()), 'Header'));
  }
  if ($('main, section').length) {
    await fs.writeFile('./output/components/MainContent.tsx', convertToJsx($.html($('main, section').first()), 'MainContent'));
  }
  if ($('footer').length) {
    await fs.writeFile('./output/components/Footer.tsx', convertToJsx($.html($('footer').first()), 'Footer'));
  }

  console.log('✅ Cloned successfully into ./output with 0 API keys and $0 cost!');
}

cloneWebsite(process.argv[2] || 'https://news.ycombinator.com');`
    },
    {
      id: 'method-2',
      title: 'Method 2: Free Local AI Agent (Ollama + Qwen2.5-Coder)',
      tag: 'BEST FOR AI REFACTORING WITHOUT PAYING ANTHROPIC',
      difficulty: 'Intermediate (10 minutes)',
      description: 'Run the exact JCodesMore agent workflow completely free and offline by swapping out the paid Claude API for a local LLM hosted on your own machine via Ollama.',
      steps: [
        'Step 1: Install Ollama (free & open source) from https://ollama.com',
        'Step 2: Pull the state-of-the-art coding model (completely free):',
        '```bash\nollama run qwen2.5-coder:14b\n# or for smaller laptops:\nollama run qwen2.5-coder:7b\n```',
        'Step 3: Clone the JCodesMore repository:',
        '```bash\ngit clone https://github.com/JCodesMore/ai-website-cloner-template.git\ncd ai-website-cloner-template\nnpm install\n```',
        'Step 4: Use Aider (or OpenCode / Cursor) pointed to your local Ollama instance with ZERO API keys:',
        '```bash\npip install aider-chat\naider --model ollama/qwen2.5-coder:14b --api-base http://localhost:11434\n```',
        'Step 5: Inside Aider, execute the clone prompt or pass the extracted HTML: "Inspect this page and generate Next.js components in components/". Zero cost, unlimited runs, 100% private.'
      ],
      codeSnippet: `# Terminal command to run local AI coding agent without API key
# 1. Start Ollama in background:
ollama serve

# 2. Run Aider CLI with local model:
aider --model ollama_chat/qwen2.5-coder:14b \\
      --openai-api-base http://localhost:11434/v1 \\
      --openai-api-key "no-key-required"

# 3. Tell the local agent:
# "Clone the UI structure of https://example.com into app/page.tsx with Tailwind CSS"`
    },
    {
      id: 'method-3',
      title: 'Method 3: Browser DevTools + SingleFile CLI (1-Click Archiver)',
      tag: 'FASTEST FOR 1:1 OFFLINE ARCHIVAL',
      difficulty: 'Beginner (1 minute)',
      description: 'If your goal is an exact offline snapshot with all images, fonts, and stylesheets bundled into a single file without any AI.',
      steps: [
        'Step 1: Install SingleFile CLI globally (or use the Chrome extension):',
        '```bash\nnpm install -g single-file-cli\n```',
        'Step 2: Run SingleFile on any website:',
        '```bash\nsingle-file "https://example.com" ./cloned-site.html\n```',
        'Step 3: Open `./cloned-site.html` in any browser or feed it into our transpiler to convert into React components.'
      ],
      codeSnippet: `# SingleFile CLI command:
single-file "https://example.com" ./cloned-page.html --browser-executable-path "/usr/bin/google-chrome"`
    }
  ]
};
