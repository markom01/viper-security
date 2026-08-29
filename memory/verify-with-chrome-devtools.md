---
name: verify-with-chrome-devtools
description: Default verification method for live + CMS changes in the viper-security repo — use Chrome DevTools MCP, not bash grep of served HTML.
metadata:
  type: feedback
---

For this repo, verify live-site and CMS changes with the **Chrome DevTools MCP**
(`mcp__chrome-devtools__*`) — navigate to the running dev URL, take a snapshot /
screenshot, and confirm rendered content. Do NOT rely on `grep` of served HTML or
built `dist-*` files as the primary check.

**Why:** User directive (2026-08-29): "just check with chrome devtools mcp by
default for future sessions and now." Bash greps of HTML gave false signals during
the DBC home-section dedup work (stale dev server + Vite not watching
`@garage/shared` made served HTML diverge from disk; build-vs-serve confusion).
The browser shows the true rendered result.

**How to apply:**
- Live check: open the running dev server URL in Chrome DevTools, snapshot the page,
  confirm the expected sections/strings render.
- CMS check: open `/admin/` in Chrome DevTools, confirm collections show the right
  widgets (clear Sveltia `localStorage` if config looks stale).
- The user runs their own dev server (DBC on :4322, VIPER on :4321) — use it, never
  start/kill a server, never click GitHub login or type credentials.
- Caveat: Astro dev (Vite) does NOT hot-reload the `@garage/shared` workspace
  package — a code edit there needs a dev-server restart to show live. Prefer a
  fresh `npm run build` to confirm disk-truth compiles, then Chrome for the live view.
