#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2] || '.';
const TARGET = 'https://michaelmb110b12-wq.github.io/Cine-Cloud-SRC/src/';
const TARGET_LABEL = 'Cine Cloud';
const GITHUB_PROFILE = 'https://github.com/michaelmb110b12-wq';

const read = file => fs.readFileSync(file, 'utf8');
const write = (file, data) => fs.writeFileSync(file, data, 'utf8');
const must = (condition, message) => { if (!condition) throw new Error(message); };

function patchIndex(file) {
  let html = read(file);

  // Current GhostLink has a single systemPages entry with id 'games'.
  // Match it by structure rather than exact whitespace/line formatting.
  const gamesEntryRe = /\{\s*id:\s*'games'\s*,\s*name:\s*'Games'\s*,\s*svg:\s*`[\s\S]*?`\s*\},/m;
  must(gamesEntryRe.test(html), `Games system entry not found in ${file}`);

  // Official GitHub mark, embedded inline so no extra request is needed.
  const githubSvg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-label="GitHub"><path fill="currentColor" d="M12 .297a12 12 0 0 0-3.79 23.384c.6.113.82-.258.82-.577 0-.285-.011-1.04-.017-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.805 1.304 3.49.997.108-.775.418-1.304.762-1.604-2.665-.303-5.466-1.332-5.466-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0 1 12 6.103c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.61-2.806 5.624-5.478 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.696.825.578A12.001 12.001 0 0 0 12 .297"/></svg>`;
  const steamSvg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-label="Steam"><path fill="currentColor" d="M12 .9a11.1 11.1 0 0 0-10.88 8.9l5.08 2.11a3.02 3.02 0 0 1 3.02-.18l2.4-1.74a3.6 3.6 0 1 1 3.1 3.1l-1.74 2.4c.1.35.16.71.16 1.09a3.04 3.04 0 0 1-6.05.5L2.7 14.99A11.1 11.1 0 1 0 12 .9Zm6.02 5.1a2.06 2.06 0 1 0 0 4.12 2.06 2.06 0 0 0 0-4.12Zm-5.1 10.33a1.52 1.52 0 1 0 0 3.04 1.52 1.52 0 0 0 0-3.04Z"/></svg>`;
  const newEntry = `{ id: 'games', name: '${TARGET_LABEL}', svg: \`${steamSvg}\` },`;
  html = html.replace(gamesEntryRe, newEntry);

  // Current nav() branch is:
  //   } else if (page === 'games') { ... } else if (page === 'run_custom' && appData) {
  // Replace only the games branch; preserve the surrounding nav logic.
  const gamesBranchRe = /(\}\s*else if\s*\(page\s*===\s*'games'\)\s*\{)[\s\S]*?(\}\s*else if\s*\(page\s*===\s*'run_custom'\s*&&\s*appData\))/m;
  must(gamesBranchRe.test(html), `Games navigation branch not found in ${file}. Upstream GhostLink structure may have changed.`);

  const replacement = `$1
                // Blueberry: open Cine Cloud inside GhostLink's native Scramjet browser.
                gamesView.style.display = 'none';
                proxyView.style.display = 'flex';
                if (!proxyBrowserInitialized) {
                    proxyBrowserInitialized = true;
                    await proxyInit();
                }
                handleSubmit('${TARGET}');
             $2`;
  html = html.replace(gamesBranchRe, replacement);

  // Visible labels only. Keep internal id 'games' so GhostLink's saved shortcuts stay compatible.
  html = html.replace(/Open Games \(Alt \+ \?\)/g, 'Open Cine Cloud (Alt + ?)');
  html = html.replace(/<option\s+value=["']games["']>Games<\/option>/g, '<option value="games">Cine Cloud</option>');
  html = html.replace(/games:\s*'Games'/g, `games: '${TARGET_LABEL}'`);


  // Blueberry: replace the home-screen Discord and GitHub social buttons
  // with GitHub buttons that both point to the user's profile.
  const githubSocial = `<a href="${GITHUB_PROFILE}" target="_blank" class="social-icon" title="GitHub"><svg viewBox="0 0 24 24" aria-label="GitHub"><path fill="currentColor" d="M12 .297a12 12 0 0 0-3.79 23.384c.6.113.82-.258.82-.577 0-.285-.011-1.04-.017-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.805 1.304 3.49.997.108-.775.418-1.304.762-1.604-2.665-.303-5.466-1.332-5.466-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0 1 12 6.103c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.61-2.806 5.624-5.478 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.696.825.578A12.001 12.001 0 0 0 12 .297Z"/></svg></a>`;
  const discordSocialRe = /<a href="https:\/\/discord\.gg\/[^"]+" target="_blank" class="social-icon" title="Discord">[\s\S]*?<\/a>/m;
  const githubSocialRe = /<a href="https:\/\/github\.com\/virtuan4-max\/ghostlinkhub" target="_blank" class="social-icon" title="GitHub">[\s\S]*?<\/a>/m;
  must(discordSocialRe.test(html), `Discord social icon not found in ${file}`);
  must(githubSocialRe.test(html), `GhostLink GitHub social icon not found in ${file}`);
  html = html.replace(discordSocialRe, githubSocial);
  html = html.replace(githubSocialRe, githubSocial);

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
