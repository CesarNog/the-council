const PROFILES = {
  founder:     { rate: 1.15, pitch: 1.1 },
  billionaire: { rate: 0.85, pitch: 0.8 },
  artist:      { rate: 0.95, pitch: 1.15 },
  athlete:     { rate: 1.25, pitch: 1.0 },
  monk:        { rate: 0.72, pitch: 0.9 },
  scientist:   { rate: 1.0, pitch: 1.0 },
  explorer:    { rate: 1.1, pitch: 1.05 },
  romantic:    { rate: 0.9, pitch: 1.1 },
  shadow:      { rate: 0.82, pitch: 0.72 },
};

// Always show speak buttons — Gemini TTS works regardless of Web Speech API support.
export const voiceSupported = typeof window !== "undefined";

const webSpeechAvailable = typeof window !== "undefined" && "speechSynthesis" in window;

let currentController = null;
let currentAudio = null;

export async function speak(text, personaId, { onStart, onEnd, lang } = {}) {
  stopSpeaking();

  const controller = new AbortController();
  currentController = controller;

  // Optimistically signal start so the UI reflects the in-flight request immediately.
  onStart?.();

  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, persona: personaId }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`tts ${res.status}`);

    const blob = await res.blob();
    if (controller.signal.aborted) return;

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => { URL.revokeObjectURL(url); currentAudio = null; onEnd?.(); };
    audio.onerror = () => { URL.revokeObjectURL(url); currentAudio = null; onEnd?.(); };
    await audio.play();
  } catch (e) {
    if (e.name === "AbortError") return;

    // Gemini TTS unavailable — fall back to Web Speech API.
    if (!webSpeechAvailable) { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const profile = PROFILES[personaId] || { rate: 1, pitch: 1 };
    u.rate = profile.rate;
    u.pitch = profile.pitch;
    if (lang) u.lang = lang;
    u.onend = () => onEnd?.();
    u.onerror = () => onEnd?.();
    window.speechSynthesis.speak(u);
  }
}

export function stopSpeaking() {
  currentController?.abort();
  currentController = null;
  if (currentAudio) { currentAudio.pause(); currentAudio.src = ""; currentAudio = null; }
  if (webSpeechAvailable) window.speechSynthesis.cancel();
}
