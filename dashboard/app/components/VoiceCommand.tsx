"use client";

import { useEffect, useRef, useState } from "react";

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface VoiceCommandProps {
  onCommand: (transcript: string) => void;
  disabled: boolean;
  currentState: string;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

let cachedVoice: SpeechSynthesisVoice | null = null;

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  if (typeof window === "undefined" || !window.speechSynthesis) return null;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  cachedVoice =
    voices.find((voice) => {
      const name = voice.name.toLowerCase();
      return (
        name.includes("david") ||
        name.includes("mark") ||
        name.includes("guy") ||
        name.includes("male")
      );
    }) ||
    voices.find((voice) => voice.name.includes("Google UK English Male")) ||
    voices.find((voice) => voice.name.includes("Google US English")) ||
    voices.find((voice) => voice.name.includes("Microsoft Aria")) ||
    voices.find((voice) => voice.lang === "en-US") ||
    voices[0];
  return cachedVoice;
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null;
    pickVoice();
  };
}

export async function speak(text: string): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  if (!text || !text.trim()) return;

  window.speechSynthesis.cancel();

  return new Promise((resolve) => {
    let resolved = false;
    let fallbackTimer: ReturnType<typeof setTimeout>;
    const done = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(fallbackTimer);
      resolve();
    };

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = pickVoice();
      if (voice) utterance.voice = voice;
      utterance.rate = 1.0;
      utterance.pitch = 0.8;
      utterance.volume = 1.0;
      utterance.lang = "en-US";
      utterance.onend = done;
      utterance.onerror = done;

      fallbackTimer = setTimeout(
        done,
        Math.max(3000, text.length * 100),
      );
      window.speechSynthesis.speak(utterance);
    }, 200);
  });
}

function VoiceCommand({
  onCommand,
  disabled,
  currentState,
}: VoiceCommandProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && Boolean(window.webkitSpeechRecognition));
  }, []);

  useEffect(
    () => () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    },
    [],
  );

  function startListening() {
    if (disabled || isListening || !window.webkitSpeechRecognition) {
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const nextTranscript = event.results[0]?.[0]?.transcript.trim() ?? "";
      if (nextTranscript) {
        setTranscript(nextTranscript);
        onCommand(nextTranscript);
      }
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    setTranscript("");
    setIsListening(true);
    recognition.start();
  }

  function submitFallbackCommand(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const command = transcript.trim();
    if (command) {
      onCommand(command);
      setTranscript("");
    }
  }

  const buttonLabel = isSpeaking
    ? "Speaking..."
    : isListening
      ? "Listening..."
      : "Tap to speak";
  const buttonStyle = isSpeaking
    ? "bg-gradient-to-br from-emerald-500 to-green-700 animate-pulse"
    : isListening
      ? "bg-gradient-to-br from-amber-400 to-orange-600 animate-pulse"
      : "bg-gradient-to-br from-blue-700 to-slate-900";

  return (
    <section className="flex flex-col items-center text-center text-slate-100">
      {supported ? (
        <button
          type="button"
          onClick={startListening}
          disabled={disabled || isListening || isSpeaking}
          aria-label={buttonLabel}
          className={`relative flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full text-white shadow-xl transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70 ${buttonStyle}`}
        >
          {isListening && (
            <>
              <span className="absolute inset-[-10px] rounded-full border border-amber-400/50 animate-ping" />
              <span className="absolute inset-[-4px] rounded-full border border-orange-300/40" />
            </>
          )}
          <svg
            className="relative z-10 mb-1 h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" />
          </svg>
          <span className="relative z-10 text-xs font-semibold">{buttonLabel}</span>
        </button>
      ) : (
        <form onSubmit={submitFallbackCommand} className="w-full max-w-sm">
          <label htmlFor="voice-command-fallback" className="sr-only">
            Type a command
          </label>
          <input
            id="voice-command-fallback"
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            placeholder="Type a command and press Enter"
            disabled={disabled}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60"
          />
          <p className="mt-2 text-xs text-slate-500">
            Voice input is not supported in this browser.
          </p>
        </form>
      )}
      <p className="mt-4 text-sm text-slate-400">
        Say: &quot;Fix the addNumbers bug&quot;
      </p>
      <p className="mt-1 text-xs text-slate-500">Current state: {currentState}</p>
    </section>
  );
}

export default VoiceCommand;