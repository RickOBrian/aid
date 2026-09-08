/**
 * Local release packaging for Token Comparator (Figma plugin).
 * Builds, verifies allowlist, stages token-comparator/ tree, writes ZIP.
 * Does NOT create git tags or GitHub Releases.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(__dirname, '..');

const ALLOWLIST = ['manifest.json', 'dist/code.js', 'dist/ui.html'];
const STAGE_DIR_NAME = 'token-comparator';

function readPackageVersion() {
  const pkg = JSON.parse(fs.readFileSync(path.join(pluginRoot, 'package.json'), 'utf8'));
  if (typeof pkg.version !== 'string' || !pkg.version.trim()) {
    throw new Error('[release] package.json: missing version field.');
  }
  return pkg.version.trim();
}

function loadPluginSharedSecret() {
  const envPath = path.join(pluginRoot, '.env.local');
  if (!fs.existsSync(envPath)) {
    return '';
  }

  const text = fs.readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^PLUGIN_SHARED_SECRET=(.*)$/);
    if (match) {
      const raw = match[1].trim();
      return raw.replace(/^["']|["']$/g, '');
    }
  }

  return process.env.PLUGIN_SHARED_SECRET ?? '';
}

function run(command, label) {
  console.log(`[release] ${label}…`);
  execSync(command, { cwd: pluginRoot, stdio: 'inherit', env: process.env });
}

function assertAllowlist() {
  const manifestPath = path.join(pluginRoot, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  for (const relativePath of ALLOWLIST) {
    const absolutePath = path.join(pluginRoot, relativePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`[release] allowlist miss: ${relativePath} not found after build.`);
    }
  }

  const mainRelative = manifest.main;
  const uiRelative = manifest.ui;

  if (typeof mainRelative !== 'string' || typeof uiRelative !== 'string') {
    throw new Error('[release] manifest.json: main and ui must be string paths.');
  }

  for (const manifestRef of [mainRelative, uiRelative]) {
    const resolved = path.join(pluginRoot, manifestRef);
    if (!fs.existsSync(resolved)) {
      throw new Error(`[release] manifest reference not found: ${manifestRef}`);
    }
    if (!ALLOWLIST.includes(manifestRef)) {
      throw new Error(
        `[release] manifest reference ${manifestRef} is outside release allowlist (${ALLOWLIST.join(', ')}).`,
      );
    }
  }

  console.log('[release] allowlist OK:', ALLOWLIST.join(', '));
}

function renderReadmeInstall(version) {
  const templatePath = path.join(pluginRoot, 'README-install.txt');
  if (!fs.existsSync(templatePath)) {
    throw new Error('[release] README-install.txt template not found in plugin root.');
  }

  const template = fs.readFileSync(templatePath, 'utf8');
  return template.replace(/vX\.Y\.Z/g, `v${version}`);
}

function stageReleaseTree(version) {
  const releasesRoot = path.join(pluginRoot, 'dist', 'releases');
  const stagingRoot = path.join(releasesRoot, 'staging', STAGE_DIR_NAME);

  fs.rmSync(path.join(releasesRoot, 'staging'), { recursive: true, force: true });
  fs.mkdirSync(path.join(stagingRoot, 'dist'), { recursive: true });

  fs.copyFileSync(path.join(pluginRoot, 'manifest.json'), path.join(stagingRoot, 'manifest.json'));
  fs.copyFileSync(path.join(pluginRoot, 'dist', 'code.js'), path.join(stagingRoot, 'dist', 'code.js'));
  fs.copyFileSync(path.join(pluginRoot, 'dist', 'ui.html'), path.join(stagingRoot, 'dist', 'ui.html'));
  fs.writeFileSync(path.join(stagingRoot, 'README-install.txt'), renderReadmeInstall(version), 'utf8');

  return { releasesRoot, stagingRoot };
}

function createZip(releasesRoot, version) {
  const zipName = `token-comparator-v${version}.zip`;
  const zipPath = path.join(releasesRoot, zipName);

  fs.mkdirSync(releasesRoot, { recursive: true });
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  execSync(`zip -r ${JSON.stringify(path.join('..', zipName))} ${JSON.stringify(STAGE_DIR_NAME)}`, {
    cwd: path.join(releasesRoot, 'staging'),
    stdio: 'inherit',
  });

  return zipPath;
}

function printStagingListing(stagingRoot) {
  console.log('[release] staging directory contents:');
  const walk = (dir, prefix = '') => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      console.log(`  ${rel}${entry.isDirectory() ? '/' : ''}`);
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), rel);
      }
    }
  };
  walk(stagingRoot);
}

function verifyZip(zipPath) {
  console.log('[release] ZIP listing:');
  execSync(`unzip -l ${JSON.stringify(zipPath)}`, { stdio: 'inherit' });
}

function main() {
  const version = readPackageVersion();
  const secret = loadPluginSharedSecret();

  if (!secret) {
    console.error(
      '[release] ERROR: PLUGIN_SHARED_SECRET is empty. Set tools/figma-token-comparator/.env.local before production packaging.',
    );
    process.exit(1);
  }

  console.log(`[release] Token Comparator v${version} — local pack (no tag, no GitHub Release)`);

  run('npm run build', 'build');
  run('npm run typecheck', 'typecheck');
  assertAllowlist();

  const { releasesRoot, stagingRoot } = stageReleaseTree(version);
  const zipPath = createZip(releasesRoot, version);

  printStagingListing(stagingRoot);
  verifyZip(zipPath);

  console.log('');
  console.log('[release] Done.');
  console.log(`[release] ZIP path: ${zipPath}`);
  console.log('[release] Figma Desktop: Import plugin from manifest… → choose manifest.json inside extracted token-comparator/ folder.');
}

main();
