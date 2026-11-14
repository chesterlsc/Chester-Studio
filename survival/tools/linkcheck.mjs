#!/usr/bin/env node
// Checks that cited source URLs resolve (HTTP status via curl, which uses the environment's proxy).
// Usage: node survival/tools/linkcheck.mjs [--hosts=host1,host2] [--json out.json] [chapter ids...]
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CH = join(ROOT, 'src', 'chapters');
const args = process.argv.slice(2);
const hostsArg = args.find(a => a.startsWith('--hosts='));
const hosts = hostsArg ? new Set(hostsArg.slice(8).split(',')) : null;
const jsonIdx = args.indexOf('--json');
const jsonOut = jsonIdx > -1 ? args[jsonIdx + 1] : null;
const only = args.filter((a, i) => !a.startsWith('--') && !(jsonIdx > -1 && i === jsonIdx + 1));

const files = readdirSync(CH).filter(f => f.endsWith('.html') && !f.startsWith('_') && (!only.length || only.includes(f.replace('.html', ''))));
const items = [];
for (const f of files) {
  const html = readFileSync(join(CH, f), 'utf8');
  const list = html.slice(html.lastIndexOf('<ol class="sources"'));
  for (const m of list.matchAll(/<li id="(s\d+)"[^>]*>\s*<a href="([^"]+)"/g)) {
    const url = m[2].replace(/&amp;/g, '&');
    let host = ''; try { host = new URL(url).hostname; } catch { }
    if (hosts && !hosts.has(host)) continue;
    items.push({ chapter: f.replace('.html', ''), sid: m[1], url, host });
  }
}
const uniq = [...new Set(items.map(i => i.url))];
const status = {};
function check(url) {
  return new Promise(res => execFile('curl', ['-sS', '-o', '/dev/null', '-L', '--max-time', '25', '-w', '%{http_code}', url], (err, out) => res(out ? out.trim() : 'ERR')));
}
let i = 0;
async function worker() { while (i < uniq.length) { const u = uniq[i++]; status[u] = await check(u); } }
await Promise.all(Array.from({ length: 10 }, worker));
// 404/410 = page does not exist. 403/429/5xx usually mean bot protection, so they are reported separately as "unverified".
const bad = items.filter(it => /^(404|410)$/.test(status[it.url]));
const unverified = items.filter(it => !/^(2|3)\d\d$/.test(status[it.url]) && !/^(404|410)$/.test(status[it.url]));
console.log(`Unverified (blocked or timed out): ${new Set(unverified.map(u => u.url)).size} URLs on ${[...new Set(unverified.map(u => u.host))].join(', ')}`);
for (const b of bad) console.log(`${status[b.url]}\t${b.chapter}#${b.sid}\t${b.url}`);
console.log(`\nChecked ${uniq.length} unique URLs from ${files.length} chapters: ${bad.length} citation(s) not OK.`);
if (jsonOut) writeFileSync(jsonOut, JSON.stringify(bad.map(b => ({ ...b, status: status[b.url] })), null, 2));
