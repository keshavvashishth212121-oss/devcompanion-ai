import AnimatedCounter from "./AnimatedCounter";

interface MetricsPanelProps {
  stateHistory: string[];
  durationMs: number;
}

const metrics = [
  { key: "fixesVerified", label: "Fixes Verified", decimals: 0, suffix: "" },
  {
    key: "statesTraversed",
    label: "States Traversed",
    decimals: 0,
    suffix: "",
  },
  { key: "timeElapsed", label: "Time Elapsed", decimals: 1, suffix: "s" },
  {
    key: "estimatedCost",
    label: "Estimated Cost",
    decimals: 3,
    suffix: " USD",
  },
] as const;

function MetricsPanel({ stateHistory, durationMs }: MetricsPanelProps) {
  const values = {
    fixesVerified: stateHistory.filter((state) => state === "VERIFIED").length,
    statesTraversed: stateHistory.length,
    timeElapsed: durationMs / 1000,
    estimatedCost: stateHistory.length * 0.003,
  };

  return (
    <section className="grid grid-cols-4 gap-4">
      {metrics.map(({ key, label, decimals, suffix }) => (
        <div
          className="rounded-lg border border-slate-700 bg-slate-800 p-4"
          key={key}
        >
          <p className="font-body text-xs text-slate-400">{label}</p>
          <p className="font-mono tabular-nums mt-2 text-xl font-bold text-amber-400">
            <AnimatedCounter
              value={values[key]}
              decimals={decimals}
              suffix={suffix}
            />
          </p>
        </div>
      ))}
    </section>
  );
}

export default MetricsPanel;