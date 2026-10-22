import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
import { ApplicationApiEnvironment, handleApplicationNotificationDispatch, handleApplicationStatusUpdate, handleApplicationSubmission, handleApplicationVerification, handleApplicationVerificationConfirmation } from './src/services/applicationApi';
import {
  getStagedProperties,
  addStagedProperty,
  updateStagedStatus,
  publishStagedProperty,
  scrapePublicListingUrl
} from './src/services/stagingPipeline';
import {
  recordManualPayment,
  getPaymentRecords,
  getLeaseAgreements,
  createLeaseAgreement,
  updateLeaseStatus,
  getInspections,
  submitPropertyInspection,
  reviewInspection,
  getAuditLogs
} from './src/services/adminOperations';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ExtractedAsset {
  type: 'image' | 'svg' | 'stylesheet' | 'script' | 'font';
  url: string;
  alt?: string;
}

interface PageSection {
  id: string;
  name: string;
  tag: string;
  htmlSnippet: string;
  reactCode: string;
  elementCount: number;
}

interface ClonedSiteData {
  url: string;
  title: string;
  metaDescription: string;
  favicon: string;
  colors: string[];
  fonts: string[];
  sections: PageSection[];
  assets: ExtractedAsset[];
  fullReactComponent: string;
  nextjsPageCode: string;
  tailwindConfigSnippet: string;
  stats: {
    totalElements: number;
    totalImages: number;
    totalLinks: number;
    totalSections: number;
    estimatedReadTime: string;
  };
}

// Convert HTML string to clean React JSX code
function convertHtmlToJsx(html: string, componentName: string = 'ClonedComponent'): string {
  if (!html) return `export function ${componentName}() {\n  return <div>No content</div>;\n}`;

  let clean = html.trim();

  // Replace class= with className=
  clean = clean.replace(/\bclass="/g, 'className="');
  clean = clean.replace(/\bclass='/g, "className='");

  // Replace for= with htmlFor=
  clean = clean.replace(/\bfor="/g, 'htmlFor="');
  clean = clean.replace(/\bfor='/g, "htmlFor='");

  // Replace tabindex= with tabIndex=
  clean = clean.replace(/\btabindex=/g, 'tabIndex=');

  // Replace autocomplete= with autoComplete=
  clean = clean.replace(/\bautocomplete=/g, 'autoComplete=');

  // Replace inline styles string style="..." to style={{ ... }} if present
  clean = clean.replace(/style="([^"]*)"/g, (_, styleStr) => {
    const rules = styleStr.split(';').filter((r: string) => r.trim().length > 0);
    const styleObj: Record<string, string> = {};
    for (const rule of rules) {
      const [key, ...vals] = rule.split(':');
      if (key && vals.length > 0) {
        const camelKey = key.trim().replace(/-([a-z])/g, (g: string) => g[1].toUpperCase());
        styleObj[camelKey] = vals.join(':').trim();
      }
    }
    return `style={${JSON.stringify(styleObj)}}`;
  });

  // Ensure void elements are self-closed: <img ...>, <input ...>, <br>, <hr>
  clean = clean.replace(/<(img|input|br|hr|meta|link)([^>]*)(?<!\/)>/gi, '<$1$2 />');

  // Replace HTML comments
  clean = clean.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');

  return `import React from 'react';

export function ${componentName}() {
  return (
    ${clean}
  );
}
`;
}

// Extract colors from CSS/HTML
function extractColors(html: string): string[] {
  const hexRegex = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/g;
  const rgbRegex = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)/g;
  const colors = new Set<string>();

  const hexMatches = html.match(hexRegex) || [];
  for (const c of hexMatches) {
    if (c.length === 4 || c.length === 7) {
      colors.add(c.toLowerCase());
    }
  }

  const rgbMatches = html.match(rgbRegex) || [];
  for (const c of rgbMatches) {
    colors.add(c);
  }

  return Array.from(colors).slice(0, 16);
}

// Extract fonts from CSS/HTML
function extractFonts(html: string): string[] {
  const fontRegex = /font-family:\s*([^;]+);/gi;
  const fonts = new Set<string>();
  let match;
  while ((match = fontRegex.exec(html)) !== null) {
    const fontVal = match[1].split(',')[0].replace(/['"]/g, '').trim();
    if (fontVal && fontVal.length > 2 && !['inherit', 'initial', 'unset', 'sans-serif', 'serif', 'monospace'].includes(fontVal.toLowerCase())) {
      fonts.add(fontVal);
    }
  }
  return Array.from(fonts).slice(0, 8);
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.post('/api/applications', express.json({ limit: '16kb' }), async (req, res) => {
    try {
      const headers = new Headers({ 'Content-Type': 'application/json' });
      const origin = req.get('origin');
      if (origin) headers.set('Origin', origin);
      const idempotencyKey = req.get('idempotency-key');
      if (idempotencyKey) headers.set('Idempotency-Key', idempotencyKey);
      const request = new Request('http://localhost/api/applications', {
        method: 'POST',
        headers,
        body: JSON.stringify(req.body)
      });
      const response = await handleApplicationSubmission(
        request,
        process.env as ApplicationApiEnvironment,
        req.ip || req.socket.remoteAddress || 'unknown'
      );
      res.status(response.status).set(Object.fromEntries(response.headers.entries())).send(await response.text());
    } catch {
      res.status(400).json({ error: 'Invalid application request.' });
    }
  });

  app.get('/api/applications/verify', async (req, res) => {
    const requestUrl = new URL('http://localhost/api/applications/verify');
    if (typeof req.query.token === 'string') requestUrl.searchParams.set('token', req.query.token);
    const request = new Request(requestUrl);
    const response = await handleApplicationVerification(request, process.env as ApplicationApiEnvironment);
    res.status(response.status).set(Object.fromEntries(response.headers.entries())).send(await response.text());
  });

  app.post('/api/applications/verify', express.urlencoded({ extended: false, limit: '4kb' }), async (req, res) => {
    const request = new Request('http://localhost/api/applications/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(req.get('origin') ? { Origin: req.get('origin')! } : {})
      },
      body: new URLSearchParams({ token: typeof req.body?.token === 'string' ? req.body.token : '' })
    });
    const response = await handleApplicationVerificationConfirmation(request, process.env as ApplicationApiEnvironment);
    res.status(response.status).set(Object.fromEntries(response.headers.entries())).send(await response.text());
  });

  app.post('/api/internal/dispatch-notifications', express.json({ limit: '1kb' }), async (req, res) => {
    const request = new Request('http://localhost/api/internal/dispatch-notifications', {
      method: 'POST',
      headers: { Authorization: req.get('authorization') || '' },
      body: '{}'
    });
    const response = await handleApplicationNotificationDispatch(request, process.env as ApplicationApiEnvironment);
    res.status(response.status).set(Object.fromEntries(response.headers.entries())).send(await response.text());
  });

  app.post('/api/internal/applications/:id/status', express.json({ limit: '16kb' }), async (req, res) => {
    const request = new Request(`http://localhost/api/internal/applications/${req.params.id}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: req.get('authorization') || ''
      },
      body: JSON.stringify({
        applicationId: req.params.id,
        ...req.body
      })
    });
    const response = await handleApplicationStatusUpdate(request, process.env as ApplicationApiEnvironment);
    res.status(response.status).set(Object.fromEntries(response.headers.entries())).send(await response.text());
  });

  // Staging Pipeline & Importer Routes
  app.get('/api/pipeline/staged', async (_req, res) => {
    try {
      const staged = await getStagedProperties();
      res.json(staged);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to fetch staged properties' });
    }
  });

  app.post('/api/pipeline/scrape-url', express.json({ limit: '16kb' }), async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Please provide a valid listing URL.' });
      }
      const data = await scrapePublicListingUrl(url);
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to extract listing metadata' });
    }
  });

  app.post('/api/pipeline/stage', express.json({ limit: '64kb' }), async (req, res) => {
    try {
      const staged = await addStagedProperty(req.body);
      res.status(201).json(staged);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to stage property' });
    }
  });

  app.post('/api/pipeline/:id/publish', async (req, res) => {
    try {
      const result = await publishStagedProperty(req.params.id);
      if (!result.success) return res.status(400).json({ error: result.error });
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to publish property' });
    }
  });

  app.post('/api/pipeline/:id/reject', async (req, res) => {
    try {
      await updateStagedStatus(req.params.id, 'rejected');
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to reject staged property' });
    }
  });

  // Manual Payment Recording
  app.post('/api/internal/applications/:id/payment', express.json({ limit: '16kb' }), async (req, res) => {
    try {
      const record = await recordManualPayment(req.params.id, req.body);
      res.status(201).json(record);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to record payment' });
    }
  });

  app.get('/api/internal/applications/:id/payments', async (req, res) => {
    try {
      const records = await getPaymentRecords(req.params.id);
      res.json(records);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to retrieve payment records' });
    }
  });

  // Leases Management
  app.get('/api/internal/leases', async (req, res) => {
    try {
      const tenantEmail = typeof req.query.email === 'string' ? req.query.email : undefined;
      const leases = await getLeaseAgreements(tenantEmail);
      res.json(leases);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to fetch leases' });
    }
  });

  app.post('/api/internal/leases', express.json({ limit: '32kb' }), async (req, res) => {
    try {
      const lease = await createLeaseAgreement(req.body);
      res.status(201).json(lease);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to create lease' });
    }
  });

  app.post('/api/internal/leases/:id/status', express.json({ limit: '16kb' }), async (req, res) => {
    try {
      const ok = await updateLeaseStatus(req.params.id, req.body.status);
      res.json({ success: ok });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to update lease status' });
    }
  });

  // Inspections
  app.get('/api/internal/inspections', async (req, res) => {
    try {
      const tenantEmail = typeof req.query.email === 'string' ? req.query.email : undefined;
      const inspections = await getInspections(tenantEmail);
      res.json(inspections);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to fetch inspections' });
    }
  });

  app.post('/api/tenant/inspection', express.json({ limit: '64kb' }), async (req, res) => {
    try {
      const inspection = await submitPropertyInspection(req.body);
      res.status(201).json(inspection);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to submit inspection' });
    }
  });

  app.post('/api/internal/inspections/:id/review', express.json({ limit: '16kb' }), async (req, res) => {
    try {
      const ok = await reviewInspection(req.params.id, req.body.status || 'reviewed');
      res.json({ success: ok });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to review inspection' });
    }
  });

  // Audit Logs
  app.get('/api/internal/audit-logs', async (_req, res) => {
    try {
      const logs = await getAuditLogs();
      res.json(logs);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to fetch audit logs' });
    }
  });

  // Chrome Extension Download
  app.get('/api/extension/download', (_req, res) => {
    const zipPath = path.resolve(__dirname, 'public/extension/invitation-homes-importer.zip');
    if (fs.existsSync(zipPath)) {
      res.download(zipPath, 'invitation-homes-importer.zip');
    } else {
      res.status(404).json({ error: 'Extension bundle not generated yet.' });
    }
  });

  if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_CLONER_API === 'true') {
    app.use(express.json({ limit: '20mb' }));

    // Scrape & transpile route
    app.post('/api/clone', async (req, res) => {
    try {
      const { url, rawHtml } = req.body;
      let targetHtml = '';
      let targetUrl = url || 'https://example.com';

      if (rawHtml && rawHtml.trim().length > 0) {
        targetHtml = rawHtml;
      } else if (url) {
        try {
          const fetchRes = await fetch(url, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
              Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
            },
            signal: AbortSignal.timeout(12000),
          });

          if (!fetchRes.ok) {
            throw new Error(`HTTP ${fetchRes.status}: ${fetchRes.statusText}`);
          }
          targetHtml = await fetchRes.text();
        } catch (fetchErr: any) {
          // If live fetch fails due to bot protection or CORS/network, notify with structured fallback
          return res.status(400).json({
            error: `Could not fetch ${url} directly: ${fetchErr.message}. You can paste the page's HTML directly into the Raw HTML tab or try another URL.`,
          });
        }
      } else {
        return res.status(400).json({ error: 'Please provide either a URL or raw HTML code.' });
      }

      const $ = cheerio.load(targetHtml);

      // Clean out scripts, tracking tags, and noise
      $('script:not([type="application/ld+json"])').remove();
      $('noscript').remove();
      $('iframe').remove();

      const title = $('title').text().trim() || $('meta[property="og:title"]').attr('content') || 'Cloned Website';
      const metaDescription =
        $('meta[name="description"]').attr('content') ||
        $('meta[property="og:description"]').attr('content') ||
        '';

      let favicon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href') || '';
      if (favicon && !favicon.startsWith('http') && !favicon.startsWith('data:')) {
        try {
          favicon = new URL(favicon, targetUrl).toString();
        } catch {
          // ignore
        }
      }

      // Assets
      const assets: ExtractedAsset[] = [];
      $('img').each((_, el) => {
        let src = $(el).attr('src') || $(el).attr('data-src') || '';
        const alt = $(el).attr('alt') || '';
        if (src) {
          if (!src.startsWith('http') && !src.startsWith('data:')) {
            try {
              src = new URL(src, targetUrl).toString();
            } catch {
              // ignore
            }
          }
          assets.push({ type: 'image', url: src, alt });
        }
      });

      $('link[rel="stylesheet"]').each((_, el) => {
        let href = $(el).attr('href') || '';
        if (href) {
          if (!href.startsWith('http')) {
            try {
              href = new URL(href, targetUrl).toString();
            } catch {
              // ignore
            }
          }
          assets.push({ type: 'stylesheet', url: href });
        }
      });

      // Colors & Fonts
      const colors = extractColors(targetHtml);
      const fonts = extractFonts(targetHtml);

      // Extract sections
      const sections: PageSection[] = [];
      const sectionSelectors = [
        { selector: 'header, nav, [role="banner"]', name: 'Header & Navigation', id: 'header' },
        { selector: '#hero, .hero, [class*="hero"], [data-section="hero"]', name: 'Hero Section', id: 'hero' },
        { selector: 'main > section, [role="main"] > section, section', name: 'Main Section', id: 'section' },
        { selector: '#features, .features, [class*="features"]', name: 'Features Grid', id: 'features' },
        { selector: '#pricing, .pricing, [class*="pricing"]', name: 'Pricing Table', id: 'pricing' },
        { selector: '#testimonials, .testimonials, [class*="testimonial"]', name: 'Testimonials', id: 'testimonials' },
        { selector: '#faq, .faq, [class*="faq"], [class*="accordion"]', name: 'FAQ Accordion', id: 'faq' },
        { selector: 'footer, [role="contentinfo"]', name: 'Footer', id: 'footer' },
      ];

      const foundElements = new Set<any>();

      for (const def of sectionSelectors) {
        $(def.selector).each((idx, el) => {
          if (foundElements.has(el)) return;
          foundElements.add(el);

          const snippet = $.html(el);
          // Only include if meaningful content (> 40 chars)
          if (snippet && snippet.length > 40 && sections.length < 8) {
            const compName = `${def.id.charAt(0).toUpperCase() + def.id.slice(1)}Section${idx > 0 ? idx + 1 : ''}`;
            const reactCode = convertHtmlToJsx(snippet, compName);
            sections.push({
              id: `${def.id}-${idx}`,
              name: `${def.name} ${idx > 0 ? `#${idx + 1}` : ''}`.trim(),
              tag: (el as any).tagName || 'div',
              htmlSnippet: snippet,
              reactCode,
              elementCount: $(el).find('*').length + 1,
            });
          }
        });
      }

      // If no semantic sections were captured, slice body into logical chunks
      if (sections.length === 0) {
        const bodyHtml = $('body').html() || targetHtml;
        $('body > *').each((idx, el) => {
          const snippet = $.html(el);
          if (snippet && snippet.length > 30 && sections.length < 6) {
            const tag = (el as any).tagName || 'div';
            const compName = `Block${idx + 1}`;
            sections.push({
              id: `block-${idx}`,
              name: `Block #${idx + 1} (<${tag}>)`,
              tag,
              htmlSnippet: snippet,
              reactCode: convertHtmlToJsx(snippet, compName),
              elementCount: $(el).find('*').length + 1,
            });
          }
        });
      }

      // Generate full Next.js page code
      const bodyInnerHtml = $('body').html() || '';
      const fullJsx = convertHtmlToJsx(bodyInnerHtml || '<div>Cloned Content</div>', 'ClonedPage');

      const nextjsPageCode = `// Generated with Zero-AI Cloner Engine
// Framework: Next.js 15+ / React 19 / Tailwind CSS
import React from 'react';
import Head from 'next/head';

${sections
  .map(
    (s, i) =>
      `function ${s.id.replace(/-(\w)/g, (_, c) => c.toUpperCase())}() {\n  return (\n    ${s.htmlSnippet
        .replace(/class=/g, 'className=')
        .replace(/for=/g, 'htmlFor=')
        .replace(/<!--[\s\S]*?-->/g, '')}\n  );\n}`
  )
  .join('\n\n')}

export default function Page() {
  return (
    <>
      <Head>
        <title>${title.replace(/"/g, '\\"')}</title>
        <meta name="description" content="${metaDescription.replace(/"/g, '\\"')}" />
      </Head>
      <main className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        ${sections.map((s) => `<${s.id.replace(/-(\w)/g, (_, c) => c.toUpperCase())} />`).join('\n        ')}
      </main>
    </>
  );
}
`;

      const tailwindConfigSnippet = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '${colors[0] || '#3b82f6'}',
          secondary: '${colors[1] || '#10b981'}',
          accent: '${colors[2] || '#8b5cf6'}',
        },
      },
      fontFamily: {
        sans: ['${fonts[0] || 'Inter'}', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
`;

      const totalElements = $('*').length;
      const totalImages = assets.filter((a) => a.type === 'image').length;
      const totalLinks = $('a').length;

      const result: ClonedSiteData = {
        url: targetUrl,
        title,
        metaDescription,
        favicon,
        colors,
        fonts,
        sections,
        assets: assets.slice(0, 30),
        fullReactComponent: fullJsx,
        nextjsPageCode,
        tailwindConfigSnippet,
        stats: {
          totalElements,
          totalImages,
          totalLinks,
          totalSections: sections.length,
          estimatedReadTime: `${Math.max(1, Math.round(totalElements / 80))} min reconstruct`,
        },
      };

      res.json(result);
    } catch (err: any) {
      console.error('Error cloning site:', err);
      res.status(500).json({ error: err.message || 'Failed to process website' });
    }
    });

    // Transpile custom snippet endpoint
    app.post('/api/transpile', (req, res) => {
    try {
      const { html, componentName } = req.body;
      if (!html) {
        return res.status(400).json({ error: 'No HTML provided' });
      }
      const jsx = convertHtmlToJsx(html, componentName || 'CustomComponent');
      res.json({ code: jsx });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Transpilation failed' });
    }
    });
  }

  // Vite middleware in dev or static files in prod
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
