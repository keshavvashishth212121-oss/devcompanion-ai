"use client";

import { useEffect, useRef, useState } from "react";

interface MCPProtocolStreamProps {
  isRunning: boolean;
}

interface ProtocolMessage {
  type: "request" | "response" | "event";
  lines: string[];
}

const streamMessages: ProtocolMessage[] = [
  {
    type: "request",
    lines: [
      "→ POST /mcp",
      '  {"jsonrpc":"2.0","method":"tools/call","params":{"name":"run_autonomous_fix"},"id":1}',
    ],
  },
  {
    type: "response",
    lines: ["← 200 OK (text/event-stream)", "  event: progress"],
  },
  {
    type: "event",
    lines: ['  data: {"state":"INTAKE","progress":1}'],
  },
  {
    type: "event",
    lines: ['← event: progress', '  data: {"state":"REPRODUCE","progress":2}'],
  },
  {
    type: "event",
    lines: ['← event: progress', '  data: {"state":"LOCALIZE","progress":3}'],
  },
  {
    type: "event",
    lines: ['← event: progress', '  data: {"state":"PATCH","progress":4}'],
  },
  {
    type: "event",
    lines: ['← event: progress', '  data: {"state":"VERIFY","progress":5}'],
  },
  {
    type: "event",
    lines: ['← event: progress', '  data: {"state":"VERIFIED","progress":6}'],
  },
];

function MCPProtocolStream({ isRunning }: MCPProtocolStreamProps) {
  const [visibleMessages, setVisibleMessages] = useState<ProtocolMessage[]>([]);
  const streamEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    setVisibleMessages([]);
    let messageIndex = 0;

    const interval = window.setInterval(() => {
      if (messageIndex >= streamMessages.length) {
        window.clearInterval(interval);
        return;
      }

      const message = streamMessages[messageIndex];
      setVisibleMessages((messages) => [
        ...messages,
        {
          ...message,
          lines: message?.lines || [],
        },
      ]);
      messageIndex += 1;
    }, 300);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages]);

  return (
    <section className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 backdrop-blur-xl">
      <header className="mb-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              isRunning
                ? "animate-pulse bg-emerald-400"
                : "bg-slate-600"
            }`}
          />
          <h2 className="font-display truncate text-sm font-semibold text-white">
            MCP Protocol Stream
          </h2>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-[9px] text-slate-500">
          Streamable HTTP · spec 2025-11-25
        </span>
      </header>

      <div
        className={`max-h-[200px] overflow-y-auto rounded-lg border border-white/[0.06] bg-slate-950/70 p-3 font-mono text-[10px] leading-5 ${
          isRunning ? "text-slate-300" : "text-slate-600"
        }`}
        aria-live="polite"
        aria-label="MCP protocol messages"
      >
        {visibleMessages.length === 0 ? (
          <p>{isRunning ? "Opening MCP stream..." : "No active stream."}</p>
        ) : (
          visibleMessages.map((message, messageIndex) => (
            <div className="mb-2 last:mb-0" key={`${message.type}-${messageIndex}`}>
              {(message.lines || []).map((line, lineIndex) => {
                const isRequest = line.startsWith("→ POST");
                const isResponse = line.startsWith("← 200");
                const isData = line.trimStart().startsWith("data:");

                return (
                  <div
                    className={
                      isRequest
                        ? "text-cyan-400"
                        : isResponse
                          ? "text-emerald-400"
                          : isData
                            ? "text-slate-400"
                            : undefined
                    }
                    key={`${messageIndex}-${lineIndex}`}
                  >
                    {line}
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={streamEndRef} />
      </div>
    </section>
  );
}

export default MCPProtocolStream;
