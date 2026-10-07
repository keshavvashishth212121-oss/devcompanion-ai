# Friction Log — DevCompanion AI

> A running log of every friction point encountered while building DevCompanion AI for the Amazon Developer Hackathon (Alexa+ Track). Submitted as part of the up-to-10% Friction Log bonus criteria.

---

## Table of Contents

- [Friction 1: Node.js Not Found](#friction-1-nodejs-not-found)
- [Friction 2: PowerShell Blocks npm Scripts](#friction-2-powershell-blocks-npm-scripts)
- [Friction 3: `cd Desktop` Failed from system32](#friction-3-cd-desktop-failed-from-system32)
- [Friction 4: Copilot Generated Placeholder Code](#friction-4-copilot-generated-placeholder-code)
- [Friction 5: `search_symbols` Returned Raw Array](#friction-5-search_symbols-returned-raw-array)
- [Friction 6: MCP CallToolResult Format Required](#friction-6-mcp-calltoolresult-format-required)
- [Friction 7: Ghost Patch — File Modified Despite Validation Error](#friction-7-ghost-patch--file-modified-despite-validation-error)
- [Friction 8: Tool Expansion — Day 3 MCP Protocol Mastery](#friction-8-tool-expansion--day-3-mcp-protocol-mastery)
- [Friction 9: End-to-End MCP Tool Testing](#friction-9-end-to-end-mcp-tool-testing)
- [Friction 10: First Disk-Level Code Modification](#friction-10-first-disk-level-code-modification)
- [Friction 11: Ghost State Handling — DIAGNOSE Path Validation](#friction-11-ghost-state-handling--diagnose-path-validation)
- [Friction 12: Progress Notifications — Day 6 Real-Time Streaming](#friction-12-progress-notifications--day-6-real-time-streaming)
- [Friction 13: Real-Time Streaming Issues](#friction-13-real-time-streaming-issues)
- [Friction 14: `auditLog` Not Populated in XState Context](#friction-14-auditlog-not-populated-in-xstate-context)
- [Friction 15: Infinite Wait on DIAGNOSE State](#friction-15-infinite-wait-on-diagnose-state)
- [Friction 16: MCP Inspector Paginated Toggle Hides Tools](#friction-16-mcp-inspector-paginated-toggle-hides-tools)
- [Friction 17: Git Not Installed by Default on Windows](#friction-17-git-not-installed-by-default-on-windows)
- [Friction 18: Git Identity Not Set on Fresh Install](#friction-18-git-identity-not-set-on-fresh-install)
- [Friction 19: FastMCP CORS Configuration Not Documented Clearly](#friction-19-fastmcp-cors-configuration-not-documented-clearly)
- [Friction 20: Next.js Auto-Open Browser Failed + Turbopack Lockfile Warning](#friction-20-nextjs-auto-open-browser-failed--turbopack-lockfile-warning)
- [Friction 21: Browser MCP SDK Limitations](#friction-21-browser-mcp-sdk-limitations)
- [Friction 22: Web Speech API Browser Compatibility](#friction-22-web-speech-api-browser-compatibility)
- [Friction 23: Speech Synthesis Stuttering from Rapid State Transitions](#friction-23-speech-synthesis-stuttering-from-rapid-state-transitions)
- [Friction 24: Chrome speechSynthesis onend Event Not Firing](#friction-24-chrome-speechsynthesis-onend-event-not-firing)
- [Friction 25: Duplicate `speak()` Calls Causing Speech Overlap](#friction-25-duplicate-speak-calls-causing-speech-overlap)
- [Friction 26: Overlapping Male + Female Voices (React StrictMode)](#friction-26-overlapping-male--female-voices-react-strictmode)
- [Friction 27: Voice Too High-Pitched / Rushed for a Developer Tool](#friction-27-voice-too-high-pitched--rushed-for-a-developer-tool)
- [Friction 28: Stray `speak()` Call Reading Log Lines Aloud](#friction-28-stray-speak-call-reading-log-lines-aloud)
- [Friction 29: React useEffect Guard Dropped State Messages (Silent Failures)](#friction-29-react-useeffect-guard-dropped-state-messages-silent-failures)
- [Cross-AI Observation](#cross-ai-observation)
- [Friction 30: AWS UPI AutoPay and ₹15,000 Mandate Confusion](#friction-30-aws-upi-autopay-and-15000-mandate-confusion)
- [Friction 31: Hackathon FAQ Clarification — No Physical Alexa+ Device Needed](#friction-31-hackathon-faq-clarification--no-physical-alexa-device-needed)
---

## Day 1 — October 3, 2026

### Friction 1: Node.js Not Found

- **Error:** Running `node -v` gave `CommandNotFoundException`
- **Root Cause:** Node.js was not installed on my Windows laptop.
- **Fix:** Downloaded Node.js LTS from nodejs.org, installed, restarted PowerShell.
- **Learning:** Always restart the terminal after installing global tools. Windows PATH updates only apply to new terminal sessions.

### Friction 2: PowerShell Blocks npm Scripts

- **Error:** Running `npm -v` gave `PSSecurityException: running scripts is disabled on this system`
- **Root Cause:** Windows PowerShell's default execution policy blocks `.ps1` scripts for security.
- **Fix:** Ran `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, confirmed with `Y`.
- **Learning:** Windows PowerShell needs explicit permission to run local scripts. `RemoteSigned` allows local scripts while still blocking unsigned remote ones — a good security default.

### Friction 3: `cd Desktop` Failed from system32

- **Error:** `cd : Cannot find path 'C:\Windows\system32\Desktop' because it does not exist.`
- **Root Cause:** PowerShell was opened in `C:\Windows\system32` (default for admin mode). Relative path `Desktop` looked for `system32\Desktop`.
- **Fix:** Used `cd $HOME\Desktop` to jump directly to the user's Desktop folder.
- **Learning:** In PowerShell, always check `pwd` (present working directory) before using relative paths. Use `$HOME` for the user's profile folder.

---

## Day 2 — October 4, 2026

### Friction 4: Copilot Generated Placeholder Code

- **Error:** `server.ts` was generated with `void repoPath; void issueDescription;` placeholders inside the `start_fix_run` handler.
- **Root Cause:** GitHub Copilot generated a scaffold without wiring the state machine. It defaulted to placeholder code when the prompt did not explicitly specify the integration.
- **Fix:** Prompted Copilot again with explicit instructions to import `createActor` from `xstate` and call `actor.start()` inside the handler.
- **Learning:** AI code generators need **contract-first prompts**. Never assume they'll infer integration points. Always specify the exact function calls and return shapes.

---

## Day 3 — October 5, 2026

### Friction 5: `search_symbols` Returned Raw Array

- **Error:** `Tool 'search_symbols' execution failed: Invalid input: expected object, received array`
- **Root Cause:** The execute function returned a raw array (`[{ filePath, lineNumber }]`), but FastMCP expects a JSON object.
- **Fix:** Wrapped the return value in `{ status: 'success', matches: matches }`.
- **Learning:** MCP tools must never return raw arrays or primitives. Always wrap results in a named object.

### Friction 6: MCP CallToolResult Format Required

- **Error:** `expected array, path: ['content']` and `unrecognized_keys: ['status', 'matches']`
- **Root Cause:** MCP protocol strictly requires every tool to return a `CallToolResult` object with a `content` array — not a plain custom object.
- **Fix:** Wrapped every return in `{ content: [{ type: 'text', text: JSON.stringify(...) }] }`. Applied this to `search_symbols`, `run_tests`, and `apply_patch`.
- **Learning:** This is a **recurring MCP protocol pattern**. Every custom tool response must follow this exact shape. Recommended creating an `asMcpResult()` helper function to avoid boilerplate.

### Friction 7: Ghost Patch — File Modified Despite Validation Error

- **Error:** After fixing `apply_patch`, it returned `{"status": "not_found"}` on the target file.
- **Root Cause:** During a previous failed attempt (Zod validation error), the file's `writeFileSync` had ALREADY executed. MCP tool logic runs BEFORE the response is validated by the protocol layer.
- **Fix:** Used `read_file` to verify the actual state of the file. Confirmed the earlier patch had succeeded silently.
- **Learning:** In distributed systems, side effects (like file writes) can occur even if the response is rejected. MCP tools should ideally validate inputs first, then perform side effects, then return valid CallToolResult.

### Friction 8: Tool Expansion — Day 3 MCP Protocol Mastery

- **Summary:** Added four new MCP tools (`read_file`, `search_symbols`, `run_tests`, `apply_patch`) and extracted them into a reusable `tools.ts` file.
- **Learning:** Separation of concerns (tools module vs server module) makes the codebase maintainable. Each tool function is now pure and testable.

### Friction 9: End-to-End MCP Tool Testing

- **Summary:** Tested all 6 tools via MCP Inspector over Streamable HTTP transport.
- **Learning:** The Inspector is indispensable for debugging MCP servers. It shows request/response payloads, SSE events, and tool schemas in real time.

### Friction 10: First Disk-Level Code Modification

- **Summary:** Ran the FIRST successful end-to-end fix: `read_file` → `apply_patch` → `read_file` verified the file changed on disk from `return a - b;` to `return a + b;`.
- **Learning:** This was the moment the agent proved it could actually modify code, not just describe it.

---

## Day 5 — October 7, 2026

### Friction 11: Ghost State Handling — DIAGNOSE Path Validation

- **Scenario:** Ran the autonomous loop on an already-patched sandbox, which caused DIAGNOSE instead of VERIFIED.
- **Root Cause:** `applyFix` couldn't find the original buggy string to replace.
- **Fix:** Reset sandbox to buggy state and re-ran. State machine correctly handled both paths (failure → DIAGNOSE, success → VERIFIED).
- **Learning:** This proved the FSM's guards are working. In production, this prevents silent failures or infinite loops.

---

## Day 6 — October 8, 2026

### Friction 12: Progress Notifications — Day 6 Real-Time Streaming

- **Summary:** Added `run_autonomous_fix` MCP tool that drives the full FSM. Wired `context.reportProgress()` to emit MCP `notifications/progress` over SSE.
- **Learning:** Live progress streaming transforms a black-box tool call into an observable event stream. Clients see state transitions as they happen.

### Friction 13: Real-Time Streaming Issues

- **Error:** `MCP request 3 timed out after 6000ms` in MCP Inspector.
- **Root Cause:** MCP Inspector has a hardcoded 6-second timeout for tool calls. Our autonomous loop exceeded it because mock services had 1-second delays.
- **Fix:** Removed artificial delays from mock services. Real long-running tools will need the client to respect SSE keep-alive.
- **Learning:** Client timeout limits are a real constraint. Design tools for fast completion or use SSE stream progress to keep connections alive.

### Friction 14: `auditLog` Not Populated in XState Context

- **Error:** `run_autonomous_fix` output showed `"auditLog": []`.
- **Root Cause:** XState v5 requires `assign()` actions to update context. The transitions weren't recording history.
- **Fix:** Added `entry: assign({ auditLog: ... })` to all 9 states.
- **Learning:** Event sourcing requires explicit context mutation in XState. Every state entry must append to the ledger.

### Friction 15: Infinite Wait on DIAGNOSE State

- **Error:** Tool hung for 60 seconds when the FSM entered DIAGNOSE (bug already fixed).
- **Root Cause:** The `setInterval` inside `run_autonomous_fix` only resolved on VERIFIED or ESCALATE. DIAGNOSE was not treated as a terminal state.
- **Fix:** Added DIAGNOSE to resolve conditions and a 10s max wait timer.
- **Learning:** Idempotency is crucial. The system gracefully degrades (DIAGNOSE) instead of hanging.

### Friction 16: MCP Inspector Paginated Toggle Hides Tools

- **Scenario:** Toggled "Paginated" in MCP Inspector, tools list became empty.
- **Root Cause:** Inspector switched to paginated view expecting cursor-based API, but our server has only 7 tools and doesn't implement pagination.
- **Fix:** Toggled off, refreshed page, reconnected.
- **Learning:** Pagination is for large tool sets. Not needed for our current 7 tools. If we scale to 50+ tools, we'd implement MCP pagination spec.

---

## Day 7 — October 9, 2026

### Friction 17: Git Not Installed by Default on Windows

- **Error:** `git : The term 'git' is not recognized as the name of a cmdlet, function, script file, or operable program.`
- **Root Cause:** Git is not bundled with Windows. Unlike Linux/macOS, Windows users must install it manually.
- **Fix:** Downloaded Git for Windows from git-scm.com, installed with default settings (including "Git from the command line and also from 3rd-party software" for PATH), then restarted VS Code.
- **Learning:** Just like Node.js, global tools require a fresh terminal session after installation for PATH updates to take effect.

### Friction 18: Git Identity Not Set on Fresh Install

- **Error:** `fatal: unable to auto-detect email address (got 'LENOVO@Keshaw.(none)')`
- **Root Cause:** Fresh Git installation has no author identity configured. Git refuses to create commits without knowing who the author is.
- **Fix:** Ran `git config --global user.name` and `git config --global user.email` to set identity.
- **Learning:** Local Git CLI requires explicit identity configuration on first use, unlike the GitHub UI.

### Achievement: First GitHub Push

- Successfully pushed the DevCompanion AI repository to GitHub.
- Repository: https://github.com/keshavvashishth212121-oss/devcompanion-ai
- First commit: 12 files, 4358 insertions.
- Branch: `main`
- Used Git Credential Manager for OAuth authentication.

---

## Day 8 — October 10, 2026

### Friction 19: FastMCP CORS Configuration Not Documented Clearly

- **Error:** Browser connections to `/mcp` were blocked by CORS policy.
- **Root Cause:** FastMCP server does not include CORS headers by default. Documentation is sparse on browser-client configuration.
- **Fix:** Added `cors` middleware via FastMCP's `httpApp` or `options.cors`.
- **Learning:** Production MCP servers need to expose CORS for browser clients. This is not obvious from the spec.

### Friction 20: Next.js Auto-Open Browser Failed + Turbopack Lockfile Warning

- **Error 1:** `npm run dev` did not auto-open browser on Windows.
- **Fix 1:** Manually navigated to `http://localhost:3000`.
- **Error 2:** Next.js 16 warned about multiple lockfiles in the workspace.
- **Root Cause:** Two `package.json` files (root + dashboard).
- **Fix 2:** Added `turbopack.root` in `next.config.ts`.
- **Learning:** Next.js 16's Turbopack needs explicit root config when nested in a monorepo-like structure.

---

## Day 9 — October 11, 2026

### Friction 21: Browser MCP SDK Limitations

- **Error:** Initial attempt to call MCP server directly from browser caused CORS + timeout issues.
- **Root Cause:** Browser `fetch` has CORS constraints, and MCP Streamable HTTP needs server-side handling for long-running tools.
- **Fix:** Created a Next.js API route (`/api/run-fix`) that acts as the MCP client server-side, then returns JSON to the browser.
- **Learning:** Browser should never be an MCP client directly. Always use a backend proxy. This also enables secret handling and rate limiting.

---

## Day 11 — October 13, 2026

### Friction 22: Web Speech API Browser Compatibility

- **Error:** Web Speech API (`webkitSpeechRecognition`) is not available in all browsers.
- **Root Cause:** Chrome/Edge only. Firefox and Safari partial or missing.
- **Fix:** Added fallback text input in `VoiceCommand` component.
- **Learning:** Production voice interfaces MUST have non-voice fallbacks.

### Friction 23: Speech Synthesis Stuttering from Rapid State Transitions

- **Error:** Each state spoke, but was cut off mid-sentence by the next state's speech.
- **Root Cause:** Replay loop fired every 600ms, but speech takes ~2s per sentence. Overlap.
- **Fix:** Converted `speak()` to return a Promise resolved on `'end'` event. Awaited inside the loop.
- **Learning:** Audio is sequential by nature. UI animation synced to audio must await completion.

### Friction 24: Chrome speechSynthesis onend Event Not Firing

- **Error:** Voice got stuck on LOCALIZE. `speak()` Promise never resolved.
- **Root Cause:** Chrome's `SpeechSynthesisUtterance` sometimes fails to fire `'onend'`, especially after multiple rapid utterances. Documented Chromium bug (crbug.com/335907).
- **Fix:** Added timeout fallback: resolve after `max(3000, text.length * 100)` ms.
- **Learning:** Production voice interfaces MUST have timeout fallbacks for browser APIs known to be flaky. Never trust `'onend'` events unconditionally.

### Friction 25: Duplicate `speak()` Calls Causing Speech Overlap

- **Error:** "Starting autonomous fix session" mixed with "State, localize" — skipping REPRODUCE, PATCH, CRITIQUE.
- **Root Cause:** Both a `useEffect` and the replay loop were calling `speak()` with different arguments.
- **Fix:** Consolidated all speech into a single `useEffect` watching `sessionState`. Removed `speak()` from the loop.
- **Learning:** Speech should be REACTIVE to state, not imperatively called inside loops.

### Friction 26: Overlapping Male + Female Voices (React StrictMode)

- **Error:** Two voices spoke simultaneously — one male reciting the full sentence, one female in the background.
- **Root Cause (1):** React StrictMode in dev mode runs `useEffect` twice → two `speak()` calls per state.
- **Root Cause (2):** Chrome picks an unpredictable default voice if `utterance.voice` is not explicitly set.
- **Fix:** Added `useRef` guards (`lastSpokenStateRef`, `isSpeakingRef`) + explicit voice caching via `pickVoice()`.
- **Learning:** React StrictMode double-effects + browser voice-list inconsistencies compound into nasty bugs.

### Friction 27: Voice Too High-Pitched / Rushed for a Developer Tool

- **Issue:** Default voice was female and rushed (`rate 1.15`), sounding unserious for a dev tool demo.
- **Fix:** Prefer deeper male English voices (David / Mark / Guy) via `pickVoice()`. Set `rate=1.0`, `pitch=0.8`.
- **Learning:** Voice UX matters. Developer tools should sound confident and calm, matching an "expert companion" persona.

### Friction 28: Stray `speak()` Call Reading Log Lines Aloud

- **Error:** Background voice reading "State: LOCALIZE", "State: VERIFY" over the main speech.
- **Root Cause:** A leftover `speak()` call from an earlier refactor was passing the log string to `speechSynthesis`.
- **Fix:** Audited entire `page.tsx` with grep. Confirmed only ONE `speak()` call remains (in the guarded `useEffect`).
- **Learning:** Refactors that move logic around often leave orphan calls. Always grep for the function name after a refactor.

### Friction 29: React useEffect Guard Dropped State Messages (Silent Failures)

- **Error:** Some state messages (LOCALIZE, VERIFY, VERIFIED) were silently skipped during playback.
- **Root Cause:** The `isSpeakingRef.current` guard returned early if a new state arrived during playback. No queue = silent drop.
- **Fix:** Moved speech INTO the replay loop with `await speak(msg)`. Removed `useEffect` and ref guards entirely.
- **Learning:** For strictly ordered async side effects (voice, animation), imperative loops over `await` beat reactive effects. `useEffect` is fire-and-forget; sequential loops are deterministic.

---

## Cross-AI Observation

- Consulted Gemini for the voice-bug diagnosis. It correctly identified the "stray `speak()` reading log lines" pattern (Friction 28), but its suggested fix to "remove the timeout fallback" would have reintroduced Friction 24 (Chrome `onend` bug). Kept the fallback and documented the reasoning.
- **Learning:** Cross-AI suggestions must be validated against project-specific edge cases. Different AI assistants have different context and may not know your project's full history.

---

## Day 11 Result

- **Voice interface:** Fully functional, deterministic, all 7 states spoken in sequence.
- **Demo flow:** User says "Fix the addNumbers bug" → agent narrates INTAKE → REPRODUCE → LOCALIZE → PATCH → VERIFY → CRITIQUE → VERIFIED → fix complete.
- **Zero overlaps, zero drops, zero stuttering.**

---
---

## Day 12 — October 7, 2026

### Friction 30: AWS UPI AutoPay and ₹15,000 Mandate Confusion

- **Error:** During AWS signup, the UPI AutoPay screen showed a mandate limit of ₹15,000, causing panic about a massive charge.
- **Root Cause:** Misunderstanding the difference between an AutoPay *limit* and an actual charge. Also, the ₹2 refundable verification fee wasn't clearly explained upfront.
- **Fix:** Proceeded with UPI AutoPay, aware that ₹2 is only a temporary hold for identity verification. Redemeed $150 Hackathon credits + $100 Free Tier credits (total $250), ensuring all usage is covered.
- **Learning:** AWS India uses UPI AutoPay limits as a safety mechanism, not an immediate charge. Credits must be redeemed immediately after signup to offset any potential costs. Also set up a $1 budget alert to catch surprise bills.

### Friction 31: Hackathon FAQ Clarification — No Physical Alexa+ Device Needed

- **Error:** Uncertainty about whether a physical Alexa+ device or hardware was required for the Alexa+ track.
- **Root Cause:** The track description mentions building an MCP server or Agent Skill, but doesn't explicitly state hardware requirements in the main rules.
- **Fix:** Found the official Hackathon FAQ which clearly states: "Alexa+: build a self-hosted MCP server or Agent Skill, or a simulated experience - no physical device needed."
- **Learning:** Always check the FAQ and official community forums for hardware/software track constraints. Our dashboard's Web Speech API voice interface perfectly satisfies the "simulated experience" criteria, making the project fully compliant with track rules.

---
## Summary Statistics

- **Total frictions documented:** 29
- **Days of development:** 11
- **Technologies debugged:** Node.js, PowerShell, Git, MCP SDK, FastMCP, XState, Next.js, Turbopack, Web Speech API, React StrictMode
- **Key categories:** Environment setup, MCP protocol compliance, State machine event sourcing, Browser API quirks, React async sequencing, Cross-AI validation
- **Lesson:** The vast majority of friction came from **environment setup** and **browser API inconsistencies**, not from the core agent logic. MCP protocol is well-designed; the surrounding tooling ecosystem still has rough edges.