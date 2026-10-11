"use client";

import LZString from "lz-string";
import { use, useEffect, useMemo, useState } from "react";
import AuditTimeline from "../../components/AuditTimeline";
import DiffViewer from "../../components/DiffViewer";
import ReplayScrubber from "../../components/ReplayScrubber";
import StateMachine from "../../components/StateMachine";

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

type AuditEntry = {
  timestamp: string;
  to: string;
  event: string;
  cost: number;
};

type RunReceipt = {
  stateHistory: string[];
  auditLog: AuditEntry[];
  before: string;
  after: string;
  timestamp: number;
};

const states = new Set<State>([
  "INTAKE",
  "REPRODUCE",
  "LOCALIZE",
  "PATCH",
  "VERIFY",
  "CRITIQUE",
  "VERIFIED",
  "DIAGNOSE",
  "ESCALATE",
]);

function decodeReceipt(id: string): RunReceipt {
  let payload: unknown;
  const decompressed = LZString.decompressFromEncodedURIComponent(id);

  if (decompressed) {
    payload = JSON.parse(decompressed);
  } else {
    const normalized = id.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    payload = JSON.parse(json);
  }

  const parsed = payload as RunReceipt;

  if (
    !Array.isArray(parsed.stateHistory) ||
    !Array.isArray(parsed.auditLog) ||
    typeof parsed.before !== "string" ||
    typeof parsed.after !== "string" ||
    typeof parsed.timestamp !== "number"
  ) {
    throw new Error("Invalid run receipt.");
  }

  return parsed;
}

function simpleHash(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return `fallback-${Math.abs(hash).toString(16)}`;
}

async function hashRunData(value: string): Promise<string> {
  if (!crypto.subtle) {
    return simpleHash(value);
  }

  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export default function RunReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [receipt, setReceipt] = useState<RunReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hash, setHash] = useState("Computing...");
  const [scrubIndex, setScrubIndex] = useState(0);

  useEffect(() => {
    try {
      const decoded = decodeReceipt(id);
      setReceipt(decoded);
      void hashRunData(JSON.stringify(decoded)).then(setHash).catch((hashError) => {
        setHash(`Unable to compute hash: ${String(hashError)}`);
      });
    } catch (decodeError) {
      setError(`Unable to read this run receipt: ${String(decodeError)}`);
    }
  }, [id]);

  const visibleStateHistory = useMemo(
    () => receipt?.stateHistory.slice(0, scrubIndex + 1) ?? [],
    [receipt, scrubIndex],
  );

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-slate-100">
        <p className="rounded-xl border border-red-500/30 bg-red-950/30 p-6 text-red-300">
          {error}
        </p>
      </main>
    );
  }

  if (!receipt) {
    return (
      <main className="flex min-h-screen items-center justify-center text-slate-400">
        Loading run receipt...
      </main>
    );
  }

  const currentState = receipt.stateHistory[scrubIndex] ?? "INTAKE";
  const safeCurrentState = states.has(currentState as State)
    ? (currentState as State)
    : "INTAKE";

  return (
    <main className="min-h-screen px-5 py-10 text-slate-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 border-b border-slate-800 pb-6">
          <p className="font-display mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Independently verifiable. No trust required.
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Run Receipt — DevCompanion AI
          </h1>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <StateMachine
            currentState={safeCurrentState}
            stateHistory={visibleStateHistory}
          />
          <AuditTimeline auditLog={receipt.auditLog} />
        </div>

        <div className="mt-6">
          <ReplayScrubber
            auditLog={receipt.auditLog}
            stateHistory={receipt.stateHistory}
            currentIndex={scrubIndex}
            onScrub={setScrubIndex}
          />
        </div>

        <div className="mt-6">
          <DiffViewer before={receipt.before} after={receipt.after} />
        </div>

        <p className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 text-sm text-slate-400">
          This run was captured at{" "}
          <time dateTime={new Date(receipt.timestamp).toISOString()}>
            {new Date(receipt.timestamp).toLocaleString()}
          </time>
          . SHA256: <span className="font-mono text-emerald-300">{hash}</span>
        </p>
      </div>
    </main>
  );
}
