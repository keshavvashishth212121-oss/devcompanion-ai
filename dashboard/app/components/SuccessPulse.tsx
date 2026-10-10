"use client";

import { useEffect, useState } from "react";

interface SuccessPulseProps {
  trigger: boolean;
}

function SuccessPulse({ trigger }: SuccessPulseProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!trigger) {
      return;
    }

    setIsVisible(true);
    const timeout = window.setTimeout(() => setIsVisible(false), 2500);

    return () => window.clearTimeout(timeout);
  }, [trigger]);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes success-pulse-fade {
          0% { opacity: 0; }
          24% { opacity: 1; }
          100% { opacity: 0; }
        }

        @keyframes success-pulse-ring {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(0); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(4); }
        }
      `}</style>
      <div
        className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
        style={{
          boxShadow:
            "inset 0 0 200px rgba(16, 185, 129, 0.25)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.35), transparent 70%)",
            animation: "success-pulse-fade 2.5s ease-in-out forwards",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-24 w-24 rounded-full"
          style={{
            border: "3px solid rgba(16, 185, 129, 0.7)",
            animation: "success-pulse-ring 1.8s ease-out forwards",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-24 w-24 rounded-full"
          style={{
            border: "3px solid rgba(16, 185, 129, 0.7)",
            animation: "success-pulse-ring 1.8s ease-out 0.3s forwards",
          }}
        />
      </div>
    </>
  );
}

export default SuccessPulse;