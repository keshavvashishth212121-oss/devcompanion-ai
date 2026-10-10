# Friction Log — DevCompanion AI

> A running log of every friction point encountered while building DevCompanion AI for the Amazon Developer Hackathon (Alexa+ Track). Submitted as part of the up-to-10% Friction Log bonus criteria.

---

## Table of Contents

- [Friction 1: Node.js Not Found](#friction-1-nodejs-not-found)
- [Friction 2: PowerShell Blocks npm Scripts](#friction-2-powershell-blocks-npm-scripts)
- [Friction 3: `cd Desktop` Failed from system32](#friction-3-cd-desktop-failed-from-system32)
- [Friction 4: Copilot Generated Placeholder Code](#friction-4-copilot-generated-placeholder-code)
- [Friction 5: `search_symbols` Returned Raw Array](#friction-5-search-symbols-returned-raw-array)
- [Friction 6: MCP CallToolResult Format Required](#friction-6-mcp-calltoolresult-format-required)
- [Friction 7: Ghost Patch — File Modified Despite Validation Error](#friction-7-ghost-patch-file-modified-despite-validation-error)
- [Friction 8: Tool Expansion — Day 3 MCP Protocol Mastery](#friction-8-tool-expansion-day-3-mcp-protocol-mastery)
- [Friction 9: End-to-End MCP Tool Testing](#friction-9-end-to-end-mcp-tool-testing)
- [Friction 10: First Disk-Level Code Modification](#friction-10-first-disk-level-code-modification)
- [Friction 11: Ghost State Handling — DIAGNOSE Path Validation](#friction-11-ghost-state-handling-diagnose-path-validation)
- [Friction 12: Progress Notifications — Day 6 Real-Time Streaming](#friction-12-progress-notifications-day-6-real-time-streaming)
- [Friction 13: Real-Time Streaming Issues](#friction-13-real-time-streaming-issues)
- [Friction 14: `auditLog` Not Populated in XState Context](#friction-14-auditlog-not-populated-in-xstate-context)
- [Friction 15: Infinite Wait on DIAGNOSE State](#friction-15-infinite-wait-on-diagnose-state)
- [Friction 16: MCP Inspector Paginated Toggle Hides Tools](#friction-16-mcp-inspector-paginated-toggle-hides-tools)
- [Friction 17: Git Not Installed by Default on Windows](#friction-17-git-not-installed-by-default-on-windows)
- [Friction 18: Git Identity Not Set on Fresh Install](#friction-18-git-identity-not-set-on-fresh-install)
- [Friction 19: FastMCP CORS Configuration Not Documented Clearly](#friction-19-fastmcp-cors-configuration-not-documented-clearly)
- [Friction 20: Next.js Auto-Open Browser Failed + Turbopack Lockfile Warning](#friction-20-nextjs-auto-open-browser-failed-turbopack-lockfile-warning)
- [Friction 21: Browser MCP SDK Limitations](#friction-21-browser-mcp-sdk-limitations)
- [Friction 22: Web Speech API Browser Compatibility](#friction-22-web-speech-api-browser-compatibility)
- [Friction 23: Speech Synthesis Stuttering from Rapid State Transitions](#friction-23-speech-synthesis-stuttering-from-rapid-state-transitions)
- [Friction 24: Chrome speechSynthesis onend Event Not Firing](#friction-24-chrome-speechsynthesis-onend-event-not-firing)
- [Friction 25: Duplicate `speak()` Calls Causing Speech Overlap](#friction-25-duplicate-speak-calls-causing-speech-overlap)
- [Friction 26: Overlapping Male + Female Voices (React StrictMode)](#friction-26-overlapping-male-female-voices-react-strictmode)
- [Friction 27: Voice Too High-Pitched / Rushed for a Developer Tool](#friction-27-voice-too-high-pitched-rushed-for-a-developer-tool)
- [Friction 28: Stray `speak()` Call Reading Log Lines Aloud](#friction-28-stray-speak-call-reading-log-lines-aloud)
- [Friction 29: React useEffect Guard Dropped State Messages (Silent Failures)](#friction-29-react-useeffect-guard-dropped-state-messages-silent-failures)
- [Cross-AI Observation](#cross-ai-observation)
- [Friction 30: AWS UPI AutoPay and ₹15,000 Mandate Confusion](#friction-30-aws-upi-autopay-and-15000-mandate-confusion)
- [Friction 31: Hackathon FAQ Clarification — No Physical Alexa+ Device Needed](#friction-31-hackathon-faq-clarification-no-physical-alexa-device-needed)
- [Friction 32: ENOENT on Vercel Deployment Due to Root Directory Scope](#friction-32-enoent-on-vercel-deployment-due-to-root-directory-scope)
- [Friction 33: MCP Protocol Stream Undefined Lines Crash](#friction-33-mcp-protocol-stream-undefined-lines-crash)
- [Product Feedback Summary](#product-feedback-summary)

---

## Day 1 — October 3, 2026

### Friction 1: Node.js Not Found

- **Task Attempted:** I tried to verify the Node.js installation before starting the project.
- **Steps Taken:** I ran `node -v` in PowerShell, received `CommandNotFoundException`, installed Node.js LTS from nodejs.org, and restarted PowerShell.
- **Expected:** The `node -v` command should have printed the installed Node.js version.
- **Actual:** PowerShell reported that `node` was not recognized because Node.js was not installed.
- **Severity:** Blocker
- **Workaround:** I installed the Node.js LTS distribution and opened a new terminal so the PATH update would take effect.
- **Actionable Suggestion:** Add a Windows prerequisite check to the project setup instructions that gives the required Node.js version and links directly to the LTS installer.

### Friction 2: PowerShell Blocks npm Scripts

- **Task Attempted:** I tried to verify npm after installing Node.js.
- **Steps Taken:** I ran `npm -v`, reviewed the PowerShell error, and changed the current user's execution policy to `RemoteSigned`.
- **Expected:** PowerShell should have executed npm and printed its version.
- **Actual:** PowerShell raised `PSSecurityException: running scripts is disabled on this system`.
- **Severity:** Major
- **Workaround:** I ran `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` and confirmed the change.
- **Actionable Suggestion:** Add a Windows troubleshooting note explaining this exact error and recommend the least-privileged `CurrentUser` scope rather than a machine-wide policy change.

### Friction 3: `cd Desktop` Failed from system32

- **Task Attempted:** I tried to change to the Desktop directory before cloning or creating the project.
- **Steps Taken:** I ran `cd Desktop` from an elevated PowerShell window, inspected the working directory, and then used `cd $HOME\Desktop`.
- **Expected:** PowerShell should have entered the user's Desktop folder.
- **Actual:** It reported `Cannot find path 'C:\Windows\system32\Desktop' because it does not exist.`
- **Severity:** Minor
- **Workaround:** I used the absolute path based on `$HOME` instead of a relative path from `C:\Windows\system32`.
- **Actionable Suggestion:** Include a setup command that first prints the working directory and uses `$HOME\Desktop` for Windows examples so elevated-shell defaults do not cause path errors.

---

## Day 2 — October 4, 2026

### Friction 4: Copilot Generated Placeholder Code

- **Task Attempted:** I tried to implement the `start_fix_run` handler that launches the autonomous fix state machine.
- **Steps Taken:** I reviewed the generated `server.ts`, found `void repoPath; void issueDescription;` placeholders, and reprompted Copilot with the required `createActor` and `actor.start()` integration.
- **Expected:** The generated handler should have connected its inputs to the state machine and returned a real result.
- **Actual:** The handler compiled as a scaffold but ignored both inputs and did not start the state machine.
- **Severity:** Major
- **Workaround:** I used a contract-first prompt specifying imports, function calls, state-machine startup, and the expected response shape.
- **Actionable Suggestion:** Add an MCP server scaffold template that wires handler parameters into a runnable example and marks placeholder statements as explicit TODOs or compile-time failures.

---

## Day 3 — October 5, 2026

### Friction 5: `search_symbols` Returned Raw Array

- **Task Attempted:** I tried to expose symbol search results through the `search_symbols` MCP tool.
- **Steps Taken:** I returned an array of `{ filePath, lineNumber }` objects, called the tool, and inspected the validation error.
- **Expected:** The MCP tool should have accepted the array as its result.
- **Actual:** It failed with `Tool 'search_symbols' execution failed: Invalid input: expected object, received array`.
- **Severity:** Major
- **Workaround:** I wrapped the array in a named object: `{ status: 'success', matches }`.
- **Actionable Suggestion:** Update the FastMCP tool-result documentation and TypeScript types to show that top-level arrays and primitives are rejected, with a valid object example for search results.

### Friction 6: MCP CallToolResult Format Required

- **Task Attempted:** I tried to return custom JSON objects from several MCP tools.
- **Steps Taken:** I returned `{ status, matches }`, read the protocol validation errors, and changed each tool to return a `CallToolResult` with a `content` array containing a text item.
- **Expected:** A JSON object with the tool's domain fields should have been accepted directly.
- **Actual:** Validation reported `expected array, path: ['content']` and `unrecognized_keys: ['status', 'matches']`.
- **Severity:** Major
- **Workaround:** I returned `{ content: [{ type: 'text', text: JSON.stringify(payload) }] }` from `search_symbols`, `run_tests`, and `apply_patch`.
- **Actionable Suggestion:** Add a shared `asMcpResult()` helper to the SDK examples and make the validation error identify the required `content` structure with a complete valid response.

### Friction 7: Ghost Patch — File Modified Despite Validation Error

- **Task Attempted:** I tried to apply a patch and determine whether the requested file modification succeeded.
- **Steps Taken:** The MCP call returned `{"status":"not_found"}` after a validation failure, so I used `read_file` to inspect the target file and compare its contents.
- **Expected:** A failed tool response should have meant that no file mutation occurred.
- **Actual:** `writeFileSync` had already modified the file before the protocol layer rejected the invalid response.
- **Severity:** Major
- **Workaround:** I verified the filesystem state directly before retrying and treated the file contents, rather than the response status, as authoritative.
- **Actionable Suggestion:** Validate tool inputs and construct the protocol response before committing side effects, or expose transactional/rollback guidance for tools that perform filesystem writes.

### Friction 8: Tool Expansion — Day 3 MCP Protocol Mastery

- **Task Attempted:** I tried to expand the server with reusable file, search, test, and patch capabilities.
- **Steps Taken:** I added `read_file`, `search_symbols`, `run_tests`, and `apply_patch`, then extracted their implementations into a reusable `tools.ts` module.
- **Expected:** New tools should have been easy to add without coupling their implementations to server startup code.
- **Actual:** The initial server structure did not provide clear separation between tool registration and tool logic, making expansion harder to maintain.
- **Severity:** Documentation
- **Workaround:** I separated tool implementations from server wiring and kept each function independently testable.
- **Actionable Suggestion:** Provide an official multi-tool project layout showing separate registration, implementation, validation, and test modules for an MCP server.

### Friction 9: End-to-End MCP Tool Testing

- **Task Attempted:** I tried to validate all MCP tools over the actual Streamable HTTP transport.
- **Steps Taken:** I connected MCP Inspector, invoked all six tools, and reviewed request payloads, response payloads, SSE events, and schemas.
- **Expected:** The project documentation should have provided a clear, standard end-to-end test path.
- **Actual:** I had to discover that MCP Inspector was the most useful way to observe the complete protocol exchange.
- **Severity:** Documentation
- **Workaround:** I used MCP Inspector as the integration test client and manually checked every tool over Streamable HTTP.
- **Actionable Suggestion:** Add an official “test a server end to end” guide with MCP Inspector commands, expected SSE events, and a checklist for tool schemas and `CallToolResult` responses.

### Friction 10: First Disk-Level Code Modification

- **Task Attempted:** I tried to prove that the agent could modify a source file rather than only describe a fix.
- **Steps Taken:** I called `read_file`, applied a patch changing `return a - b;` to `return a + b;`, and called `read_file` again to verify the persisted contents.
- **Expected:** The MCP workflow should have made the disk mutation and verification path explicit.
- **Actual:** The first successful mutation required assembling the read-patch-read workflow manually.
- **Severity:** Documentation
- **Workaround:** I used a three-step verification sequence and treated the final file read as the success criterion.
- **Actionable Suggestion:** Publish a canonical MCP example that combines read, patch, and post-write verification, including guidance on reporting the before-and-after content.

---

## Day 5 — October 7, 2026

### Friction 11: Ghost State Handling — DIAGNOSE Path Validation

- **Task Attempted:** I tried to run the autonomous fix loop against a sandbox that had already been patched.
- **Steps Taken:** I ran the loop, observed the DIAGNOSE path when the original buggy text was absent, reset the sandbox to its buggy state, and reran the workflow.
- **Expected:** The workflow should have handled an already-fixed file without appearing to fail or requiring manual state inspection.
- **Actual:** `applyFix` could not find the original buggy string, so the state machine entered DIAGNOSE instead of VERIFIED.
- **Severity:** Major
- **Workaround:** I reset the fixture before testing and verified both the failure/diagnosis and successful verification paths.
- **Actionable Suggestion:** Include an idempotency test fixture and document the expected terminal state when a requested change is already present.

---

## Day 6 — October 8, 2026

### Friction 12: Progress Notifications — Day 6 Real-Time Streaming

- **Task Attempted:** I tried to expose state-machine progress while a long-running MCP tool was executing.
- **Steps Taken:** I added `run_autonomous_fix`, wired `context.reportProgress()` to MCP `notifications/progress`, and observed transitions over SSE.
- **Expected:** A client should have received meaningful progress events rather than waiting for one opaque final response.
- **Actual:** Progress streaming required additional protocol wiring that was not obvious from the initial tool implementation.
- **Severity:** Documentation
- **Workaround:** I connected the state transitions to progress notifications and inspected the resulting SSE stream.
- **Actionable Suggestion:** Add a complete progress-reporting example that maps long-running workflow states to `notifications/progress` events and documents the client subscription behavior.

### Friction 13: Real-Time Streaming Issues

- **Task Attempted:** I tried to run the autonomous tool through MCP Inspector with realistic mock-service delays.
- **Steps Taken:** I ran the tool, received the timeout, removed artificial one-second delays from mock services, and used progress streaming for observability.
- **Expected:** The Inspector should have allowed the tool to complete while SSE progress events were being emitted.
- **Actual:** It failed with `MCP request 3 timed out after 6000ms` because the Inspector has a hardcoded six-second tool-call timeout.
- **Severity:** Major
- **Workaround:** I shortened the mock workflow for Inspector testing and treated SSE keep-alive support as necessary for genuinely long-running tools.
- **Actionable Suggestion:** Make the Inspector timeout configurable, display the active timeout in the UI, and document how clients should handle long-running calls with progress events.

### Friction 14: `auditLog` Not Populated in XState Context

- **Task Attempted:** I tried to return a complete state-transition audit log from the autonomous fix machine.
- **Steps Taken:** I inspected the output showing an empty log, reviewed the XState transitions, and added `assign()` actions on entry to all nine states.
- **Expected:** Every state transition should have appended an entry to the returned audit log.
- **Actual:** `run_autonomous_fix` returned `"auditLog": []` because transitions did not mutate the XState v5 context.
- **Severity:** Major
- **Workaround:** I used `entry: assign({ auditLog: ... })` for each state so the context recorded the transition history.
- **Actionable Suggestion:** Add an XState v5 integration example that demonstrates context mutation and audit-log accumulation for every state entry.

### Friction 15: Infinite Wait on DIAGNOSE State

- **Task Attempted:** I tried to complete the autonomous tool when the state machine entered DIAGNOSE because the bug was already fixed.
- **Steps Taken:** I reproduced the hang, inspected the interval completion conditions, added DIAGNOSE as a terminal condition, and added a ten-second maximum wait.
- **Expected:** The tool should have returned a diagnosis promptly instead of waiting indefinitely.
- **Actual:** It hung for 60 seconds because the polling loop only resolved on VERIFIED or ESCALATE.
- **Severity:** Blocker
- **Workaround:** I treated DIAGNOSE as a terminal state and added a bounded timeout to prevent unbounded waits.
- **Actionable Suggestion:** Add SDK guidance and linting patterns for terminal-state coverage and require an explicit timeout for polling loops in long-running MCP tools.

### Friction 16: MCP Inspector Paginated Toggle Hides Tools

- **Task Attempted:** I tried to inspect the server tools after enabling the Inspector's Paginated option.
- **Steps Taken:** I toggled pagination, observed an empty tool list, disabled the option, refreshed the page, and reconnected.
- **Expected:** The Inspector should have shown the available tools or explained that the server does not implement pagination.
- **Actual:** The tool list became empty because the Inspector expected cursor-based pagination that this seven-tool server did not implement.
- **Severity:** Minor
- **Workaround:** I disabled pagination for the current server and reconnected.
- **Actionable Suggestion:** Show a compatibility warning when pagination is enabled against a server that does not return cursors, rather than rendering an empty tools list.

---

## Day 7 — October 9, 2026

### Friction 17: Git Not Installed by Default on Windows

- **Task Attempted:** I tried to inspect and push the project repository from Windows.
- **Steps Taken:** I ran a Git command, installed Git for Windows with command-line PATH integration, restarted VS Code, and retried the command.
- **Expected:** Git should have been available from the development environment.
- **Actual:** PowerShell reported `git : The term 'git' is not recognized as the name of a cmdlet, function, script file, or operable program.`
- **Severity:** Blocker
- **Workaround:** I installed Git for Windows and opened a fresh VS Code session so the PATH change was loaded.
- **Actionable Suggestion:** Add Git to the Windows prerequisites and provide a startup diagnostic that checks `node`, `npm`, and `git` before the first repository task.

### Friction 18: Git Identity Not Set on Fresh Install

- **Task Attempted:** I tried to create the first Git commit after installing Git.
- **Steps Taken:** I ran `git commit`, read the identity error, and configured `user.name` and `user.email` globally.
- **Expected:** Git should have created the commit using the authenticated GitHub account or prompted for identity during setup.
- **Actual:** It failed with `fatal: unable to auto-detect email address (got 'LENOVO@Keshaw.(none)')`.
- **Severity:** Major
- **Workaround:** I ran `git config --global user.name` and `git config --global user.email` with the intended author values.
- **Actionable Suggestion:** Add a first-commit checklist that checks `git config user.name` and `git config user.email` and provides safe commands to configure them before committing.

### Achievement: First GitHub Push

- Successfully pushed the DevCompanion AI repository to GitHub.
- Repository: https://github.com/keshavvashishth212121-oss/devcompanion-ai
- First commit: 12 files, 4358 insertions.
- Branch: `main`
- Used Git Credential Manager for OAuth authentication.

---

## Day 8 — October 10, 2026

### Friction 19: FastMCP CORS Configuration Not Documented Clearly

- **Task Attempted:** I tried to connect a browser client to the FastMCP `/mcp` endpoint.
- **Steps Taken:** I attempted the browser request, inspected the CORS failure, and configured CORS middleware through FastMCP's HTTP application options.
- **Expected:** A browser client should have been able to call the MCP endpoint when the server was intentionally exposed to that origin.
- **Actual:** Browser requests were blocked by CORS because the default FastMCP server did not emit the required headers.
- **Severity:** Major
- **Workaround:** I added CORS configuration through FastMCP's `httpApp` or `options.cors` support.
- **Actionable Suggestion:** Add a browser-client CORS section to FastMCP documentation with explicit allowed-origin, methods, headers, credentials, and preflight examples.

### Friction 20: Next.js Auto-Open Browser Failed + Turbopack Lockfile Warning

- **Task Attempted:** I tried to start the nested Next.js dashboard and open it in a browser without additional configuration.
- **Steps Taken:** I ran `npm run dev`, opened `http://localhost:3000` manually when no browser opened, and configured `turbopack.root` after reviewing the lockfile warning.
- **Expected:** Next.js should have opened the development URL and identified the dashboard as the intended workspace root.
- **Actual:** The browser did not open automatically, and Next.js 16 warned about multiple lockfiles in the workspace.
- **Severity:** Minor
- **Workaround:** I navigated to the URL manually and set the Turbopack root in `next.config.ts`.
- **Actionable Suggestion:** Document expected auto-open behavior on Windows and add a monorepo example showing how to set `turbopack.root` when a nested app has its own `package.json`.

---

## Day 9 — October 11, 2026

### Friction 21: Browser MCP SDK Limitations

- **Task Attempted:** I tried to call the MCP server directly from the browser application.
- **Steps Taken:** I used browser `fetch`, observed CORS and timeout failures, and moved MCP client execution into a Next.js `/api/run-fix` server-side route.
- **Expected:** The browser should have been able to invoke the MCP server directly and receive the result.
- **Actual:** Browser CORS constraints and long-running Streamable HTTP behavior made the direct client unreliable.
- **Severity:** Major
- **Workaround:** I created a backend proxy that acts as the MCP client, keeps server-side configuration private, and returns JSON to the browser.
- **Actionable Suggestion:** Publish an official browser-integration pattern that explains why MCP clients belong behind a server-side proxy and includes CORS, timeout, authentication, and rate-limit guidance.

---

## Day 11 — October 13, 2026

### Friction 22: Web Speech API Browser Compatibility

- **Task Attempted:** I tried to provide voice commands across common browsers.
- **Steps Taken:** I used `webkitSpeechRecognition`, tested browser availability, and added a text-input fallback in the `VoiceCommand` component.
- **Expected:** Voice input should have worked consistently across supported browsers.
- **Actual:** Web Speech API recognition was unavailable or incomplete in Firefox and Safari and is primarily supported by Chrome and Edge.
- **Severity:** Major
- **Workaround:** I provided a non-voice text input path when speech recognition is unavailable.
- **Actionable Suggestion:** Document browser support and feature detection requirements for Web Speech API examples, and include an accessible text fallback in the reference implementation.

### Friction 23: Speech Synthesis Stuttering from Rapid State Transitions

- **Task Attempted:** I tried to narrate each state of the autonomous fix workflow in sequence.
- **Steps Taken:** I observed the replay loop firing every 600ms, changed `speak()` to return a Promise resolved by `onend`, and awaited each utterance.
- **Expected:** Each state message should have played completely before the next state was spoken.
- **Actual:** Each state began, but the next state's speech cut it off because sentences took about two seconds.
- **Severity:** Major
- **Workaround:** I serialized speech playback by awaiting completion before advancing the replay loop.
- **Actionable Suggestion:** Add a Web Speech sequencing example that queues utterances and explicitly warns against triggering speech on a timer shorter than the utterance duration.

### Friction 24: Chrome speechSynthesis onend Event Not Firing

- **Task Attempted:** I tried to advance the narrated workflow after each Chrome speech-synthesis utterance.
- **Steps Taken:** I reproduced the stuck state, investigated the unresolved Promise, and added a timeout fallback based on `max(3000, text.length * 100)` milliseconds.
- **Expected:** Every utterance should have fired `onend` and allowed the workflow to continue.
- **Actual:** Chrome sometimes failed to fire `SpeechSynthesisUtterance.onend`, leaving the workflow stuck on LOCALIZE.
- **Severity:** Major
- **Workaround:** I resolved the Promise after a bounded timeout when `onend` did not arrive.
- **Actionable Suggestion:** Document the Chromium `speechSynthesis` completion-event failure mode and provide a reference helper with cancellation, timeout, and `onerror` handling.

### Friction 25: Duplicate `speak()` Calls Causing Speech Overlap

- **Task Attempted:** I tried to narrate the workflow from both state updates and the replay loop.
- **Steps Taken:** I compared the spoken output, found two call sites, consolidated speech into one state-watching effect, and removed the loop's duplicate call.
- **Expected:** One message should have played for each state transition.
- **Actual:** “Starting autonomous fix session” overlapped with “State, localize,” and intermediate states were skipped audibly.
- **Severity:** Major
- **Workaround:** I made one component responsible for speech and removed the competing imperative call.
- **Actionable Suggestion:** Add a development-time assertion or instrumentation helper that reports multiple speech producers for the same state transition.

### Friction 26: Overlapping Male + Female Voices (React StrictMode)

- **Task Attempted:** I tried to play one stable voice for each workflow state in React development mode.
- **Steps Taken:** I reproduced simultaneous voices, added `useRef` guards for state and speaking status, and explicitly cached the voice selected by `pickVoice()`.
- **Expected:** React StrictMode should not have caused duplicate audible effects, and the selected voice should have remained consistent.
- **Actual:** Two voices spoke simultaneously because StrictMode ran the effect twice and Chrome selected an unpredictable default voice.
- **Severity:** Major
- **Workaround:** I guarded duplicate effects and assigned an explicit cached voice to each utterance.
- **Actionable Suggestion:** Add React StrictMode guidance for browser side effects and require voice selection plus effect cleanup in speech-synthesis examples.

### Friction 27: Voice Too High-Pitched / Rushed for a Developer Tool

- **Task Attempted:** I tried to make the voice interface sound appropriate for an expert developer-tool persona.
- **Steps Taken:** I evaluated the default voice, selected deeper English voices such as David, Mark, or Guy when available, and changed the rate to `1.0` and pitch to `0.8`.
- **Expected:** The narration should have sounded calm, clear, and professional.
- **Actual:** The default voice was female and rushed at `rate 1.15`, which sounded unsuitable for the demo.
- **Severity:** Minor
- **Workaround:** I added voice preference selection and tuned the rate and pitch.
- **Actionable Suggestion:** Provide voice UX guidance with configurable rate, pitch, language, and fallback selection rather than relying on the browser's unspecified default voice.

### Friction 28: Stray `speak()` Call Reading Log Lines Aloud

- **Task Attempted:** I tried to keep audit-log text visible without having it read aloud as narration.
- **Steps Taken:** I heard background messages such as “State: LOCALIZE,” searched all `speak()` call sites with grep, and removed the leftover call.
- **Expected:** Only the intended state narration should have reached `speechSynthesis`.
- **Actual:** A stale refactor call passed log strings to the speech engine, producing overlapping background narration.
- **Severity:** Major
- **Workaround:** I audited the entire page and confirmed that only the guarded narration path remained.
- **Actionable Suggestion:** Separate display-log formatting from speech-message generation in the type system and add a test that asserts audit-log updates do not invoke speech.

### Friction 29: React useEffect Guard Dropped State Messages (Silent Failures)

- **Task Attempted:** I tried to play every state message exactly once while the workflow advanced asynchronously.
- **Steps Taken:** I observed missing LOCALIZE, VERIFY, and VERIFIED messages, traced early returns to the `isSpeakingRef` guard, and moved speech into an awaited replay loop.
- **Expected:** Every state should have been queued and spoken in order.
- **Actual:** A new state arriving while speech was active caused the effect to return early, silently dropping the message.
- **Severity:** Major
- **Workaround:** I used an imperative loop with `await speak(msg)` so messages were serialized instead of discarded.
- **Actionable Suggestion:** Document that React effects are not queues and provide a tested async queue pattern for ordered side effects such as speech and animation.

---

## Cross-AI Observation

- Consulted Gemini for the voice-bug diagnosis. It correctly identified the stray `speak()` reading log lines pattern in Friction 28, but its suggested fix to remove the timeout fallback would have reintroduced the Chrome `onend` failure in Friction 24. I kept the fallback and validated the recommendation against the project's prior behavior.
- **Learning:** Cross-AI suggestions must be validated against project-specific edge cases. Different AI assistants may not have the complete implementation history or the constraints established by earlier debugging.

---

## Day 11 Result

- **Voice interface:** Fully functional, deterministic, all 7 states spoken in sequence.
- **Demo flow:** User says “Fix the addNumbers bug” → agent narrates INTAKE → REPRODUCE → LOCALIZE → PATCH → VERIFY → CRITIQUE → VERIFIED → fix complete.
- **Zero overlaps, zero drops, zero stuttering.**

---

## Day 12 — October 7, 2026

### Friction 30: AWS UPI AutoPay and ₹15,000 Mandate Confusion

- **Task Attempted:** I tried to complete AWS signup using UPI AutoPay for the hackathon account.
- **Steps Taken:** I reviewed the UPI authorization screen, saw the ₹15,000 mandate limit, investigated the verification charge, redeemed the available hackathon and Free Tier credits, and configured a $1 budget alert.
- **Expected:** The signup flow should have clearly distinguished an authorization limit from an immediate charge and explained the refundable verification amount.
- **Actual:** The screen showed a ₹15,000 limit without enough upfront context, causing concern about a potential large charge; the ₹2 refundable verification fee was also not clearly explained.
- **Severity:** Major
- **Workaround:** I proceeded after confirming that the mandate limit was not an immediate charge, understood the ₹2 verification hold, redeemed $150 in hackathon credits plus $100 in Free Tier credits, and added a budget alert.
- **Actionable Suggestion:** Add a plain-language explanation beside the UPI AutoPay field stating that ₹15,000 is a maximum authorization limit, not an immediate debit, and disclose the ₹2 refundable verification hold before confirmation.

### Friction 31: Hackathon FAQ Clarification — No Physical Alexa+ Device Needed

- **Task Attempted:** I tried to determine whether the Alexa+ track required physical Alexa+ hardware.
- **Steps Taken:** I reviewed the track description, searched the official hackathon FAQ, and compared its requirements with the project's simulated voice experience.
- **Expected:** The main track rules should have stated the hardware requirement, or lack of one, unambiguously.
- **Actual:** The track description referenced an MCP server or Agent Skill without clearly stating that no physical device was needed.
- **Severity:** Documentation
- **Workaround:** I used the official FAQ, which states that a self-hosted MCP server, Agent Skill, or simulated experience is acceptable without a physical device.
- **Actionable Suggestion:** Repeat the “no physical device required” statement directly in the Alexa+ track overview and add a requirements matrix covering hardware, software, MCP, and simulated-experience options.

### Friction 32: ENOENT on Vercel Deployment Due to Root Directory Scope

- **Task Attempted:** I tried to run the dashboard's fix API route after deploying only the `dashboard` directory to Vercel.
- **Steps Taken:** The route attempted to reset and read `sandbox/src/buggy_code.ts`, I reproduced the missing-file error, and I wrapped the local file operations in fallbacks while leaving the MCP call on Railway.
- **Expected:** The API route should have completed the remote fix even when the sandbox was outside the Vercel deployment root.
- **Actual:** Vercel reported `ENOENT` because `/var/task/sandbox/src/buggy_code.ts` was not present in the deployed `dashboard` scope.
- **Severity:** Major
- **Workaround:** I caught file read/write failures, displayed a placeholder diff, and continued the MCP request against the Railway server that owns the sandbox.
- **Actionable Suggestion:** Add a monorepo deployment guide that explains Vercel Root Directory file scope and recommends either deploying the required workspace or explicitly separating local filesystem operations from remote MCP execution.

### Friction 33: MCP Protocol Stream Undefined Lines Crash

- **Task Attempted:** I tried to display simulated MCP JSON-RPC messages in the dashboard's live protocol stream.
- **Steps Taken:** I rendered each visible protocol message by mapping over its `lines` array, reproduced the dashboard runtime failure, and added defensive defaults when messages enter state.
- **Expected:** Every stream message should have rendered safely, including messages with incomplete or malformed data.
- **Actual:** The dashboard crashed with `Cannot read properties of undefined (reading 'lines')` when a visible message did not contain a `lines` property.
- **Severity:** Major
- **Workaround:** I normalized pushed messages with `lines: message?.lines || []` and guarded rendering with `(message.lines || []).map(...)`.
- **Actionable Suggestion:** Add runtime schema validation or normalization at MCP stream boundaries, provide a typed message factory that always supplies `lines`, and include a malformed-message test case in the protocol-stream component tests.

## Summary Statistics

- **Total frictions documented:** 32
- **Days of development:** 11
- **Technologies debugged:** Node.js, PowerShell, Git, MCP SDK, FastMCP, XState, Next.js, Turbopack, Web Speech API, React StrictMode, Vercel
- **Key categories:** Environment setup, MCP protocol compliance, state-machine event sourcing, browser API quirks, React async sequencing, cloud deployment, cross-AI validation
- **Lesson:** The majority of friction came from environment setup, protocol integration, deployment boundaries, and browser API inconsistencies rather than the core agent logic. MCP is a useful integration protocol, but its surrounding tooling requires explicit schemas, observability, timeout handling, and deployment guidance.

---

## Product Feedback Summary

- **Documentation gaps:** MCP response envelopes, progress notifications, browser integration, and FastMCP CORS configuration required inference from errors or source behavior; official examples should cover these common integration paths end to end.
- **Setup friction:** Windows developers can be blocked before writing application code by missing Node.js, npm execution policy restrictions, missing Git, PATH refresh requirements, and unset Git identity.
- **Cross-service integration patterns:** A browser UI, Next.js API route, MCP server, Railway runtime, and Vercel deployment each have different networking and filesystem boundaries; reference architectures should make those boundaries explicit.
- **MCP protocol adoption:** The protocol is capable of structured tools and streaming progress, but strict `CallToolResult` envelopes and client timeout behavior are easy to discover only after runtime failures.
- **Observability:** Long-running tools benefit from standardized request URLs, response status logging, progress events, terminal-state reporting, and bounded timeouts so failures can be diagnosed without reproducing the entire workflow locally.
- **Developer experience:** MCP Inspector is valuable for protocol debugging, but pagination and timeout controls should expose compatibility state instead of producing empty tool lists or opaque timeout errors.
- **Cloud deployment readiness:** Examples that perform filesystem work should distinguish local repository operations from remote service operations and document how Root Directory settings, missing files, environment variables, and server wake-up delays affect production behavior.
