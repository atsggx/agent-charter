# What a skill looks like

One real skill, excerpted and redacted. Paths and the account name are
replaced; everything else is as written, including the dates.

This is here to show the shape the charter asks for: a rule, the measurement
that established it, and a check the next session can repeat. The dates are
not decoration. They are how a future reader knows which claims to trust and
which to re-test.

````markdown
---
name: Windows Host Internals
description: OS-layer rules for code running on the user's main Windows PC ...
---

## Rules

- **Never low-level/global hooks** (`SetWindowsHookEx` + `WH_KEYBOARD_LL`,
  `WH_MOUSE_LL`, ...). Microsoft's Hooks Overview: "use global hooks only for
  debugging purposes" — they need a bitness-matched DLL injected into every
  process, are blocked across integrity levels (UIPI), are silently unhooked
  if the callback is slow, and look like keyloggers to EDR. Use `SendInput`.
- **Check the caller's context first** (session, identity, elevation) before
  trusting any measurement. Most "this API is broken" reports here are really
  "the caller isn't where the user is".

## Session model (verified 2026-10-23)

| Process | Session |
|---|---|
| `sshd.exe`, `sshd-session.exe`, `ssh-shellhost.exe` | 0 |
| the agent's shell, the desktop, `quser` console | 1 |

Proved by catching a live connection: SSH-launched `pwsh.exe` children have
`SessionId 0` while the same shell run locally is session 1. Consequence:
anything session-scoped measured from an SSH session describes session 0, not
the user.

## Console idle (the correct way)

`GetLastInputInfo` is per-**calling-session** — useless from session 0. It did
work in session 1 (measured 7.5 s idle). Use `quser` instead:

```powershell
$rows = & "$env:SystemRoot\System32\quser.exe" 2>&1
# '>' marks the caller's own session, so the console row may have no marker.
```

- Prefer the row with `sess = console` and `state = Active`.
- IDLE TIME formats: `none` / `.` = 0, `N` = minutes, `H:MM`, `D+H:MM`.
````

## The three things to copy

1. **The rule is short, the evidence is specific.** The rule fits in a
   sentence; the paragraph under it says how it was established and what
   breaks if ignored.
2. **Measurements carry dates.** `verified 2026-10-23` tells the next session
   whether to re-run or rely.
3. **Wrong answers are recorded as wrong.** "It did work in session 1
   (measured 7.5 s idle)" is what stops the agent from re-proposing the same
   API in six months.

The full skill is 229 lines. That is near the practical ceiling: past a few
hundred lines, the content that should be in `references/` starts costing
every session that loads the skill.
