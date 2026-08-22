import { useCallback, useEffect, useRef } from "react";

type SoundKind = "reservation" | "accepted" | "incomingTrip" | "call";

type Tone = { frequency: number; start: number; duration: number; gain: number; type?: OscillatorType };

const PATTERNS: Record<SoundKind, Tone[]> = {
  reservation: [
    { frequency: 523.25, start: 0, duration: 0.16, gain: 0.2 },
    { frequency: 659.25, start: 0.16, duration: 0.19, gain: 0.22 },
    { frequency: 783.99, start: 0.35, duration: 0.28, gain: 0.24 },
  ],
  accepted: [
    { frequency: 587.33, start: 0, duration: 0.15, gain: 0.2 },
    { frequency: 739.99, start: 0.14, duration: 0.18, gain: 0.24 },
    { frequency: 987.77, start: 0.3, duration: 0.3, gain: 0.22 },
  ],
  incomingTrip: [
    { frequency: 880, start: 0, duration: 0.22, gain: 0.38, type: "square" },
    { frequency: 1046.5, start: 0.26, duration: 0.22, gain: 0.36, type: "square" },
    { frequency: 880, start: 0.58, duration: 0.24, gain: 0.38, type: "square" },
  ],
  call: [
    { frequency: 440, start: 0, duration: 0.46, gain: 0.17, type: "sine" },
    { frequency: 480, start: 0, duration: 0.46, gain: 0.17, type: "sine" },
  ],
};

export function useInteractionSounds() {
  const contextRef = useRef<AudioContext | null>(null);
  const callTimerRef = useRef<ReturnType<typeof window.setInterval> | null>(null);
  const tripAlertTimerRef = useRef<ReturnType<typeof window.setInterval> | null>(null);

  const getContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!contextRef.current) {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return null;
      contextRef.current = new AudioContextClass();
    }
    if (contextRef.current.state === "suspended") void contextRef.current.resume();
    return contextRef.current;
  }, []);

  const play = useCallback((kind: SoundKind) => {
    const context = getContext();
    if (!context) return;
    const now = context.currentTime;
    PATTERNS[kind].forEach(note => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = note.type || "sine";
      oscillator.frequency.setValueAtTime(note.frequency, now + note.start);
      gain.gain.setValueAtTime(0.0001, now + note.start);
      gain.gain.linearRampToValueAtTime(note.gain, now + note.start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now + note.start);
      oscillator.stop(now + note.start + note.duration + 0.03);
    });
  }, [getContext]);

  const stopCallTone = useCallback(() => {
    if (callTimerRef.current) window.clearInterval(callTimerRef.current);
    callTimerRef.current = null;
  }, []);

  const startCallTone = useCallback(() => {
    stopCallTone();
    play("call");
    callTimerRef.current = window.setInterval(() => play("call"), 2300);
  }, [play, stopCallTone]);

  const stopIncomingTripAlert = useCallback(() => {
    if (tripAlertTimerRef.current) window.clearInterval(tripAlertTimerRef.current);
    tripAlertTimerRef.current = null;
  }, []);

  const startIncomingTripAlert = useCallback((repeatEveryMs: number = 10000) => {
    stopIncomingTripAlert();
    play("incomingTrip");
    tripAlertTimerRef.current = window.setInterval(
      () => play("incomingTrip"),
      Math.max(5_000, repeatEveryMs)
    );
  }, [play, stopIncomingTripAlert]);

  useEffect(() => () => {
    stopCallTone();
    stopIncomingTripAlert();
    contextRef.current?.close().catch(() => {});
  }, [stopCallTone, stopIncomingTripAlert]);

  return {
    unlockAudio: getContext,
    playReservationConfirmed: () => play("reservation"),
    playTripAccepted: () => play("accepted"),
    startCallTone,
    stopCallTone,
    startIncomingTripAlert,
    stopIncomingTripAlert,
  };
}
