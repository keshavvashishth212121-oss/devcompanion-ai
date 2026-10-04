interface MetricsPanelProps {
  stateHistory: string[];
  durationMs: number;
}

const metrics = [
  { key: "fixesVerified", label: "Fixes Verified" },
  { key: "statesTraversed", label: "States Traversed" },
  { key: "timeElapsed", label: "Time Elapsed" },
  { key: "estimatedCost", label: "Estimated Cost" },
] as const;

function MetricsPanel({ stateHistory, durationMs }: MetricsPanelProps) {
  const values = {
    fixesVerified: stateHistory.filter((state) => state === "VERIFIED").length,
    statesTraversed: stateHistory.length,
    timeElapsed: `${(durationMs / 1000).toFixed(1)}s`,
    estimatedCost: `${(stateHistory.length * 0.003).toFixed(3)} USD`,
  };

  return (
    <section className="grid grid-cols-4 gap-4">
      {metrics.map(({ key, label }) => (
        <div
          className="rounded-lg border border-slate-700 bg-slate-800 p-4"
          key={key}
        >
          <p className="text-xs text-slate-400">{label}</p>
          <p className="mt-2 text-xl font-bold text-amber-400">
            {values[key]}
          </p>
        </div>
      ))}
    </section>
  );
}

export default MetricsPanel;