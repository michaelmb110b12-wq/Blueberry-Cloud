#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2] || '.';
const TARGET = 'https://michaelmb110b12-wq.github.io/Cine-Cloud-SRC/src/';
const TARGET_LABEL = 'Cine Cloud';

const read = file => fs.readFileSync(file, 'utf8');
const write = (file, data) => fs.writeFileSync(file, data, 'utf8');
const must = (condition, message) => { if (!condition) throw new Error(message); };

function patchIndex(file) {
  let html = read(file);

  // Current GhostLink has a single systemPages entry with id 'games'.
  // Match it by structure rather than exact whitespace/line formatting.
  const gamesEntryRe = /\{\s*id:\s*'games'\s*,\s*name:\s*'Games'\s*,\s*svg:\s*`[\s\S]*?`\s*\},/m;
  must(gamesEntryRe.test(html), `Games system entry not found in ${file}`);

  // Official Steam-style mark, embedded inline so no extra request is needed.
  const steamSvg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-label="Steam"><path fill="currentColor" d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.353 3.015-3.015zM14 8.91c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265A2.265 2.265 0 0 1 14 8.91z"/></svg>`;
  const newEntry = `{ id: 'games', name: '${TARGET_LABEL}', svg: \`${steamSvg}\` },`;
  html = html.replace(gamesEntryRe, newEntry);

  // Current nav() branch is:
  //   } else if (page === 'games') { ... } else if (page === 'run_custom' && appData) {
  // Replace only the games branch; preserve the surrounding nav logic.
  const gamesBranchRe = /(\}\s*else if\s*\(page\s*===\s*'games'\)\s*\{)[\s\S]*?(\}\s*else if\s*\(page\s*===\s*'run_custom'\s*&&\s*appData\))/m;
  must(gamesBranchRe.test(html), `Games navigation branch not found in ${file}. Upstream GhostLink structure may have changed.`);

  const replacement = `$1\n                // Blueberry: replace GN-Math Games with Cine Cloud inside GhostLink's existing Scramjet browser.\n                gamesView.style.display = 'none';\n                proxyView.style.display = 'flex';\n                if (!proxyBrowserInitialized) {\n                    proxyBrowserInitialized = true;\n                    await proxyInit();\n                }\n                const cineCloudUrl = '${TARGET}';\n                const openCineCloud = () => {\n                    const addressBar = document.getElementById('address-bar');\n                    if (addressBar) addressBar.value = cineCloudUrl;\n                    if (typeof handleSubmit === 'function') handleSubmit(cineCloudUrl);\n                };\n                // proxyInit() creates the address bar asynchronously. Retry briefly after initialization.\n                setTimeout(openCineCloud, 0);\n                setTimeout(openCineCloud, 300);\n                setTimeout(openCineCloud, 1200);\n             $2`;
  html = html.replace(gamesBranchRe, replacement);

  // Visible labels only. Keep internal id 'games' so GhostLink's saved shortcuts stay compatible.
  html = html.replace(/Open Games \(Alt \+ \?\)/g, 'Open Cine Cloud (Alt + ?)');
  html = html.replace(/<option\s+value=["']games["']>Games<\/option>/g, '<option value="games">Cine Cloud</option>');
  html = html.replace(/games:\s*'Games'/g, `games: '${TARGET_LABEL}'`);

  write(file, html);
}

const candidates = [
  path.join(ROOT, 'src', 'index.html'),
  path.join(ROOT, 'ghostlinksinglefile.html')
];
let patched = 0;
for (const file of candidates) {
  if (fs.existsSync(file)) {
    patchIndex(file);
    patched++;
  }
}
must(patched > 0, 'No GhostLink HTML entrypoint found. Expected src/index.html or ghostlinksinglefile.html.');
console.log(`Blueberry patch applied to ${patched} file(s).`);
