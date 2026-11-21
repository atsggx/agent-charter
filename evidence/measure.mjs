#!/usr/bin/env node
// Regenerates evidence/skills-inventory.md from a skills directory.
//
// Usage:
//   node evidence/measure.mjs                    # ~/.config/opencode/skills
//   node evidence/measure.mjs <dir> --out <file>
//
// The point of this script is that every number in the inventory can be
// re-derived. Nothing here reads file contents into the report: the secret
// scan emits counts only, never matches, so regenerating the report cannot
// leak what it is measuring.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outPath = outIdx >= 0 ? args.splice(outIdx, 2)[1] : null;
const skillsDir = path.resolve(
  args[0] || process.env.AGENT_SKILLS_DIR || path.join(os.homedir(), '.config', 'opencode', 'skills'),
);

const SPEC_DESC_MAX = 1024;
const SPEC_NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const BODY_SOFT_MAX = 500;

// Counts only. No match text is ever written to the report.
const SCAN = [
  { id: 'ipv4', label: 'IPv4 address' },
  { id: 'userpath', label: 'absolute Windows user path' },
  { id: 'privkey', label: 'private key block' },
  { id: 'password', label: 'password assignment' },
  { id: 'token', label: 'token / API key assignment' },
  { id: 'email', label: 'email address' },
];

const PATTERNS = {
  ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  userpath: /\b[A-Za-z]:\\Users\\[^\\\s]+/g,
  privkey: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
  password: /\b(password|passwd|pwd)\s*[:=]\s*\S/gi,
  token: /\b(api[_-]?key|token|secret|bearer)\s*[:=]\s*\S/gi,
  email: /\b[\w.+-]+@[\w-]+\.[\w.]{2,}\b/g,
};

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc);
    else if (entry.isFile()) acc.push(p);
  }
  return acc;
}

function frontmatter(text) {
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end < 0) return null;
  const fields = {};
  for (const line of text.slice(3, end).split('\n')) {
    const m = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (m) fields[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return { fields, body: text.slice(end + 4) };
}

function validIpv4(match) {
  return match.split('.').every((o) => Number(o) <= 255);
}

const skills = [];
const scan = Object.fromEntries(SCAN.map((s) => [s.id, { files: 0, skills: 0 }]));

if (!fs.existsSync(skillsDir)) {
  console.error(`no skills directory at ${skillsDir}`);
  process.exit(1);
}

for (const name of fs.readdirSync(skillsDir).sort()) {
  const dir = path.join(skillsDir, name);
  if (!fs.statSync(dir).isDirectory()) continue;

  const files = walk(dir);
  const skillFile = path.join(dir, 'SKILL.md');
  const hasSkillMd = fs.existsSync(skillFile);
  const text = hasSkillMd ? fs.readFileSync(skillFile, 'utf8').replace(/\r\n/g, '\n') : '';
  const fm = frontmatter(text);

  const entry = {
    name,
    files: files.length,
    bytes: files.reduce((n, f) => n + fs.statSync(f).size, 0),
    hasSkillMd,
    descLen: fm?.fields.description?.length ?? 0,
    fmName: fm?.fields.name ?? '',
    bodyLines: fm ? fm.body.split('\n').length : text.split('\n').length,
    refs: fs.existsSync(path.join(dir, 'references')),
    scripts: fs.existsSync(path.join(dir, 'scripts')),
    assets: fs.existsSync(path.join(dir, 'assets')),
    modified: files.reduce((d, f) => {
      const t = fs.statSync(f).mtime;
      return t > d ? t : d;
    }, new Date(0)),
    hits: {},
  };

  for (const f of files) {
    let content;
    try {
      content = fs.readFileSync(f, 'utf8');
    } catch {
      continue; // binary asset
    }
    for (const s of SCAN) {
      const re = new RegExp(PATTERNS[s.id].source, PATTERNS[s.id].flags);
      const matches = [...content.matchAll(re)].filter((m) => (s.id === 'ipv4' ? validIpv4(m[0]) : true));
      if (matches.length) {
        entry.hits[s.id] = (entry.hits[s.id] ?? 0) + matches.length;
        scan[s.id].files += 1;
      }
    }
  }
  for (const s of SCAN) if (entry.hits[s.id]) scan[s.id].skills += 1;

  skills.push(entry);
}

const totalBytes = skills.reduce((n, s) => n + s.bytes, 0);
const totalFiles = skills.reduce((n, s) => n + s.files, 0);
const allDates = skills.map((s) => s.modified).filter((d) => d.getTime() > 0).sort((a, b) => a - b);
const withSkillMd = skills.filter((s) => s.hasSkillMd);
const ownRules = withSkillMd.filter((s) => !s.refs && !s.scripts && !s.assets);
const descTooLong = withSkillMd.filter((s) => s.descLen > SPEC_DESC_MAX);
const nameMismatch = withSkillMd.filter((s) => s.fmName && !SPEC_NAME_RE.test(s.fmName.toLowerCase()));
const longBodies = withSkillMd.filter((s) => s.bodyLines > BODY_SOFT_MAX);
const longest = [...withSkillMd].sort((a, b) => b.bodyLines - a.bodyLines).slice(0, 5);

const d = (x) => x.toISOString().slice(0, 10);
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const pad = (s, n) => String(s).padEnd(n);

// Vendored reference material dominates by file count, so the scan is also
// reported for hand-written skills alone.
const ownScan = Object.fromEntries(SCAN.map((s) => [s.id, { files: 0, skills: 0 }]));
for (const s of ownRules) {
  for (const scanId of SCAN) {
    if (s.hits[scanId.id]) {
      ownScan[scanId.id].skills += 1;
      ownScan[scanId.id].files += s.hits[scanId.id];
    }
  }
}

const lines = [];
lines.push('# Skills inventory');
lines.push('');
lines.push(`Generated from \`${skillsDir.replace(os.homedir(), '~')}\` on ${new Date().toISOString()}.`);
lines.push('');
lines.push('Every number below is re-derivable:');
lines.push('');
lines.push('```sh');
lines.push('node evidence/measure.mjs > evidence/skills-inventory.md');
lines.push('```');
lines.push('');
lines.push('The script reads file sizes, line counts, frontmatter and modification');
lines.push('dates, and a secret scan that emits **counts only** (never matched text),');
lines.push('so regenerating the report cannot leak what it measures.');
lines.push('');
lines.push('## Totals');
lines.push('');
lines.push('| Measure | Value |');
lines.push('|---|---|');
lines.push(`| Skills | ${skills.length} |`);
lines.push(`| Files | ${totalFiles} |`);
lines.push(`| Bytes | ${kb(totalBytes)} |`);
lines.push(`| Oldest last-modified | ${allDates.length ? d(allDates[0]) : '-'} |`);
lines.push(`| Newest last-modified | ${allDates.length ? d(allDates[allDates.length - 1]) : '-'} |`);
lines.push(`| Skills with a \`SKILL.md\` | ${withSkillMd.length} |`);
lines.push(`| Hand-written (no references/, scripts/, assets/) | ${ownRules.length} |`);
lines.push(`| Vendored or script-backed | ${withSkillMd.length - ownRules.length} |`);
lines.push('');
lines.push('## Per skill');
lines.push('');
lines.push('| Skill | Files | Size | SKILL.md lines | Description chars | Last modified | Layout |');
lines.push('|---|---|---|---|---|---|---|');
for (const s of skills) {
  const layout = [s.refs && 'references', s.scripts && 'scripts', s.assets && 'assets'].filter(Boolean).join(' + ') || 'flat';
  lines.push(
    `| \`${s.name}\` | ${s.files} | ${kb(s.bytes)} | ${s.hasSkillMd ? s.bodyLines : '-'} | ${s.descLen || '-'} | ${d(s.modified)} | ${layout} |`,
  );
}
lines.push('');
lines.push('## Spec checks');
lines.push('');
lines.push(`- Description over the ${SPEC_DESC_MAX}-char limit: **${descTooLong.length}**`);
lines.push(`- Body over the ${BODY_SOFT_MAX}-line soft limit: **${longBodies.length}**`);
lines.push(`- Frontmatter name that breaks the spec pattern: **${nameMismatch.length}**`);
lines.push(`- Longest bodies: ${longest.map((s) => `\`${s.name}\` (${s.bodyLines})`).join(', ')}`);
lines.push('');
lines.push('## Leak surface (aggregate only)');
lines.push('');
lines.push('Counts of files and skills matching each class. No matches are reproduced.');
lines.push('');
lines.push('| Class | Files | Skills |');
lines.push('|---|---|---|');
for (const s of SCAN) lines.push(`| ${s.label} | ${scan[s.id].files} | ${scan[s.id].skills} |`);
lines.push('');
lines.push('This table is the argument for publishing the charter and not the directory:');
lines.push('the knowledge is only useful because it names real hosts, real accounts and');
lines.push('real paths, and that is exactly what cannot leave the machine.');
lines.push('');
lines.push('### Hand-written skills only');
lines.push('');
lines.push('The same scan restricted to skills with no `references/`, `scripts/` or');
lines.push('`assets/`: the ones written on this machine rather than vendored from');
lines.push('upstream docs. Match counts, not file counts, because these are few files.');
lines.push('');
lines.push('| Class | Skills | Matches |');
lines.push('|---|---|---|');
for (const s of SCAN) lines.push(`| ${s.label} | ${ownScan[s.id].skills} | ${ownScan[s.id].files} |`);
lines.push('');

const report = lines.join('\n');
if (outPath) {
  fs.writeFileSync(path.resolve(outPath), report);
  console.log(`wrote ${outPath}`);
} else {
  process.stdout.write(report);
}
