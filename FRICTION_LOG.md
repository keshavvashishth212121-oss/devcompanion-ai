\# Friction Log — DevCompanion AI

## Table of Contents

- [Friction 1: Node.js Not Found](#friction-1-nodejs-not-found)
- [Friction 2: PowerShell Blocks npm Scripts](#friction-2-powershell-blocks-npm-scripts)
- [Friction 3: `cd Desktop` Failed from system32](#friction-3-cd-desktop-failed-from-system32)
- [Friction 4: Copilot Generated Placeholder Code](#day-2-final-status--complete)
- [Friction 5: `search_symbols` Returned Raw Array](#friction-5-search_symbols-returned-raw-array)
- [Friction 6: MCP CallToolResult Format Required](#friction-6-mcp-calltoolresult-format-required-3-tools-affected)
- [Friction 7: Ghost Patch](#friction-7-ghost-patch--file-modified-despite-validation-error)
- [Friction 8: Tool Expansion](#day-3-tool-expansion--mcp-protocol-mastery)
- [Friction 9: End-to-End MCP Tool Testing](#day-3-tool-expansion--mcp-protocol-mastery)
- [Friction 10: First Disk-Level Code Modification](#day-3-tool-expansion--mcp-protocol-mastery)
- [Friction 11: Ghost State Handling](#friction-11-ghost-state-handling-diagnose-path-validation)
- [Friction 12: Progress Notifications](#day-6--progress-notifications--real-time-streaming-complete)
- [Friction 13: Real-Time Streaming](#day-6--progress-notifications--real-time-streaming-complete)
- [Friction 14: `auditLog` Not Populated in XState Context](#friction-14-auditlog-not-populated-in-xstate-context)
- [Friction 15: Infinite Wait on DIAGNOSE State](#friction-15-infinite-wait-on-diagnose-state)
- [Friction 16: MCP Inspector Paginated Toggle Hides Tools](#friction-16-mcp-inspector-paginated-toggle-hides-tools)
- [Friction 17: Git Not Installed by Default on Windows](#friction-17-git-not-installed-by-default-on-windows)
- [Friction 18: Git Identity Not Set on Fresh Install](#friction-18-git-identity-not-set-on-fresh-install)


\## Day 1 — October 3, 2026


\### Friction 1: Node.js Not Found

\- \*\*Error:\*\* Running `node -v` gave `CommandNotFoundException`

\- \*\*Root Cause:\*\* Node.js was not installed on my Windows laptop

\- \*\*Fix:\*\* Downloaded Node.js LTS from nodejs.org, installed, restarted PowerShell

\- \*\*Learning:\*\* Always restart the terminal after installing global tools. Windows PATH updates only apply to new terminal sessions.


\### Friction 2: PowerShell Blocks npm Scripts

\- \*\*Error:\*\* Running `npm -v` gave `PSSecurityException: running scripts is disabled on this system`

\- \*\*Root Cause:\*\* Windows PowerShell's default execution policy blocks `.ps1` scripts for security

\- \*\*Fix:\*\* Ran `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, confirmed with `Y`

\- \*\*Learning:\*\* Windows PowerShell needs explicit permission to run local scripts. `RemoteSigned` allows local scripts while still blocking unsigned remote ones — a good security default.


\### Friction 3: `cd Desktop` Failed from system32

\- \*\*Error:\*\* `cd : Cannot find path 'C:\\Windows\\system32\\Desktop' because it does not exist.`

\- \*\*Root Cause:\*\* PowerShell was opened in `C:\\Windows\\system32` (default for admin mode). Relative path `Desktop` looked for `system32\\Desktop`.

\- \*\*Fix:\*\* Used `cd $HOME\\Desktop` to jump directly to the user's Desktop folder.

\- \*\*Learning:\*\* In PowerShell, always check `pwd` (present working directory) before using relative paths. Use `$HOME` for the user's profile folder.


\### Time Spent Today

\- Total: \~2 hours

\- Coding: 0 hours (setup day)

\- Friction documentation: 20 mins


\### Next Steps for Tomorrow

\- Initialize npm project (`npm init -y`)

\- Install xstate, zod, typescript

\- Generate the 9-state Bug-to-Verified-Fix XState machine



### Day 1 — Final Status: ✅ COMPLETE
- Node.js v24.21.0, npm v11.19.0 installed
- PowerShell execution policy fixed
- Project initialized with xstate, zod, typescript, tsx
- 9-state XState machine implemented and tested
- Both success path (VERIFIED) and failure path (DIAGNOSE) verified
- GitHub Copilot Student used as AI code generator (saved $20/month)
- Time spent: ~3 hours total
- Key learning: XState v5 uses `createActor` instead of `interpret`

### Day 2 — Final Status: ✅ COMPLETE
- Installed fastmcp, zod
- Created server.ts with 2 tools (start_fix_run, simulate_transition)
- Connected to MCP Inspector via Streamable HTTP on port 8000
- Issue 1: Copilot generated placeholder code - fixed with explicit prompt
- Issue 2: sessionId was empty string - fixed with randomUUID() from crypto
- Issue 3: EADDRINUSE error (port 8000) - fixed by killing background process
- Both tools tested in MCP Inspector
- Time spent: ~3 hours

### Day 3 — Tool Expansion & MCP Protocol Mastery

#### Summary
- Created `sandbox/` folder with a deliberately seeded bug (`buggy_code.ts`)
- Added 4 new MCP tools: `read_file`, `search_symbols`, `run_tests`, `apply_patch`
- Tested all tools end-to-end via MCP Inspector
- Successfully ran the FIRST full disk-level code modification: read → patch → verify

#### Friction 5: search_symbols returned raw array
- **Error:** `Tool 'search_symbols' execution failed: Invalid input: expected object, received array`
- **Root Cause:** FastMCP expects a JSON object, but the execute function returned a raw array.
- **Fix:** Wrapped the return value in `{ status: 'success', matches: matches }`
- **Learning:** MCP tools must never return raw arrays or primitives.

#### Friction 6: MCP CallToolResult Format Required (3 tools affected)
- **Error:** `expected array, path: ['content']` and `unrecognized_keys: ['status', 'matches']` (and later `['exitCode','stdout','stderr']` and `['status','message']`)
- **Root Cause:** MCP protocol strictly requires every tool to return a `CallToolResult` object with a `content` array — not a plain custom object.
- **Fix:** Wrapped every return in `{ content: [{ type: 'text', text: JSON.stringify(...) }] }`. Applied this to `search_symbols`, `run_tests`, and `apply_patch`.
- **Learning:** This is a **recurring MCP protocol pattern**. Every custom tool response must follow this exact shape. Recommended creating an `asMcpResult()` helper function to avoid boilerplate.

#### Friction 7: Ghost Patch — File modified despite validation error
- **Error:** After fixing `apply_patch`, it returned `{"status": "not_found"}` on the target file.
- **Root Cause:** During a previous failed attempt (Zod validation error), the file's `writeFileSync` had ALREADY executed. MCP tool logic runs BEFORE the response is validated by the protocol layer.
- **Fix:** Used `read_file` to verify the actual state of the file. Confirmed the earlier patch had succeeded silently. Then applied an inverse patch to verify functionality.
- **Learning:** In distributed systems, side effects (like file writes) can occur even if the response is rejected. MCP tools should ideally validate inputs first, then perform side effects, then return valid CallToolResult.

#### Time Spent Today
- Total: ~3 hours
- Coding/Testing: ~2.5 hours
- Friction documentation: 30 mins

#### Next Steps for Tomorrow (Day 4)
- Wire the XState machine to the MCP tools
- Build the autonomous loop runner (INTAKE → VERIFIED with no manual steps)
- Add progress notifications streaming
- First end-to-end autonomous demo

### Day 4 — Autonomous Loop Engine
- Refactored `state_machine.ts` to use XState v5 `setup()` and `fromPromise` actors
- Added `invoke` services to REPRODUCE, LOCALIZE, PATCH, VERIFY, CRITIQUE states
- Created `engine.ts` to drive the autonomous loop
- Successfully ran the loop: INTAKE → REPRODUCE → LOCALIZE → PATCH → VERIFY → CRITIQUE → VERIFIED
- Achieved: Full autonomous execution without manual intervention
- Key insight: The loop took ~5 seconds (mock services), real version will integrate actual MCP tools
- Time spent: ~2 hours

### Day 5 — Real Tool Integration & First True Autonomous Fix
- Extracted tool functions into `tools.ts` (separation of concerns)
- Refactored `server.ts` to import from `tools.ts`
- Wired real tool functions into `state_machine.ts` invoke services
- Ran autonomous loop: agent ACTUALLY fixed `buggy_code.ts` on disk
- Before: `return a - b;`
- After: `return a + b;` (without any manual intervention)
- Output: INTAKE → REPRODUCE → LOCALIZE → PATCH → VERIFY → CRITIQUE → VERIFIED
- Key milestone: First verifiable autonomous code fix end-to-end
- Time spent: ~2 hours

#### Friction 11: Ghost State Handling (DIAGNOSE path validation)
- **Scenario:** Ran loop on an already-patched sandbox, which caused DIAGNOSE instead of VERIFIED.
- **Root Cause:** `applyFix` couldn't find the original buggy string.
- **Fix:** Reset sandbox to buggy state and re-ran. State machine correctly handled both paths (failure → DIAGNOSE, success → VERIFIED).
- **Learning:** This proved the FSM's guards are working. In production, this prevents silent failures or infinite loops. Judges will love that we tested both success and failure paths.

### Day 6 — Progress Notifications & Real-time Streaming (COMPLETE)
- Added `run_autonomous_fix` MCP tool that drives the full FSM
- Wired `context.reportProgress()` for live progress notifications
- Verified SSE stream shows state transitions in real-time
- Handled DIAGNOSE state properly (added to terminal conditions + 10s max timeout)

#### Friction 14: auditLog not populated in XState context
- **Error:** `run_autonomous_fix` output showed `"auditLog": []`
- **Root Cause:** XState v5 requires `assign()` actions to update context. The transitions weren't recording history.
- **Fix:** Added `entry: assign({ auditLog: ... })` to all 9 states.
- **Learning:** Event sourcing requires explicit context mutation in XState. Every state entry must append to the ledger.

#### Friction 15: Infinite wait on DIAGNOSE state
- **Error:** Tool hung for 60 seconds when the FSM entered DIAGNOSE (bug already fixed).
- **Fix:** Added DIAGNOSE to resolve conditions and a 10s max wait.
- **Learning:** Idempotency is crucial. The system gracefully degrades (DIAGNOSE) instead of hanging.

#### Time Spent Today
- Total: ~3 hours

### Friction 16: MCP Inspector Paginated Toggle Hides Tools
- **Scenario:** Toggled "Paginated" in MCP Inspector, tools list became empty.
- **Root Cause:** Inspector switched to paginated view expecting cursor-based API, but our server has only 7 tools and doesn't implement pagination.
- **Fix:** Toggled off, refreshed page, reconnected.
- **Learning:** Pagination is for large tool sets. Not needed for our current 7 tools. If we scale to 50+ tools, we'd implement MCP pagination spec.

### Day 7 — GitHub Packaging & Deployment

#### Friction 17: Git not installed by default on Windows
- **Error:** `git : The term 'git' is not recognized as the name of a cmdlet, function, script file, or operable program.`
- **Root Cause:** Git is not bundled with Windows. Unlike Linux/macOS, Windows users must install it manually.
- **Fix:** Downloaded Git for Windows from git-scm.com, installed with default settings (including "Git from the command line and also from 3rd-party software" for PATH), then restarted VS Code.
- **Learning:** Just like Node.js, global tools require a fresh terminal session after installation for PATH updates to take effect.

#### Friction 18: Git identity not set on fresh install
- **Error:** `fatal: unable to auto-detect email address (got 'LENOVO@Keshaw.(none)')`
- **Root Cause:** Fresh Git installation has no author identity configured. Git refuses to create commits without knowing who the author is.
- **Fix:** Ran `git config --global user.name` and `git config --global user.email` to set identity.
- **Learning:** Local Git CLI requires explicit identity configuration on first use, unlike the GitHub UI.

#### Achievement: First GitHub Push
- Successfully pushed the DevCompanion AI repository to GitHub.
- Repository: https://github.com/keshavvashishth212121-oss/devcompanion-ai
- First commit: 12 files, 4358 insertions.
- Branch: `main`
- Used Git Credential Manager for OAuth authentication.

#### Time Spent Today
- Total: ~1.5 hours
- Git setup + Push: ~1 hour
- Friction documentation: 30 mins

### Day 8 — Web Dashboard & Visual State Machine (COMPLETE)
- Enabled CORS in MCP server for browser connections
- Set up Next.js 16 dashboard with TypeScript + Tailwind
- Built SVG-based state machine visualizer with 9 nodes and live animations
- Created dashboard with live logs panel + status badges
- Successfully animated full FSM progression: INTAKE → VERIFIED
- Time spent: ~3 hours

#### Friction 19: FastMCP CORS configuration not documented clearly
- **Error:** Browser connections to /mcp were blocked by CORS policy.
- **Root Cause:** FastMCP server does not include CORS headers by default.
- **Fix:** Added `cors` middleware via FastMCP's httpApp or options.cors.
- **Learning:** Production MCP servers need to expose CORS for browser clients. This is not obvious from the spec.

#### Friction 20: Next.js auto-open browser failed + Turbopack lockfile warning
- **Error 1:** `npm run dev` did not auto-open browser on Windows.
- **Fix 1:** Manually navigated to http://localhost:3000.
- **Error 2:** Next.js 16 warned about multiple lockfiles in workspace.
- **Root Cause:** Two package.json files (root + dashboard).
- **Fix 2:** Added `turbopack.root` in `next.config.ts`.
- **Learning:** Next.js 16's Turbopack needs explicit root config when nested in a monorepo-like structure.

### Day 9 — Real MCP Client Wiring (COMPLETE)
- Created Next.js API route `/api/run-fix` acting as server-side MCP client
- API route resets sandbox, calls `run_autonomous_fix`, reads final file, returns diff
- Dashboard now replays REAL state history from MCP response (not mock)
- Before/After diff panel shows actual file change on disk
- Verified: `return a - b;` → `return a + b;` autonomously
- Timestamps in audit log prove genuine execution (not simulated)
- Time spent: ~3 hours

#### Friction 21: Browser MCP SDK limitations
- **Issue:** Initial attempt to call MCP server directly from browser caused CORS + timeout issues.
- **Root Cause:** Browser fetch has CORS constraints and MCP Streamable HTTP needs server-side handling for long-running tools.
- **Fix:** Created Next.js API route that acts as MCP client server-side, then returns JSON to browser.
- **Learning:** Browser should never be an MCP client directly. Always use a backend proxy. This is also how production MCP tools are deployed (server-side clients with proper auth).

### Day 10 — Mission Control Dashboard Polish (COMPLETE)
- Added DiffViewer component (GitHub-style side-by-side diff)
- Added AuditTimeline component (vertical event timeline with timestamps)
- Added MetricsPanel component (Fixes Verified, States Traversed, Time Elapsed, Estimated Cost)
- Integrated all three into the main dashboard layout
- Dashboard now visually matches production SaaS tools (Vercel, Linear style)
- Verified end-to-end: Real MCP client → FSM → disk patch → live UI update
- Time spent: ~3 hours