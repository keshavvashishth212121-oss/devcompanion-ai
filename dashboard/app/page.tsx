"use client";

import { useEffect, useState } from "react";
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

const runStates: Array<{ state: State; message: string }> = [
  { state: "INTAKE", message: "Initializing autonomous fix session..." },
  { state: "REPRODUCE", message: "Reproducing the reported issue..." },
  { state: "LOCALIZE", message: "Localizing the root cause..." },
  { state: "PATCH", message: "Applying the targeted fix..." },
  { state: "VERIFY", message: "Running verification checks..." },
  { state: "CRITIQUE", message: "Reviewing the proposed solution..." },
  { state: "VERIFIED", message: "Fix verified successfully." },
];

function formatTimestamp(index: number) {
  const seconds = Math.floor(index / 2);
  const tenths = index % 2 === 0 ? "00" : "50";
  return `[00:00:${String(seconds).padStart(2, "0")}.${tenths}]`;
}

export default function Home() {
  const [sessionState, setSessionState] = useState<State>("INTAKE");
  const [stateHistory, setStateHistory] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    setSessionState("INTAKE");
    setStateHistory([]);
    setLogs([]);
    setResult(null);

    const timers = runStates.map(({ state, message }, index) =>
      window.setTimeout(() => {
        setSessionState(state);
        setStateHistory((history) => [...history, state]);
        setLogs((currentLogs) => [
          ...currentLogs,
          `${formatTimestamp(index)} State: ${state} - ${message}`,
        ]);

        if (state === "VERIFIED") {
          setIsRunning(false);
          setResult({
            status: "success",
            finalState: state,
            message: "Autonomous fix completed and verified.",
          });
        }
      }, index * 500),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [isRunning]);

  function startRun() {
    if (isRunning) {
      return;
    }
    setIsRunning(true);
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
                {result.message}
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
