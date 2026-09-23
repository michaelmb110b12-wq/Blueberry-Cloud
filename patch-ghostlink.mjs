#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2] || '.';
const TARGET = 'https://michaelmb110b12-wq.github.io/Cine-Cloud-SRC/src/';
const TARGET_LABEL = 'Cine Cloud';

function read(file) { return fs.readFileSync(file, 'utf8'); }
function write(file, data) { fs.writeFileSync(file, data, 'utf8'); }
function must(cond, message) { if (!cond) throw new Error(message); }

function patchIndex(file) {
  let html = read(file);

  // 1) Replace only the existing Games/GN-Math sidebar label/icon slot.
  const gamesEntryStart = "{ id: 'games', name: 'Games', svg: `";
  const start = html.indexOf(gamesEntryStart);
  must(start !== -1, `Games system entry not found in ${file}`);
  const svgEnd = html.indexOf("` },", start);
  must(svgEnd !== -1, `Games system entry terminator not found in ${file}`);
  const oldEntry = html.slice(start, svgEnd + 4);
  const newEntry = "{ id: 'games', name: '" + TARGET_LABEL + "', svg: `<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 12h16\"/><path d=\"M8 8v8\"/><path d=\"M16 8v8\"/><circle cx=\"8\" cy=\"12\" r=\"3\"/><circle cx=\"16\" cy=\"12\" r=\"3\"/></svg>` },";
  html = html.slice(0, start) + newEntry + html.slice(start + oldEntry.length);

  // 2) Keep GhostLink's existing proxy page and service-worker flow;
  // only the Games navigation target is redirected into the existing proxy.
  const oldGamesBranch = `} else if (page === 'games') {
                 gamesView.style.display = 'flex';
                 if (!gamesLoaded) {
                     gamesLoaded = true;
                     gamesListZones();
                 }`;
  const newGamesBranch = `} else if (page === 'games') {
                 // Blueberry: Cine Cloud opens inside GhostLink's existing Scramjet proxy browser.
                 proxyView.style.display = 'flex';
                 if (!proxyBrowserInitialized) {
                     proxyBrowserInitialized = true;
                     await proxyInit();
                 }
                 const cineCloudUrl = '${TARGET}';
                 setTimeout(() => {
                     const addressBar = document.getElementById('address-bar');
                     if (addressBar) addressBar.value = cineCloudUrl;
                     if (typeof handleSubmit === 'function') handleSubmit(cineCloudUrl);
                 }, 0);
             }`;
  must(html.includes(oldGamesBranch), 'Expected Games navigation branch not found. Upstream GhostLink structure may have changed.');
  html = html.replace(oldGamesBranch, newGamesBranch);

  // 3) Visible shortcut/settings labels only; keep internal id "games" for compatibility.
  html = html.replace(/Open Games \(Alt \+ \?\)/g, 'Open Cine Cloud (Alt + ?)');
  html = html.replace(/<option value="games">Games<\/option>/g, '<option value="games">Cine Cloud</option>');
  html = html.replace(/const pageNames = \{ home:'Home', games:'Games',/g, "const pageNames = { home:'Home', games:'Cine Cloud',");

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
