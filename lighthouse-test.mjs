import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { spawn } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';

// All public pages on the site
const PUBLIC_PAGES = [
  '/',
  '/articles/index.html',
  '/articles/ai-woodworking-design.html',
  '/articles/benefits-custom-furniture.html',
  '/articles/box-joint-jig.html',
  '/articles/dovetailed-tea-box.html',
  '/articles/joinery-strength.html',
  '/articles/staining-guide.html',
  '/articles/wood-glue-guide.html',
  '/articles/sandpaper-guide.html',
];

const THRESHOLD = 90;
const PORT = 8234; // Avoid common ports

async function runLighthouse(url, chrome) {
  const result = await lighthouse(url, {
    port: chrome.port,
    output: 'json',
    logLevel: 'error',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  });
  return result;
}

async function main() {
  console.log('Starting local server...');
  const server = spawn('npx', ['serve', '-l', String(PORT), '.'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  
  // Wait for server to be ready
  await new Promise((resolve) => {
    server.stdout.on('data', (data) => {
      const str = data.toString();
      if (str.includes('Accepting connections') || str.includes('http')) {
        resolve();
      }
    });
    // Fallback timeout
    setTimeout(resolve, 3000);
  });

  console.log(`Server running on port ${PORT}`);

  // Launch Chrome
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
  });

  console.log(`Chrome running on port ${chrome.port}\n`);

  // Create results directory
  mkdirSync('lighthouse-reports', { recursive: true });

  const results = [];
  let allPassed = true;

  for (const pagePath of PUBLIC_PAGES) {
    const url = `http://localhost:${PORT}${pagePath}`;
    const pageName = pagePath === '/' ? 'index' : pagePath.replace(/^\//, '').replace(/\.html$/, '').replace(/\//g, '-');
    
    console.log(`Testing: ${pagePath}`);
    
    try {
      const result = await runLighthouse(url, chrome);
      const categories = result.lhr.categories;
      
      const scores = {
        page: pagePath,
        performance: Math.round(categories.performance.score * 100),
        accessibility: Math.round(categories.accessibility.score * 100),
        'best-practices': Math.round(categories['best-practices'].score * 100),
        seo: Math.round(categories.seo.score * 100),
      };

      // Check if all scores pass
      const passed = Object.entries(scores)
        .filter(([key]) => key !== 'page')
        .every(([, score]) => score >= THRESHOLD);

      if (!passed) allPassed = false;

      scores.passed = passed;
      results.push(scores);

      // Save detailed report
      writeFileSync(
        path.join('lighthouse-reports', `${pageName}.json`),
        JSON.stringify(result.lhr, null, 2)
      );

      const status = passed ? '✅ PASS' : '❌ FAIL';
      console.log(`  ${status} | Perf: ${scores.performance} | A11y: ${scores.accessibility} | BP: ${scores['best-practices']} | SEO: ${scores.seo}`);

      // Print failing audits for pages that don't pass
      if (!passed) {
        console.log('  Failing audits:');
        for (const [catKey, cat] of Object.entries(categories)) {
          const catScore = Math.round(cat.score * 100);
          if (catScore < THRESHOLD) {
            const auditRefs = cat.auditRefs.filter(ref => {
              const audit = result.lhr.audits[ref.id];
              return audit && audit.score !== null && audit.score < 1;
            });
            for (const ref of auditRefs.slice(0, 10)) {
              const audit = result.lhr.audits[ref.id];
              console.log(`    [${catKey}] ${audit.id}: ${audit.title} (score: ${audit.score})`);
            }
          }
        }
      }
    } catch (err) {
      console.error(`  Error testing ${pagePath}: ${err.message}`);
      results.push({ page: pagePath, error: err.message, passed: false });
      allPassed = false;
    }
    
    console.log('');
  }

  // Print summary table
  console.log('\n========================================');
  console.log('LIGHTHOUSE RESULTS SUMMARY');
  console.log('========================================');
  console.log('Page'.padEnd(45) + 'Perf'.padEnd(7) + 'A11y'.padEnd(7) + 'BP'.padEnd(7) + 'SEO'.padEnd(7) + 'Status');
  console.log('-'.repeat(80));
  
  for (const r of results) {
    if (r.error) {
      console.log(`${r.page.padEnd(45)}ERROR`);
    } else {
      const status = r.passed ? 'PASS' : 'FAIL';
      console.log(
        `${r.page.padEnd(45)}${String(r.performance).padEnd(7)}${String(r.accessibility).padEnd(7)}${String(r['best-practices']).padEnd(7)}${String(r.seo).padEnd(7)}${status}`
      );
    }
  }

  console.log('-'.repeat(80));
  console.log(`Overall: ${allPassed ? '✅ ALL PASSED (>= ' + THRESHOLD + ')' : '❌ SOME FAILED (threshold: ' + THRESHOLD + ')'}`);

  // Save summary
  writeFileSync('lighthouse-reports/summary.json', JSON.stringify(results, null, 2));

  // Cleanup
  await chrome.kill();
  server.kill();

  process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(2);
});
