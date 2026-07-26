import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:6006/?path=/story/sutochno-tokens-colors--all-tokens&globals=uiKit:sutochno';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const logs = [];
page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}`));

await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);

const iframe = page.frameLocator('#storybook-preview-iframe');
const bodyText = await iframe.locator('body').innerText().catch(() => '(iframe empty)');
const screenshot = '/tmp/storybook-debug.png';
await page.screenshot({ path: screenshot, fullPage: true });

console.log('BODY:', bodyText.slice(0, 500));
console.log('LOGS:');
logs.forEach((l) => console.log(l));

await browser.close();
