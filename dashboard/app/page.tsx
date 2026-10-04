"use client";

import { useState } from "react";
import StateMachine from "./components/StateMachine";
import AuditTimeline from "./components/AuditTimeline";
import DiffViewer from "./components/DiffViewer";
import MetricsPanel from "./components/MetricsPanel";
import VoiceCommand, { speak } from "./components/VoiceCommand";

type State =
  | "INTAKE"
  | "REPRODUCE"
  | "LOCALIZE"
  | "PATCH"
  | "VERIFY"
  | "CRITIQUE"
  | "VERIFIED"
  | "DIAGNOSE"
  | "ESCALATE";

export default function Home() {
  const [sessionState, setSessionState] = useState<State>("INTAKE");
  const [stateHistory, setStateHistory] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [diff, setDiff] = useState<{ before: string; after: string } | null>(
    null,
  );
  const [auditLog, setAuditLog] = useState<
    Array<{ timestamp: string; to: string; event: string; cost: number }>
  >([]);
  const [durationMs, setDurationMs] = useState(0);

  async function startRun(initialLog = "[API] Connecting to MCP server...") {
    if (isRunning) {
      return;
    }

    setIsRunning(true);
    setLogs([initialLog]);
    setStateHistory([]);
    setSessionState("INTAKE");
    setResult(null);
    setDiff(null);
    setAuditLog([]);
    setDurationMs(0);

    try {
      const requestStartedAt = Date.now();
      const response = await fetch("/api/run-fix", { method: "POST" });
      const apiResult = await response.json();
      const requestDuration = Date.now() - requestStartedAt;

      if (!apiResult.success) {
        setLogs((currentLogs) => [
          ...currentLogs,
          `Error: ${apiResult.error ?? "Autonomous fix failed."}`,
        ]);
        return;
      }

      const stateHistory = apiResult.data.stateHistory as string[];
      const auditLog = apiResult.data.auditLog as Array<{
        timestamp: string;
        to: string;
        event: string;
        cost: number;
      }>;

      const messages: Record<string, string> = {
        INTAKE: "Starting autonomous fix session",
        REPRODUCE: "Reproducing the reported issue",
        LOCALIZE: "Localizing the root cause",
        PATCH: "Applying the targeted fix",
        VERIFY: "Running verification checks",
        CRITIQUE: "Running adversarial critique",
        VERIFIED: "Fix verified successfully. Bug fixed.",
        DIAGNOSE: "Diagnosis needed. Escalating.",
        ESCALATE: "Escalating to human review.",
      };

      for (let i = 0; i < stateHistory.length; i++) {
        const state = stateHistory[i];
        setSessionState(state as State);
        setStateHistory((history) => [...history, state]);
        setLogs((currentLogs) => [
          ...currentLogs,
          `[00:00:0${i}.00] State: ${state}`,
        ]);
        const msg = messages[state];
        if (msg) {
          await speak(msg);
        }
        await new Promise((resolve) => window.setTimeout(resolve, 300));
      }

      if (auditLog.length > 0) {
        setLogs((currentLogs) => [
          ...currentLogs,
          ...auditLog.map(
            ({ timestamp, to, event }) =>
              `[AUDIT ${timestamp}] ${event} -> ${to}`,
          ),
        ]);
      }
      setLogs((currentLogs) => [
        ...currentLogs,
        "Success: Autonomous fix verified. File changed on disk.",
      ]);
      setDurationMs(requestDuration);
      setAuditLog(auditLog);
      setDiff({ before: apiResult.before, after: apiResult.after });
      setResult(apiResult.data);
    } catch (error) {
      setLogs((currentLogs) => [
        ...currentLogs,
        `Error: ${String(error)}`,
      ]);
    } finally {
      setIsRunning(false);
    }
  }

  async function handleVoiceCommand(transcript: string) {
    const voiceLog = `[VOICE] User said: ${transcript}`;
    if (/fix|bug/i.test(transcript)) {
      await startRun(voiceLog);
      return;
    }

    setLogs((currentLogs) => [...currentLogs, voiceLog]);
    setLogs((currentLogs) => [
      ...currentLogs,
      "Try saying: Fix the addNumbers bug",
    ]);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-6 text-slate-100 sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col">
        <header className="mb-8 flex flex-col gap-5 border-b border-slate-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-400">
              Autonomous developer companion
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              DevCompanion AI{" "}
              <span className="text-slate-500">—</span>{" "}
              <span className="text-slate-300">
                Autonomous Bug-to-Verified-Fix Loop
              </span>
            </h1>
          </div>
          <button
            type="button"
            onClick={() => void startRun()}
            disabled={isRunning}
            className="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {isRunning ? "Fix in progress..." : "Run Autonomous Fix"}
          </button>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-black/20 lg:col-span-2">
            <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950/60 p-5">
              <h2 className="mb-4 text-center text-sm font-semibold text-white">
                Alexa+ Voice Interface
              </h2>
              <VoiceCommand
                onCommand={handleVoiceCommand}
                disabled={isRunning}
                currentState={sessionState}
              />
            </div>
            <div className="mb-3 flex items-center justify-between px-1">
              <div>
                <h2 className="font-semibold text-white">Execution flow</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Live state progression from intake to verified fix
                </p>
              </div>
              <span className="hidden rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400 sm:inline">
                MCP session
              </span>
            </div>
            <StateMachine
              currentState={sessionState}
              stateHistory={stateHistory}
            />
          </section>

          <aside className="flex min-h-[480px] flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-black/20">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-white">Run activity</h2>
                <p className="mt-1 text-sm text-slate-400">Live execution log</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold tracking-wide ${
                  isRunning
                    ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30"
                    : sessionState === "VERIFIED"
                      ? "bg-emerald-400/15 text-emerald-400 ring-1 ring-emerald-400/30"
                      : "bg-slate-800 text-slate-400 ring-1 ring-slate-700"
                }`}
              >
                {isRunning ? "RUNNING" : sessionState}
              </span>
            </div>

            <div
              className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-6"
              aria-live="polite"
              aria-label="Execution logs"
            >
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <p
                    key={`${log}-${index}`}
                    className={
                      log.includes("VERIFIED")
                        ? "text-emerald-400"
                        : "text-slate-400"
                    }
                  >
                    {log}
                  </p>
                ))
              ) : (
                <p className="text-slate-600">
                  Ready to start an autonomous fix run...
                </p>
              )}
            </div>

            {result && (
              <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                <span className="font-semibold">Success:</span>{" "}
                Autonomous fix completed.
              </div>
            )}

          </aside>
        </div>

        {result && (
          <>
            <div className="mt-6">
              <MetricsPanel
                stateHistory={stateHistory}
                durationMs={durationMs}
              />
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                {diff && <DiffViewer before={diff.before} after={diff.after} />}
              </div>
              <AuditTimeline auditLog={auditLog} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
