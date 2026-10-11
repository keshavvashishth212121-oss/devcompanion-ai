export default function Hero() {
  return (
    <section className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden px-6 py-24 text-center sm:px-8">
      <style>{`
        @keyframes hero-blob-drift {
          0%, 100% {
            transform: translate3d(-8%, -4%, 0) scale(1);
          }
          50% {
            transform: translate3d(10%, 6%, 0) scale(1.15);
          }
        }
      `}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/10 blur-3xl"
        style={{ animation: "hero-blob-drift 20s ease-in-out infinite" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(2,6,23,0.72)_100%)]"
      />
      <div className="relative z-10 mx-auto max-w-4xl">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400 sm:text-sm">
          Autonomous Developer Companion
        </p>
        <div className="mx-auto my-6 h-px w-16 bg-emerald-400" />
        <h1 className="font-display text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
          Don&apos;t trust the agent.
          <br />
          <span className="text-emerald-400">Audit it.</span>
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-400">
          Autonomous code fixes with deterministic control flow, millisecond-precise
          replay, and event-sourced proof. Self-hosted MCP server. Spec 2025-11-25.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#dashboard"
            className="rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-400 hover:shadow-[0_0_24px_rgba(16,185,129,0.35)] focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Run a Real Fix →
          </a>
          <a
            href="https://github.com/keshavvashishth212121-oss/devcompanion-ai"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-slate-700 bg-transparent px-6 py-3 font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            View on GitHub →
          </a>
        </div>
        <p className="mt-6 text-sm text-slate-500">
          Every run produces a shareable, verifiable receipt. Don&apos;t trust. Audit.
        </p>
      </div>
      <div
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-pulse text-2xl text-emerald-400"
      >
        ↓
      </div>
    </section>
  );
}