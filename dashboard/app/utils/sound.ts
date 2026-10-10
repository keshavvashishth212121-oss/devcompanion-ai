export function playSuccessChime() {
  if (typeof window === "undefined") return;

  try {
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();

    const playNote = (
      frequency: number,
      startTime: number,
      duration: number,
      volume: number,
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
      gain.gain.setValueAtTime(volume, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    };

    const now = ctx.currentTime + 0.02;
    playNote(523.25, now, 0.35, 0.35);
    playNote(659.25, now + 0.15, 0.4, 0.35);
    playNote(783.99, now + 0.3, 0.6, 0.4);

    setTimeout(() => ctx.close(), 2000);
  } catch (e) {
    console.error("Chime failed:", e);
  }
}
