#!/usr/bin/env node
// Research helper for agents. Uses curl (which goes through the environment's proxy), so it works for every
// host on the environment's allowlist even when WebFetch cannot.
//
//   node survival/tools/research.mjs read <url> [--grep "regex"] [--max 15000]   read a page or PDF as plain text
//   node survival/tools/research.mjs pubmed "<query>" [--n 10]                    search PubMed (titles, journal, year, URL)
//   node survival/tools/research.mjs abstract <pmid>                              print a PubMed abstract
//   node survival/tools/research.mjs epmc "<query>" [--n 10]                      search Europe PMC (includes guidelines, preprints)
//   node survival/tools/research.mjs medline "<query>"                            search MedlinePlus health topics
//   node survival/tools/research.mjs wiki "<query>"                               research aid ONLY (never cite): article summary + its reference URLs
//   node survival/tools/research.mjs hosts                                        list hosts that are reachable
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [cmd, ...rest] = process.argv.slice(2);
const opt = (name, def) => { const i = rest.indexOf('--' + name); return i > -1 ? rest[i + 1] : def; };
const pos = rest.filter((a, i) => !a.startsWith('--') && !(i > 0 && rest[i - 1].startsWith('--')));

function curl(url, { binary = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'rs-'));
  const file = join(dir, 'body');
  let meta = '';
  try {
    meta = execFileSync('curl', ['-sSL', '--compressed', '--max-time', '40', '-o', file, '-w', '%{http_code}\t%{content_type}\t%{url_effective}', url], { encoding: 'utf8' });
  } catch (e) { meta = '000\t\t' + url; }
  const [status, ctype, final] = meta.split('\t');
  let body = null;
  try { body = binary ? readFileSync(file) : readFileSync(file, 'utf8'); } catch { }
  return { status: +status || 0, ctype: ctype || '', final: final || url, body, file, dir };
}

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', deg: '°', micro: 'µ', frac12: '½', frac14: '¼', times: '×', ge: '≥', le: '≤', hellip: '…', copy: '©', reg: '®', middot: '·', bull: '•', eacute: 'é' };
function decode(s) { return s.replace(/&(#x?[0-9a-f]+|[a-z]+\d*);/gi, (m, e) => e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : (ENT[e.toLowerCase()] ?? m)); }
function htmlToText(h) {
  const title = (h.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
  let main = h;
  const m = h.match(/<main[\s\S]*?<\/main>/i) || h.match(/<article[\s\S]*?<\/article>/i);
  if (m && m[0].length > 2000) main = m[0];
  main = main.replace(/<(script|style|noscript|svg|nav|header|footer|form|iframe)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/table|\/section|\/ul|\/ol|\/blockquote|\/caption)[^>]*>/gi, '\n')
    .replace(/<(li)[^>]*>/gi, '\n• ')
    .replace(/<(td|th)[^>]*>/gi, ' | ')
    .replace(/<h([1-6])[^>]*>/gi, '\n## ')
    .replace(/<[^>]+>/g, ' ');
  const text = decode(main).replace(/[ \t\f\v]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return { title: decode(title).trim(), text };
}

function grepText(text, re) {
  const lines = text.split('\n');
  const rx = new RegExp(re, 'i');
  const out = new Set();
  lines.forEach((l, i) => { if (rx.test(l)) for (let k = Math.max(0, i - 2); k <= Math.min(lines.length - 1, i + 2); k++) out.add(k); });
  let prev = -2, buf = [];
  [...out].sort((a, b) => a - b).forEach(k => { if (k !== prev + 1) buf.push('---'); buf.push(lines[k]); prev = k; });
  return buf.join('\n');
}

async function main() {
  if (cmd === 'read') {
    const url = pos[0];
    if (!url) throw new Error('usage: read <url>');
    const r = curl(url, { binary: true });
    let title = '', text = '';
    if (r.body && (/pdf/i.test(r.ctype) || r.body.slice(0, 5).toString() === '%PDF-')) {
      try { text = execFileSync('pdftotext', ['-layout', '-q', r.file, '-'], { encoding: 'utf8', maxBuffer: 64e6 }); title = '(PDF)'; } catch { text = '(could not extract PDF text)'; }
    } else if (r.body) { ({ title, text } = htmlToText(r.body.toString('utf8'))); }
    rmSync(r.dir, { recursive: true, force: true });
    console.log(`STATUS ${r.status}  ${r.final}\nTITLE  ${title}\n`);
    if (r.status >= 400 || r.status === 0) { console.log(r.status === 403 ? 'Blocked (403): the site refuses automated requests or the host is not allowed. Try another official page.' : 'Not available.'); process.exit(2); }
    const g = opt('grep');
    const max = +opt('max', 15000);
    const outText = g ? grepText(text, g) : text;
    console.log(outText.length > max ? outText.slice(0, max) + `\n\n[... truncated, ${outText.length} chars total; use --grep or --max]` : outText);
  } else if (cmd === 'pubmed') {
    const q = pos.join(' '), n = opt('n', '10');
    const s = curl(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&sort=relevance&retmax=${n}&term=${encodeURIComponent(q)}`);
    const ids = JSON.parse(s.body || '{}').esearchresult?.idlist || [];
    rmSync(s.dir, { recursive: true, force: true });
    if (!ids.length) { console.log('No PubMed results (or eutils not reachable).'); return; }
    const sm = curl(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(',')}`);
    const res = JSON.parse(sm.body || '{}').result || {};
    rmSync(sm.dir, { recursive: true, force: true });
    for (const id of ids) { const a = res[id]; if (!a) continue; console.log(`PMID ${id} | ${a.pubdate?.slice(0, 4)} | ${a.source}\n  ${a.title}\n  https://pubmed.ncbi.nlm.nih.gov/${id}/`); }
  } else if (cmd === 'abstract') {
    const r = curl(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&rettype=abstract&retmode=text&id=${pos[0]}`);
    console.log(r.body || 'Not available'); rmSync(r.dir, { recursive: true, force: true });
  } else if (cmd === 'epmc') {
    const q = pos.join(' '), n = opt('n', '10');
    const r = curl(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&pageSize=${n}&query=${encodeURIComponent(q)}`);
    const list = JSON.parse(r.body || '{}').resultList?.result || [];
    rmSync(r.dir, { recursive: true, force: true });
    if (!list.length) { console.log('No Europe PMC results (or host not reachable).'); return; }
    for (const a of list) console.log(`${a.pubYear} | ${a.journalTitle || a.source} | ${a.pmid ? 'PMID ' + a.pmid : a.id}\n  ${a.title}\n  ${a.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/` : a.doi ? 'https://doi.org/' + a.doi : ''}`);
  } else if (cmd === 'medline') {
    const r = curl(`https://wsearch.nlm.nih.gov/ws/query?db=healthTopics&retmax=8&term=${encodeURIComponent(pos.join(' '))}`);
    const docs = [...(r.body || '').matchAll(/<document[^>]*url="([^"]+)"[\s\S]*?<content name="title">([\s\S]*?)<\/content>[\s\S]*?<content name="FullSummary">([\s\S]*?)<\/content>/g)];
    rmSync(r.dir, { recursive: true, force: true });
    if (!docs.length) { console.log('No MedlinePlus results (or host not reachable).'); return; }
    for (const d of docs) console.log(`${decode(d[2]).replace(/<[^>]+>/g, '')}\n  ${d[1]}\n  ${decode(decode(d[3])).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 500)}\n`);
  } else if (cmd === 'wiki') {
    const q = pos.join(' ');
    const s = curl(`https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srlimit=1&srsearch=${encodeURIComponent(q)}`);
    const hit = JSON.parse(s.body || '{}').query?.search?.[0];
    rmSync(s.dir, { recursive: true, force: true });
    if (!hit) { console.log('No result (or Wikipedia not reachable).'); return; }
    const p = curl(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|extlinks&explaintext=1&exlimit=1&ellimit=200&titles=${encodeURIComponent(hit.title)}`);
    const page = Object.values(JSON.parse(p.body || '{}').query?.pages || {})[0] || {};
    rmSync(p.dir, { recursive: true, force: true });
    console.log(`RESEARCH AID ONLY. Never cite Wikipedia. Verify facts at the primary sources listed below.\n\n# ${hit.title}\n${(page.extract || '').slice(0, +opt('max', 9000))}\n\nREFERENCE LINKS:`);
    for (const l of (page.extlinks || []).map(x => x['*']).filter(u => /\.(gov|int|edu|org)\b|nature\.com|nejm|thelancet|bmj|jamanetwork|reuters|apnews|bbc/.test(u)).slice(0, 80)) console.log('  ' + l);
  } else if (cmd === 'hosts') {
    for (const u of ['https://www.cdc.gov/', 'https://www.who.int/', 'https://iris.who.int/', 'https://medlineplus.gov/', 'https://pmc.ncbi.nlm.nih.gov/', 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/einfo.fcgi', 'https://www.ebi.ac.uk/europepmc/', 'https://wsearch.nlm.nih.gov/ws/query?db=healthTopics&term=cpr', 'https://en.wikipedia.org/', 'https://www.fda.gov/', 'https://www.epa.gov/', 'https://www.nrel.gov/', 'https://extension.psu.edu/', 'https://www.ready.gov/', 'https://www.redcross.org/']) {
      const r = curl(u); rmSync(r.dir, { recursive: true, force: true }); console.log(String(r.status).padEnd(4), u);
    }
  } else {
    console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 11).join('\n'));
  }
}
main().catch(e => { console.error('ERROR', e.message); process.exit(1); });
