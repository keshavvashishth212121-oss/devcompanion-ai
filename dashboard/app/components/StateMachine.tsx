import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

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

interface StateMachineProps {
  currentState: State;
  stateHistory: string[];
}

const nodes: Array<{ state: State; x: number; y: number }> = [
  { state: "INTAKE", x: 80, y: 80 },
  { state: "REPRODUCE", x: 240, y: 80 },
  { state: "LOCALIZE", x: 400, y: 80 },
  { state: "PATCH", x: 560, y: 80 },
  { state: "VERIFY", x: 240, y: 220 },
  { state: "CRITIQUE", x: 400, y: 220 },
  { state: "VERIFIED", x: 560, y: 220 },
  { state: "DIAGNOSE", x: 240, y: 340 },
  { state: "ESCALATE", x: 480, y: 340 },
];

const nodeByState = Object.fromEntries(
  nodes.map((node) => [node.state, node]),
) as Record<State, (typeof nodes)[number]>;

const transitions: Array<[State, State]> = [
  ["INTAKE", "REPRODUCE"],
  ["REPRODUCE", "LOCALIZE"],
  ["LOCALIZE", "PATCH"],
  ["PATCH", "VERIFY"],
  ["VERIFY", "CRITIQUE"],
  ["CRITIQUE", "VERIFIED"],
  ["DIAGNOSE", "REPRODUCE"],
  ["DIAGNOSE", "ESCALATE"],
];

const failureTransitions: Array<[State, State]> = [
  ["PATCH", "DIAGNOSE"],
  ["VERIFY", "DIAGNOSE"],
  ["CRITIQUE", "DIAGNOSE"],
];

function edgePath(from: State, to: State): string {
  const source = nodeByState[from];
  const target = nodeByState[to];
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const startX = source.x + (dx / length) * 34;
  const startY = source.y + (dy / length) * 34;
  const endX = target.x - (dx / length) * 34;
  const endY = target.y - (dy / length) * 34;

  return `M ${startX} ${startY} L ${endX} ${endY}`;
}

function StateMachine({ currentState, stateHistory }: StateMachineProps) {
  const previousStateRef = useRef<State>(currentState);
  const previousState = previousStateRef.current;

  useEffect(() => {
    previousStateRef.current = currentState;
  }, [currentState]);

  return (
    <section className="w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-100 shadow-lg">
      <h2 className="mb-3 text-lg font-semibold tracking-tight">
        State machine
      </h2>
      <svg
        className="h-[400px] w-full"
        viewBox="0 0 640 400"
        role="img"
        aria-labelledby="state-machine-title state-machine-description"
      >
        <title id="state-machine-title">DevCompanion fix state machine</title>
        <desc id="state-machine-description">
          Current state is {currentState}. Completed states are shown in green.
        </desc>
        <defs>
          <marker
            id="state-machine-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M 0 0 L 8 4 L 0 8 z" fill="#64748b" />
          </marker>
          <marker
            id="state-machine-failure-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M 0 0 L 8 4 L 0 8 z" fill="#f97316" />
          </marker>
        </defs>

        <g
          fill="none"
          stroke="#64748b"
          strokeWidth="2"
          markerEnd="url(#state-machine-arrow)"
        >
          {transitions.map(([from, to]) => (
            <path key={`${from}-${to}`} d={edgePath(from, to)} />
          ))}
        </g>
        <g
          fill="none"
          stroke="#f97316"
          strokeDasharray="6 5"
          strokeWidth="2"
          markerEnd="url(#state-machine-failure-arrow)"
        >
          {failureTransitions.map(([from, to]) => (
            <path key={`${from}-${to}`} d={edgePath(from, to)} />
          ))}
        </g>

        {nodes.map(({ state, x, y }) => {
          const isCurrent = state === currentState;
          const isCompleted = stateHistory.includes(state);
          const fill = isCurrent
            ? "#f59e0b"
            : isCompleted
              ? "#064e3b"
              : "#1e293b";
          const stroke = isCurrent
            ? "#fbbf24"
            : isCompleted
              ? "#10b981"
              : "#475569";
          const text = isCurrent
            ? "#000000"
            : isCompleted
              ? "#6ee7b7"
              : "#94a3b8";

          return (
            <g
              key={state}
              className={isCurrent ? "animate-pulse" : undefined}
            >
              <circle cx={x} cy={y} r="32" fill={fill} stroke={stroke} strokeWidth="2" />
              <text
                x={x}
                y={y}
                fill={text}
                fontSize="11"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {state}
              </text>
            </g>
          );
        })}

        <motion.circle
          cx={nodeByState[previousState].x}
          cy={nodeByState[previousState].y}
          r="6"
          fill="#34d399"
          filter="drop-shadow(0 0 6px #34d399)"
          animate={{
            cx: nodeByState[currentState].x,
            cy: nodeByState[currentState].y,
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </svg>
    </section>
  );
}

export default StateMachine;