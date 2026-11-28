# agent-charter

The instruction file I give my AI agent, which has wide access to my PC and home
network. It's short on purpose: most of what the agent knows isn't in this file,
it's in a folder on the machine, one file per subject.

`AGENTS.md` holds the rules. `PREFERENCES.md` holds my habits, kept apart so that
a rule and a preference never read as the same thing. The rest of the repo shows
the rules are still being followed.

## Prior art

Agent memory is a solved problem in several different ways, and this file is one
of those ways done by hand. The ones worth naming, as of November 2026:

| System | Where the knowledge lives | What it's good at | What this file does better |
|---|---|---|---|
| [Claude Code auto memory](https://code.claude.com/docs/en/memory) | a `MEMORY.md` index plus topic files, loaded on demand | capturing lessons with no effort | covers a machine, not one repo, and gates restructuring |
| [Hermes Agent](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory) | two size-capped files, agent-written skills, and full-text session search | coherent always-on context, and recall when that fails | no harness lock-in, and no character budget to fight for |
| [LifeOS](https://github.com/danielmiessler/LifeOS) | a constitution, 97 skills, and `USER`/`MEMORY` scaffolds in its own config root | goals and identity, plus breadth across research and writing | fits the harness it runs on, and keeps one store instead of two |
| Mem0, Zep, Letta | facts extracted automatically into a vector or graph store | recall at scale | readable, diffable, versioned, and no service to run |
| [grill-with-docs](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md) | a glossary and decision records in the repo | a paper trail for one change | runs unasked, and outlives the session |
| This file | 29 skills in a folder, edited by the agent | a readable, auditable store with no runtime | — |

Each cell in the last column is one axis, not a verdict. On capture, recall and
consolidation, Hermes beats this file outright.

LifeOS is the closest thing to this at scale, and the most useful one to study:
the same shape of context file, skills, memory and hooks, with the opposite
answer on who owns the process. It also needs hooks to behave as designed,
which is why its own install table gives the full behavior only to Claude Code.

They agree on the shape: keep a little loaded at all times, put the rest where
the agent can fetch it on demand, and let the agent write to both. What differs
is who enforces the shape. Claude Code and Hermes enforce it in code; the files
are an implementation detail.

Here the rules are the implementation, because the harness supplies a folder and
no policy for it. A folder an agent can write to is not a memory system until
someone decides what may be written, where it goes, what counts as true, and who
may reorganise it. The rest of this file is those four decisions.

### What's different

1. **Scope.** My subject is a machine, not a repository: hosts, OS behaviour,
   credentials, installed apps. A stale fact here can break something that was
   working, which is why every claim carries a date.
2. **A governance split the runtimes don't have.** Editing a skill's content is
   free; restructuring one needs approval. Hermes can gate every write or none.
   Claude's auto memory has no gate. Neither distinguishes "add a fact" from
   "reorganise the folder", and that distinction is most of what this file is
   about.

### The closest one to compare against

`grill-with-docs` is the nearest single skill, and it differs on three things. I
have to remember to type its name; this file runs unasked. Its source of truth
is the person being interviewed; mine is the machine being investigated. And it
ends when the session does, while this one is trying to be true next month. Its
failure mode is a session that produces nothing; mine is knowledge that goes
stale and contradicts itself.

## Proof the folder is real

| What | Number |
|---|---|
| Skill folders | 29 |
| Files inside them | 522 |
| Size | 27.8 MiB |
| Last changed between | June 22 and November 28, 2026 |
| Written by hand (the rest are copied from vendor docs) | 20 of 29 |
| Longer than 500 lines | 1 |
| Descriptions over the 1024-character limit | 0 |

Everything here can be re-derived:

```sh
node evidence/measure.mjs --out evidence/skills-inventory.md
```

The full table is in [`evidence/skills-inventory.md`](evidence/skills-inventory.md).
One skill with the private details removed is in
[`evidence/exemplar.md`](evidence/exemplar.md).

## Why the skills aren't in this repo

Because they're only useful when they name real things, and real things can't be
published. Of the 16 skills I wrote by hand:

| Contains | Skills |
|---|---|
| IP addresses | 8 |
| File paths with a username in them | 8 |
| Email addresses | 6 |
| API keys or tokens | 3 |
| Passwords | 2 |
| Private keys | 0 |

Strip those out and what's left is general advice about home servers, which
anyone can write and which already exists all over GitHub. So the folder stays
on my machine and this repo reports its shape instead.

## What changed for publication

The original was one file holding three kinds of content: rules that hold
anywhere, facts about this one machine, and my preferences. This copy separates
them.

**Split.** The rules stayed in `AGENTS.md`. My preferences moved to
`PREFERENCES.md`, which the agent loads after it through the `instructions`
array in `opencode.jsonc`. That's not tidiness: anyone can now tell a rule from
a habit without close reading, and the rules file stops carrying anything that
only I would agree with.

**Reworded.**

1. The names of the actual machines became descriptions: "the NAS", "the
   virtual machine", "the home automation box".
2. The skills folder path became "the agent's skills directory", and the note
   about that folder not being in version control was reworded to match.

**Deleted.** The section for one-machine details. It held a personal download
path and the rule about desktop hooks; the path had no place in a published
copy, and the hook rule moved to `PREFERENCES.md` with the rest of my choices.

**Withheld.** One bullet of `PREFERENCES.md`: the content policy. Everything
else in that file is published as written.

The original is still on my machine. This is the copy I publish.

## Credits

The taxonomy of rule kinds and the evidence standard in `AGENTS.md` are adapted
from [LifeOS](https://github.com/danielmiessler/LifeOS) by Daniel Miessler, MIT:
`BitterLessonEngineering` for sorting rules by kind, and `Research` for link
verification, source depth and how a refusal is handled.

Four skills behind the counts above also began as LifeOS skills (`Presentation`,
`StoryExplanation`, `WriteStory`, `HTML`) and were rewritten to run here
without LifeOS's TypeScript tools.