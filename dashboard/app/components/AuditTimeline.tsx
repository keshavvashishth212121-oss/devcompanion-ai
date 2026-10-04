interface AuditEntry {
  timestamp: string;
  to: string;
  event: string;
  cost: number;
}

interface AuditTimelineProps {
  auditLog: AuditEntry[];
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toISOString().slice(11, 19);
}

function AuditTimeline({ auditLog }: AuditTimelineProps) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100">
      <h2 className="mb-4 text-sm font-semibold text-white">Audit Timeline</h2>

      {auditLog.length === 0 ? (
        <p className="text-sm text-slate-500">No transitions yet.</p>
      ) : (
        <div>
          {auditLog.map((entry, index) => {
            const isLast = index === auditLog.length - 1;
            const isCurrent = isLast;

            return (
              <div className="flex gap-3" key={`${entry.timestamp}-${index}`}>
                <div className="flex w-3 shrink-0 flex-col items-center">
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 rounded-full ${
                      isCurrent ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  />
                  {!isLast && <span className="w-px flex-1 bg-slate-700" />}
                </div>
                <div className={`min-w-0 ${isLast ? "pb-1" : "pb-5"}`}>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <time className="font-mono text-xs text-slate-500">
                      {formatTimestamp(entry.timestamp)}
                    </time>
                    <strong className="text-sm text-slate-200">
                      {entry.to}
                    </strong>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{entry.event}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default AuditTimeline;