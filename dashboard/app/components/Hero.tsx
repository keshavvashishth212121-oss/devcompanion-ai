export default function Hero() {
  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-6 py-24 text-center">
      {/* Background Grid & Glow */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-emerald-500 opacity-20 blur-[100px]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="mb-8 inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400 backdrop-blur-sm">
          <span className="mr-2 flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          v1.0.0 Live on Vercel
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
            Don&apos;t trust the agent.
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-[0_0_40px_rgba(16,185,129,0.3)]">
            Audit it.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed sm:text-xl font-light">
          Autonomous code fixes with deterministic control flow, millisecond-precise
          replay, and event-sourced proof. Self-hosted MCP server.{" "}
          <span className="text-emerald-400 font-mono text-sm">Spec 2025-11-25.</span>
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#dashboard"
            className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-emerald-500 px-8 font-medium text-black transition-all hover:scale-105 hover:bg-emerald-400 hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]"
          >
            <span className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
              <span className="relative h-full w-8 bg-white/20" />
            </span>
            <span className="relative flex items-center gap-2">
              Run a Real Fix
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </a>
          <a
            href="https://github.com/keshavvashishth212121-oss/devcompanion-ai"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/50 px-8 font-medium text-zinc-300 backdrop-blur-md transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
          >
            View on GitHub
          </a>
        </div>

        <p className="mt-8 text-sm text-zinc-500 font-mono">
          Every run produces a shareable, verifiable receipt.{" "}
          <span className="text-emerald-400">Don&apos;t trust. Audit it.</span>
        </p>
      </div>
    </section>
  );
}