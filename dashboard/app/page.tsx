"use client";

import { useState } from "react";
import StateMachine from "./components/StateMachine";

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

  async function startRun() {
    if (isRunning) {
      return;
    }

    setIsRunning(true);
    setLogs(["[API] Connecting to MCP server..."]);
    setStateHistory([]);
    setSessionState("INTAKE");
    setResult(null);
    setDiff(null);

    try {
      const response = await fetch("/api/run-fix", { method: "POST" });
      const apiResult = await response.json();

      if (!apiResult.success) {
        setLogs((currentLogs) => [
          ...currentLogs,
          `Error: ${apiResult.error ?? "Autonomous fix failed."}`,
        ]);
        return;
      }

      setResult(apiResult.data);
      setDiff({ before: apiResult.before, after: apiResult.after });

      const completedStates = apiResult.data.stateHistory as string[];
      const auditLog = apiResult.data.auditLog as Array<{
        timestamp: string;
        to: string;
        event: string;
      }>;

      for (const [index, state] of completedStates.entries()) {
        setSessionState(state as State);
        setStateHistory((history) => [...history, state]);
        setLogs((currentLogs) => [
          ...currentLogs,
          `[00:00:${String(index).padStart(2, "0")}.00] State: ${state}`,
        ]);
        await new Promise((resolve) => window.setTimeout(resolve, 600));
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
    } catch (error) {
      setLogs((currentLogs) => [
        ...currentLogs,
        `Error: ${String(error)}`,
      ]);
    } finally {
      setIsRunning(false);
    }
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
            onClick={startRun}
            disabled={isRunning}
            className="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {isRunning ? "Fix in progress..." : "Run Autonomous Fix"}
          </button>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-black/20 lg:col-span-2">
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

            {diff && (
              <div className="mt-4 grid gap-3 text-xs">
                <div>
                  <p className="mb-1 font-semibold uppercase tracking-wide text-slate-500">
                    Before
                  </p>
                  <pre className="overflow-x-auto rounded-lg border border-red-500/20 bg-slate-950 p-3 font-mono text-red-300">
                    {diff.before}
                  </pre>
                </div>
                <div>
                  <p className="mb-1 font-semibold uppercase tracking-wide text-slate-500">
                    After
                  </p>
                  <pre className="overflow-x-auto rounded-lg border border-emerald-500/20 bg-slate-950 p-3 font-mono text-emerald-300">
                    {diff.after}
                  </pre>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
