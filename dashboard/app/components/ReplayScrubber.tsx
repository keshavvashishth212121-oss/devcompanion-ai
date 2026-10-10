"use client";

import { useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

interface AuditEntry {
  timestamp: string;
  to: string;
  event: string;
  cost: number;
}

interface ReplayScrubberProps {
  auditLog: AuditEntry[];
  stateHistory: string[];
  onScrub: (index: number) => void;
  currentIndex: number;
}

const speeds = [0.5, 1, 2] as const;

function formatTimestamp(timestamp: string, index: number, firstTimestamp: number) {
  const parsedTimestamp = Date.parse(timestamp);
  const elapsedSeconds =
    Number.isNaN(parsedTimestamp) || Number.isNaN(firstTimestamp)
      ? index * 0.5
      : Math.max(0, (parsedTimestamp - firstTimestamp) / 1000);

  if (elapsedSeconds < 1) {
    return `0:${elapsedSeconds.toFixed(1).slice(2)}`;
  }

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  return `${minutes}:${seconds.toFixed(1).padStart(4, "0")}`;
}

function ReplayScrubber({
  auditLog,
  stateHistory,
  onScrub,
  currentIndex,
}: ReplayScrubberProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof speeds)[number]>(1);
  const firstTimestamp = useMemo(
    () => Date.parse(auditLog[0]?.timestamp ?? ""),
    [auditLog],
  );
  const maxIndex = Math.max(stateHistory.length - 1, 0);
  const boundedIndex = Math.min(Math.max(currentIndex, 0), maxIndex);

  useEffect(() => {
    if (!isPlaying || stateHistory.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      if (boundedIndex >= maxIndex) {
        setIsPlaying(false);
        return;
      }

      onScrub(boundedIndex + 1);
    }, 800 / speed);

    return () => window.clearInterval(interval);
  }, [boundedIndex, isPlaying, maxIndex, onScrub, speed, stateHistory.length]);

  function handleScrub(value: string) {
    onScrub(Number(value));
  }

  function handleReset() {
    setIsPlaying(false);
    onScrub(0);
  }

  return (
    <section className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-5 text-slate-100 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            disabled={isPlaying || stateHistory.length < 2}
            aria-label="Play replay"
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-emerald-400 transition hover:bg-emerald-400/10 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Play className="h-4 w-4 fill-current" />
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying(false)}
            disabled={!isPlaying}
            aria-label="Pause replay"
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-amber-400 transition hover:bg-amber-400/10 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Pause className="h-4 w-4 fill-current" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={stateHistory.length === 0}
            aria-label="Reset replay"
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <label className="ml-2 flex items-center gap-2 text-xs text-slate-400">
            <span className="sr-only">Playback speed</span>
            <select
              value={speed}
              onChange={(event) =>
                setSpeed(Number(event.target.value) as (typeof speeds)[number])
              }
              className="rounded-md border border-white/10 bg-slate-900/80 px-2 py-1.5 text-xs text-slate-200 outline-none transition focus:border-emerald-400"
            >
              {speeds.map((option) => (
                <option key={option} value={option}>
                  {option}x
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 grid grid-flow-col auto-cols-fr gap-2 text-center font-mono text-[10px] text-slate-500">
            {stateHistory.map((_, index) => (
              <span key={`timestamp-${index}`}>
                {formatTimestamp(
                  auditLog[index]?.timestamp ?? "",
                  index,
                  firstTimestamp,
                )}
              </span>
            ))}
          </div>

          <div className="relative px-1">
            <div className="absolute inset-x-1 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-400 to-amber-400" />
            <input
              type="range"
              min={0}
              max={maxIndex}
              step={1}
              value={boundedIndex}
              onChange={(event) => handleScrub(event.target.value)}
              disabled={stateHistory.length === 0}
              aria-label="Replay timeline"
              className="relative z-10 h-4 w-full cursor-grab appearance-none bg-transparent accent-emerald-400 active:cursor-grabbing [&::-moz-range-progress]:bg-transparent [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-emerald-400 [&::-moz-range-thumb]:ring-2 [&::-moz-range-thumb]:ring-transparent [&::-moz-range-thumb]:transition [&::-moz-range-thumb]:hover:ring-emerald-300 [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-0.5 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:mt-[-7px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-transparent [&::-webkit-slider-thumb]:transition [&::-webkit-slider-thumb]:hover:ring-emerald-300"
            />
            <div className="pointer-events-none absolute inset-x-1 top-1/2 z-0 flex -translate-y-1/2 justify-between">
              {stateHistory.map((state, index) => (
                <span
                  key={`tick-${state}-${index}`}
                  className={`h-2 w-2 -translate-x-1/2 rounded-full border ${
                    index <= boundedIndex
                      ? "border-emerald-300 bg-emerald-400"
                      : "border-slate-500 bg-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mt-3 grid grid-flow-col auto-cols-fr gap-2 text-center font-display text-[10px] font-semibold uppercase tracking-wide">
            {stateHistory.map((state, index) => (
              <span
                key={`state-${state}-${index}`}
                className={
                  index === boundedIndex
                    ? "text-amber-400"
                    : index < boundedIndex
                      ? "text-emerald-400"
                      : "text-slate-500"
                }
              >
                {state}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReplayScrubber;