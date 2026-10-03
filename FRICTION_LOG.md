\# Friction Log — DevCompanion AI


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