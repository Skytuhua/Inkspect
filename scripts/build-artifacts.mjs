// Builds the distributable artifacts for a release:
//   1. Runs the production build (dist/).
//   2. Zips the static site → artifacts/inkspect-<version>-web.zip
//   3. Writes artifacts/SHA256SUMS.txt
// The zip is a static site: unzip and serve it (any static host / `npx serve`).
import { execSync } from 'node:child_process';
import { mkdirSync, rmSync, readFileSync, writeFileSync, createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const version = pkg.version;
const ART = path.join(ROOT, 'artifacts');
const zipName = `inkspect-${version}-web.zip`;

const sh = (cmd, cwd = ROOT) => execSync(cmd, { cwd, stdio: 'inherit' });

console.log(`\n▶ Building Inkspect v${version} artifacts\n`);

// 1. Clean + production build.
rmSync(ART, { recursive: true, force: true });
mkdirSync(ART, { recursive: true });
sh('npm run build');

// 2. Zip the static site (contents of dist/, not the dist/ folder itself).
rmSync(path.join(ART, zipName), { force: true });
sh(`zip -r -q "${path.join(ART, zipName)}" .`, path.join(ROOT, 'dist'));
console.log(`✓ wrote artifacts/${zipName}`);

// 3. Checksums.
const sha = await new Promise((resolve, reject) => {
  const h = createHash('sha256');
  const s = createReadStream(path.join(ART, zipName));
  s.on('data', (d) => h.update(d));
  s.on('end', () => resolve(h.digest('hex')));
  s.on('error', reject);
});
writeFileSync(path.join(ART, 'SHA256SUMS.txt'), `${sha}  ${zipName}\n`);
console.log(`✓ wrote artifacts/SHA256SUMS.txt`);
console.log(`\nSHA256 ${sha}\n`);
