import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const outputDirectory = path.resolve('.artifacts/visual-parity');
const targets = [
  { name: 'official', url: process.env.ORIGINAL_URL ?? 'https://www.invitationhomes.com/' },
  { name: 'local', url: process.env.LOCAL_URL ?? 'http://localhost:3000/' }
];
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = [];

try {
  for (const target of targets) {
    for (const viewport of viewports) {
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        locale: 'en-US',
        colorScheme: 'light'
      });
      const pageErrors = [];
      const consoleErrors = [];
      const failedRequests = [];

      page.on('pageerror', (error) => pageErrors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });
      page.on('requestfailed', (request) => {
        failedRequests.push({ url: request.url(), error: request.failure()?.errorText });
      });

      let responseStatus = null;
      let navigationError = null;
      try {
        const response = await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        responseStatus = response?.status() ?? null;
        await page.waitForTimeout(1500);
        await page.evaluate(() => document.fonts.ready);
      } catch (error) {
        navigationError = error instanceof Error ? error.message : String(error);
      }

      const filename = `${target.name}-home-${viewport.name}.png`;
      if (!navigationError) {
        await page.screenshot({
          path: path.join(outputDirectory, filename),
          fullPage: true,
          animations: 'disabled'
        });
      }

      const metrics = navigationError ? null : await page.evaluate(() => {
        const root = document.documentElement;
        const images = Array.from(document.images);
        return {
          title: document.title,
          headings: Array.from(document.querySelectorAll('h1, h2, h3'))
            .map((heading) => heading.textContent?.trim().replace(/\s+/g, ' '))
            .filter(Boolean)
            .slice(0, 24),
          viewportWidth: window.innerWidth,
          documentWidth: root.scrollWidth,
          horizontalOverflow: root.scrollWidth > window.innerWidth + 1,
          documentHeight: root.scrollHeight,
          imageCount: images.length,
          brokenImages: images
            .filter((image) => image.complete && image.naturalWidth === 0)
            .map((image) => image.currentSrc || image.src)
        };
      });

      let mobileMenu = null;
      if (target.name === 'local' && viewport.name === 'mobile' && !navigationError) {
        const menuButton = page.locator('button[aria-controls="mobile-navigation"]');
        if (await menuButton.count()) {
          await menuButton.click();
          mobileMenu = await menuButton.getAttribute('aria-expanded');
          await page.screenshot({
            path: path.join(outputDirectory, 'local-mobile-menu-open.png'),
            fullPage: false,
            animations: 'disabled'
          });
        }
      }

      report.push({
        target: target.name,
        url: target.url,
        viewport: viewport.name,
        responseStatus,
        screenshot: navigationError ? null : filename,
        navigationError,
        metrics,
        mobileMenuExpanded: mobileMenu === 'true',
        pageErrors,
        consoleErrors: consoleErrors.slice(0, 10),
        failedRequests: failedRequests.slice(0, 10)
      });
      await page.close();
    }
  }
} finally {
  await browser.close();
}

await writeFile(path.join(outputDirectory, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
console.log(`Screenshots and report: ${outputDirectory}`);