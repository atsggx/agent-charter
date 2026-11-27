# Skills inventory

Generated from `~\.config\opencode\skills` on 2026-11-27T20:12:18.172Z.

Every number below is re-derivable:

```sh
node evidence/measure.mjs > evidence/skills-inventory.md
```

The script reads file sizes, line counts, frontmatter and modification
dates, and a secret scan that emits **counts only** (never matched text),
so regenerating the report cannot leak what it measures.

## Totals

| Measure | Value |
|---|---|
| Skills | 25 |
| Files | 518 |
| Bytes | 28451.0 KB |
| Oldest last-modified | 2026-06-22 |
| Newest last-modified | 2026-11-27 |
| Skills with a `SKILL.md` | 25 |
| Hand-written (no references/, scripts/, assets/) | 16 |
| Vendored or script-backed | 9 |

## Per skill

| Skill | Files | Size | SKILL.md lines | Description chars | Last modified | Layout |
|---|---|---|---|---|---|---|
| `agents-sdk` | 20 | 60.6 KB | 219 | 431 | 2026-06-22 | references |
| `character-cards` | 1 | 12.3 KB | 217 | 603 | 2026-11-24 | flat |
| `cloudflare` | 320 | 1378.2 KB | 240 | 368 | 2026-06-22 | references |
| `cloudflare-email-service` | 6 | 43.1 KB | 101 | 508 | 2026-06-22 | references |
| `cloudflare-one` | 1 | 21.8 KB | 174 | 323 | 2026-06-22 | flat |
| `cloudflare-one-migrations` | 1 | 12.1 KB | 108 | 187 | 2026-06-22 | flat |
| `discord-vencord` | 80 | 24950.6 KB | 97 | 354 | 2026-11-16 | scripts |
| `durable-objects` | 4 | 27.8 KB | 184 | 382 | 2026-06-22 | references |
| `haos-access` | 1 | 6.4 KB | 109 | 347 | 2026-10-22 | flat |
| `herdr` | 1 | 15.2 KB | 216 | 328 | 2026-11-08 | flat |
| `nvidia-broadcast` | 1 | 6.7 KB | 125 | 500 | 2026-11-20 | flat |
| `ollama-decisions` | 20 | 1608.9 KB | 98 | 471 | 2026-11-18 | flat |
| `opencode-local` | 1 | 4.2 KB | 65 | 448 | 2026-11-20 | flat |
| `pc-power` | 1 | 6.6 KB | 141 | 390 | 2026-11-25 | flat |
| `pc-updates` | 1 | 6.5 KB | 117 | 351 | 2026-11-20 | flat |
| `risuai` | 9 | 44.0 KB | 208 | 959 | 2026-11-25 | scripts |
| `router` | 1 | 5.3 KB | 106 | 399 | 2026-10-23 | flat |
| `sandbox-sdk` | 3 | 10.3 KB | 175 | 343 | 2026-06-22 | references |
| `ssh-access` | 1 | 12.5 KB | 198 | 379 | 2026-11-27 | flat |
| `synthid` | 2 | 10.6 KB | 180 | 465 | 2026-10-23 | flat |
| `trackmania-clips` | 6 | 33.2 KB | 122 | 410 | 2026-11-25 | flat |
| `turnstile-spin` | 32 | 111.3 KB | 158 | 383 | 2026-06-22 | references + scripts |
| `windows-host` | 1 | 14.1 KB | 260 | 566 | 2026-11-23 | flat |
| `workers-best-practices` | 3 | 31.0 KB | 125 | 359 | 2026-06-22 | references |
| `wrangler` | 1 | 17.9 KB | 920 | 336 | 2026-06-22 | flat |

## Spec checks

- Description over the 1024-char limit: **0**
- Body over the 500-line soft limit: **1**
- Frontmatter name that breaks the spec pattern: **13**
- Longest bodies: `wrangler` (920), `windows-host` (260), `cloudflare` (240), `agents-sdk` (219), `character-cards` (217)

## Leak surface (aggregate only)

Counts of files and skills matching each class. No matches are reproduced.

| Class | Files | Skills |
|---|---|---|
| IPv4 address | 102 | 12 |
| absolute Windows user path | 9 | 9 |
| private key block | 0 | 0 |
| password assignment | 6 | 3 |
| token / API key assignment | 73 | 10 |
| email address | 36 | 10 |

This table is the argument for publishing the charter and not the directory:
the knowledge is only useful because it names real hosts, real accounts and
real paths, and that is exactly what cannot leave the machine.

### Hand-written skills only

The same scan restricted to skills with no `references/`, `scripts/` or
`assets/`: the ones written on this machine rather than vendored from
upstream docs. Match counts, not file counts, because these are few files.

| Class | Skills | Matches |
|---|---|---|
| IPv4 address | 8 | 57 |
| absolute Windows user path | 8 | 23 |
| private key block | 0 | 0 |
| password assignment | 2 | 2 |
| token / API key assignment | 3 | 3 |
| email address | 6 | 20 |
