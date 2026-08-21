# Harness auto-usage — how this Claude setup can auto-engage its installed skills, hooks, plugins, memory, router, workflows

Research date: 2026-08-15. Target: Claude Code 2.1.231 via claude-code-router (profile `default-claude-code`),
model `opencode-proxy-free/deepseek-v4-flash-free` (DeepSeek V4 flash, free), effort xhigh, 1M context.
Sources: code.claude.com/docs (hooks, skills, memory, plugins, workflows, interactive-mode) + plugin source
(context-mode, claude-mem, superpowers, task-observer, remember) + CCR docs. Verified against this machine's live files.

## How auto-invocation actually works

### The ONE deterministic mechanism: SessionStart hook injecting context
- SessionStart stdout is injected into Claude's context **automatically** — SessionStart, UserPromptSubmit,
  UserPromptExpansion are the ONLY events where plain stdout reaches the model.
- Modern (v2.1.0+): print JSON `{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"..."}}`
  → silent injection, no user-visible message, works regardless of exit code, capped at 10k chars
  (over-cap → saved to file + preview).
- **A hook CANNOT call the Skill tool** (hooks: command/http/mcp_tool/prompt/agent; SessionStart only
  command+mcp_tool, no Skill-tool-as-MCP mapping). The bridge is: inject the skill's SKILL.md text as
  additionalContext and tell Claude to invoke it. That is exactly what superpowers' session-start hook does.
- `reloadSkills: true` only re-scans skill dirs (newly-installed skills live same-session); it does NOT invoke.

### The always-on pattern (already installed)
- superpowers plugin ships `hooks/hooks.json` → SessionStart `matcher startup|clear|compact` →
  `run-hook.cmd session-start` → reads `skills/using-superpowers/SKILL.md`, JSON-escapes, wraps in
  `<EXTREMELY_IMPORTANT>`, emits as `additionalContext`. Meta-skill mandates skill-check-before-anything
  + brainstorming-before-plan-mode.
- This is the **template** for auto-activating any skill every session.

### CLAUDE.md instruction (weaker but zero-hook)
- CLAUDE.md loads every session. Add a line: "At start of any task-oriented session, invoke task-observer
  before beginning work" (the exact text task-observer ships in references/environments.md).
- Caveat: CLAUDE.md is context, not enforced config — model may ignore. SessionStart hook is stronger.

### Frontmatter description matching (default, on by default)
- Every skill without `disable-model-invocation: true` is auto-eligible; Claude matches request →
  description (listing truncated at 1,536 chars; at 1% of context window). Strengthen descriptions with
  trigger keywords. `skillOverrides` in settings can force off/name-only.

### @import (NOT cross-skill)
- `@path` inlines FILE content into CLAUDE.md (max depth 4). There is NO `@skill` cross-skill import.

## Hook inventory / optimal minimal set (highest value : least config)
1. **SessionStart(startup)** — inject memory index pointer + reloadSkills + orchestration directive.
   Replaces a whole class of forgotten-context bugs. Keep SHORT (injected into every first prompt).
2. **UserPromptSubmit** — per-prompt context (codegraph/context-mode/issue data); sub-second.
3. **PreToolUse** — guard destructive commands (exit 2 = deny, stderr → Claude) + auto-approve whitelisted
   tools via `permissionDecision: allow`. Deny not bypassable (hooks tighten, never loosen).
4. **Notification(permission_prompt|idle_prompt)** or Stop — desktop alert.
5. **SessionStart(compact)** — re-inject what compaction loses (docs-recommended over blocking PreCompact).
6. **Stop** — completion side-effects (claude-mem's summarize; transcript capture). Full 120s timeout.
7. **SubagentStop** — matcher = agent type; run per-agent verification.
8. **SessionEnd** — cleanup only; stdout goes to debug log, 1.5s budget (raise via per-hook timeout, cap 60s).

Precedence: deny > defer > ask > allow. additionalContext kept from EVERY hook. Hooks run in parallel —
never chain A→B within one event. Stdout parsed as JSON only if first non-whitespace char is `{`.

## Plugins — capability arrives automatically
- A plugin's components (skills, hooks, slash commands, MCP servers, subagents, statusline) **auto-load at
  session start** the moment it's enabled. No per-use invocation needed.
- Plugin-provided hooks register automatically from `hooks/hooks.json` (`${CLAUDE_PLUGIN_ROOT}`,
  `${CLAUDE_PLUGIN_DATA}`, `${CLAUDE_PROJECT_DIR}` placeholders).
- Enabled plugins also load hooks from their hooks.json — so **installing context-mode + claude-mem already
  wired their SessionStart/UserPromptSubmit/PreToolUse/PostToolUse/Stop hooks for you** (confirmed on disk).
- Auto-update default on for official marketplaces; prune 'Not used recently' quarterly.

## Memory — four layers, one problem
Layers: built-in auto-memory (MEMORY.md) · claude-mem (SQLite ~/.claude-mem/claude-mem.db, Stop-summarized)
· context-mode (FTS5 session DBs, decision capture) · remember (.remember/ markdown). All inject at
SessionStart → bloat + duplication + competing directives. No single source of truth.
Playbook: context-mode = decisions source of truth (survives compact, re-injects); remember = human handoff;
CLAUDE.md/MEMORY.md = durable facts only. Add SessionStart hook to PRUNE, or accept 4 copies.

## CCR + model auto-selection
- CCR intercepts via ANTHROPIC_BASE_URL → local gateway :3456. Per-profile tier mapping + Routing rules
  (first-match-wins, rewrite request.body.model) + `<CCR-SUBAGENT-MODEL>` tag injection (from per-model
  Description) → auto-routes subagents to tagged model. Script-based rules = arbitrary policy
  ({model, rewrites, fallback} reading input.body/headers/tokenCount/sessionId/lastUserText).
- Claude Code native: skill frontmatter `model:` (rest of turn) + `effort:`; subagent frontmatter `model:`;
  resolution order CLAUDE_CODE_SUBAGENT_MODEL > per-invocation model > subagent frontmatter > main model.
- Assembled best practice for THIS setup: CCR Claude Code profile → Opus=strong, Sonnet=daily,
  Haiku=free (opencode-proxy-free/deepseek-v4-flash-free); routing rule rewriting unrecognized models →
  free model with model-chain fallback; `model: haiku`+`effort: low` on trivial skills; `model: opus`+
  `effort: xhigh` on hard skills; CLAUDE_CODE_EFFORT_LEVEL medium floor (instead of xhigh) so trivial asks
  don't burn deep reasoning; CLAUDE_CODE_SUBAGENT_MODEL=free for parallel subagents.

## Workflows / multi-agent
- Workflow = plain-JS script, `export const meta`, `agent()` + `pipeline()`, runs in background runtime,
  on-demand (or `/<name>` saved command). 16 concurrent / 1,000 total agents.
- AUTO-TRIGGER = 'ultracode': keyword in human prompt, or `/effort ultracode` (xhigh + auto-orchestrate every
  substantive task). Human-origin only (not -p/SDK/scheduled/webhook).
- UserPromptSubmit hook can inject the `ultracode` keyword reliably (it runs in front of human input).
- autoplan (gstack): sequential CEO→Design→Eng→DX review pipeline, auto-decisions via 6 principles, dual
  voice (Claude subagent + Codex), decision audit trail. On-demand today; SessionStart directive can
  auto-fire it when a plan file exists.
- Subagents: `.claude/agents/*.md`; `skills:` frontmatter preloads full skill content at spawn → this is
  how a skill 'authors' a specialist. SubagentStart/Stop hooks match by agent name.

## Commands / statusLine / loop
- Custom commands = skill dirs (`.claude/commands/*.md` and `~/.claude/skills/<name>/SKILL.md` both create
  /name, identical). Frontmatter: description (auto-invoke), allowed-tools, model, effort,
  disable-model-invocation (manual-only), user-invocable:false (Claude-only), context:fork+agent,
  hooks, $ARGUMENTS/$name/${CLAUDE_SESSION_ID}/${CLAUDE_EFFORT} substitutions.
- statusLine: script reads JSON on stdin (model, workspace, cost, context_window %, effort, vim, agent,
  session_name, pr.*, worktree.*), prints rows. CANNOT inject into context — terminal only. Good for
  surfacing model/mode/plugin badges.
- /loop + CronCreate for recurring prompts; Stop hook osascript = completion notification (already active).

## Gaps in THIS harness (from inventory) + closes
1. task-observer installed but NOT auto-invoked →
   SessionStart hook injecting its SKILL.md (superpowers pattern) OR CLAUDE.md one-liner (weaker). Highest
   ROI auto-activation.
2. No visible SessionEnd decision-capture → claude-mem already covers summaries via Stop; context-mode
   covers decisions. Cheapest: custom Stop hook writing distilled 'decisions + next steps' remember.md.
3. Most gstack + plugin skills trigger-on-demand only → description matching is on; strengthen descriptions;
   auto-fire plan reviews via SessionStart directive.
4. statusLine is caveman-persona only → could add model/mode/effort/plugin badges (reads ~/.claude/.caveman-active
   flag; harden: whitelist values, cap bytes, strip control chars).
5. 3 memory injectors at SessionStart → prune or pick ONE canonical source.

## Recommended minimal changes (lazy, high-leverage)
- Add a SessionStart hook `matcher startup|clear|compact` that injects the task-observer SKILL.md
  (superpowers pattern, ~8 lines shell + jq-less JSON via printf). 
- Add a SessionStart(compact) hook re-injecting a one-line context pointer (active skill list, memory index).
- Add `Notification` matcher `permission_prompt|idle_prompt` → osascript (already have Stop notify).
- Set CLAUDE_CODE_EFFORT_LEVEL=medium as global floor (save token burn on trivial asks); keep `/effort
  ultracode` per-session for heavy orchestration.
- Consider CCR routing rule → free model for unrecognized/cheap tiers + CLAUDE_CODE_SUBAGENT_MODEL=free.
- Keep CLAUDE.md one-liner for task-observer as belt-and-suspenders.
