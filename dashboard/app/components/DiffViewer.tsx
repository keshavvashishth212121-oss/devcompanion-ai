interface DiffViewerProps {
  before: string;
  after: string;
}

function splitLines(content: string): string[] {
  return content.split(/\r?\n/);
}

function DiffLine({
  lineNumber,
  content,
  prefix,
  changed,
  side,
}: {
  lineNumber: number;
  content: string;
  prefix: "-" | "+";
  changed: boolean;
  side: "before" | "after";
}) {
  return (
    <div
      className={`flex min-h-6 font-mono text-xs leading-6 ${
        changed
          ? side === "before"
            ? "bg-red-950/40 text-red-500"
            : "bg-green-950/40 text-green-500"
          : "text-slate-400"
      }`}
    >
      <span className="w-10 shrink-0 select-none bg-slate-800 px-2 text-right text-slate-500">
        {lineNumber}
      </span>
      <span className="w-5 shrink-0 select-none text-center">{prefix}</span>
      <span className="min-w-0 whitespace-pre-wrap break-words pr-3">
        {content || " "}
      </span>
    </div>
  );
}

function DiffViewer({ before, after }: DiffViewerProps) {
  const beforeLines = splitLines(before);
  const afterLines = splitLines(after);
  const lineCount = Math.max(beforeLines.length, afterLines.length);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <header className="border-b border-slate-800 px-4 py-3">
        <h2 className="font-mono text-xs font-semibold text-slate-300">
          Diff: sandbox/src/buggy_code.ts
        </h2>
      </header>
      <div className="grid grid-cols-1 divide-y divide-slate-800 md:grid-cols-2 md:divide-x md:divide-y-0">
        <div className="overflow-x-auto">
          {Array.from({ length: lineCount }, (_, index) => {
            const beforeLine = beforeLines[index] ?? "";
            const afterLine = afterLines[index] ?? "";
            return (
              <DiffLine
                key={`before-${index}`}
                lineNumber={index + 1}
                content={beforeLine}
                prefix="-"
                changed={beforeLine !== afterLine}
                side="before"
              />
            );
          })}
        </div>
        <div className="overflow-x-auto">
          {Array.from({ length: lineCount }, (_, index) => {
            const beforeLine = beforeLines[index] ?? "";
            const afterLine = afterLines[index] ?? "";
            return (
              <DiffLine
                key={`after-${index}`}
                lineNumber={index + 1}
                content={afterLine}
                prefix="+"
                changed={beforeLine !== afterLine}
                side="after"
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default DiffViewer;