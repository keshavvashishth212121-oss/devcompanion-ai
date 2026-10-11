"use client";

import { motion } from "framer-motion";
import LZString from "lz-string";
import { useState } from "react";
import StateMachine from "./components/StateMachine";
import AuditTimeline from "./components/AuditTimeline";
import DiffViewer from "./components/DiffViewer";
import MetricsPanel from "./components/MetricsPanel";
import MCPProtocolStream from "./components/MCPProtocolStream";
import ReplayScrubber from "./components/ReplayScrubber";
import SuccessPulse from "./components/SuccessPulse";
import Hero from "./components/Hero";
import { playSuccessChime } from "./utils/sound";
import VoiceCommand, { speak } from "./components/VoiceCommand";

function forSpeech(text: string): string {
  return text
    .replace(/addNumbers/g, "add numbers")
    .replace(/buggy_code\.ts/g, "buggy code")
    .replace(/sandbox/g, "sandbox");
}

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
  const [scrubIndex, setScrubIndex] = useState(0);
  const [shareToast, setShareToast] = useState<string | null>(null);

  function handleScrub(index: number) {
    setScrubIndex(index);
    setSessionState(auditLog[index]?.to as State || "INTAKE");
  }

  async function shareRun() {
    if (!diff) {
      return;
    }

    const payload = {
      stateHistory,
      auditLog,
      before: diff.before,
      after: diff.after,
      timestamp: Date.now(),
    };
    const encoded = LZString.compressToEncodedURIComponent(
      JSON.stringify(payload),
    );
    const url = `${window.location.origin}/run/${encoded}`;

    try {
      await navigator.clipboard.writeText(url);
      setShareToast("Shareable proof copied to clipboard");
      window.setTimeout(() => setShareToast(null), 3000);
    } catch (error) {
      setShareToast(`Unable to copy shareable proof: ${String(error)}`);
    }
  }

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

      let successChimePlayed = false;
      for (let i = 0; i < stateHistory.length; i++) {
        const state = stateHistory[i];
        setSessionState(state as State);
        setStateHistory((history) => [...history, state]);
        setLogs((currentLogs) => [
          ...currentLogs,
          `[00:00:0${i}.00] State: ${state}`,
        ]);
        const msg = messages[state];
        if (state === "VERIFIED" && !successChimePlayed) {
          playSuccessChime();
          successChimePlayed = true;
        }
        if (msg) {
          await speak(forSpeech(msg));
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
    const normalized = transcript.toLowerCase().replace(/[^\w\s]/g, " ");
    const hasFixIntent = /\b(fix|patch|repair)\b/.test(normalized);
    const hasTarget = /add\s*numbers?/i.test(normalized);

    if (hasFixIntent && hasTarget) {
      await startRun(voiceLog);
      return;
    }

    if (hasFixIntent) {
      setLogs((currentLogs) => [
        ...currentLogs,
        `[VOICE] Heard "${transcript}" — target unclear.`,
      ]);
      await speak(forSpeech(
        "I can fix the addNumbers bug. Try saying: Fix the addNumbers bug",
      ));
      return;
    }

    setLogs((currentLogs) => [...currentLogs, voiceLog]);
    await speak(forSpeech("I didn't catch that. Try saying: Fix the addNumbers bug"));
  }

  const visibleStateHistory = stateHistory.slice(0, scrubIndex + 1);
  const visibleLogs = logs.slice(0, scrubIndex + 1);

  return (
    <>
      <SuccessPulse trigger={result !== null} />
      <Hero />
      <main id="dashboard" className="relative min-h-screen px-5 py-6 text-slate-100 sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col">
        <header className="mb-8 flex flex-col gap-5 border-b border-slate-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-400">
              Autonomous developer companion
            </p>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
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
            className="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {isRunning ? "Fix in progress..." : "Run Autonomous Fix"}
          </button>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-3">
          <section className="rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-2xl lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
              whileHover={{ scale: 1.005 }}
            >
              <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-md shadow-2xl">
                <h2 className="font-display mb-4 text-center text-sm font-semibold text-white">
                  Alexa+ Voice Interface
                </h2>
                <VoiceCommand
                  onCommand={handleVoiceCommand}
                  disabled={isRunning}
                  currentState={sessionState}
                />
              </div>
            </motion.div>
            <div className="mb-3 flex items-center justify-between px-1">
              <div>
                <h2 className="font-display font-semibold text-white">Execution flow</h2>
                <p className="font-body mt-1 text-sm text-slate-400">
                  Live state progression from intake to verified fix
                </p>
              </div>
              <span className="hidden rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400 sm:inline">
                MCP session
              </span>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
              whileHover={{ scale: 1.005 }}
            >
              <StateMachine
                currentState={sessionState}
                stateHistory={visibleStateHistory}
              />
            </motion.div>
          </section>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            whileHover={{ scale: 1.005 }}
          >
            <aside className="flex min-h-[480px] flex-col rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-md shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display font-semibold text-white">Run activity</h2>
                <p className="font-body mt-1 text-sm text-slate-400">Live execution log</p>
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
              className="font-mono min-h-0 flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs leading-6"
              aria-live="polite"
              aria-label="Execution logs"
            >
              {visibleLogs.length > 0 ? (
                visibleLogs.map((log, index) => (
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
                <p className="font-mono text-slate-600">
                  Ready to start an autonomous fix run...
                </p>
              )}
            </div>

            {result && (
              <div className="font-body mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                <span>
                  <span className="font-semibold">Success:</span>{" "}
                  Autonomous fix completed.
                </span>
                <button
                  type="button"
                  onClick={() => void shareRun()}
                  className="rounded-md border border-emerald-400/40 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  Share this run
                </button>
              </div>
            )}

            <MCPProtocolStream isRunning={isRunning} />
            </aside>
          </motion.div>
        </div>

        {result && (
          <div className="mt-6">
            <ReplayScrubber
              auditLog={auditLog}
              stateHistory={stateHistory}
              onScrub={handleScrub}
              currentIndex={scrubIndex}
            />
            <p className="mt-3 text-center text-xs text-slate-500">
              Replay this run — every state, every tool call, millisecond-precise.
            </p>
          </div>
        )}

        {result && (
          <>
            <motion.div
              className="font-body mt-6 rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-2xl"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
              whileHover={{ scale: 1.005 }}
            >
              <MetricsPanel
                stateHistory={stateHistory}
                durationMs={durationMs}
              />
            </motion.div>
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <motion.div
                className="font-mono text-xs rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-2xl lg:col-span-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 24 }}
                whileHover={{ scale: 1.005 }}
              >
                {diff && <DiffViewer before={diff.before} after={diff.after} />}
              </motion.div>
              <motion.div
                className="font-mono rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-2xl"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 24 }}
                whileHover={{ scale: 1.005 }}
              >
                <AuditTimeline auditLog={auditLog} />
              </motion.div>
            </div>
          </>
        )}
      </div>
      </main>
      {shareToast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-emerald-400/40 bg-slate-900 px-4 py-3 text-sm text-emerald-300 shadow-2xl"
        >
          {shareToast}
        </div>
      )}
    </>
  );
}
