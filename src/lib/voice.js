const PROFILES = {
  founder:     { rate: 1.15, pitch: 1.1,  gender: "male" },
  billionaire: { rate: 0.85, pitch: 0.8,  gender: "male" },
  artist:      { rate: 0.95, pitch: 1.15, gender: "female" },
  athlete:     { rate: 1.25, pitch: 1.0,  gender: "male" },
  monk:        { rate: 0.72, pitch: 0.9,  gender: "female" },
  scientist:   { rate: 1.0,  pitch: 1.0,  gender: "female" },
  explorer:    { rate: 1.1,  pitch: 1.05, gender: "male" },
  romantic:    { rate: 0.9,  pitch: 1.1,  gender: "female" },
  shadow:      { rate: 0.82, pitch: 0.72, gender: "male" },
};

// Always show speak buttons — Gemini TTS works regardless of Web Speech API support.
export const voiceSupported = typeof window !== "undefined";

const webSpeechAvailable = typeof window !== "undefined" && "speechSynthesis" in window;

// Best-effort: system voice names aren't a standardized gender API, but most
// platforms ship voices with gender-indicative names (Google/Microsoft/Apple
// all do this consistently enough to be worth trying) — falls back to the
// browser's default voice for that language if nothing matches.
const FEMALE_VOICE_HINTS = ["female", "woman", "zira", "samantha", "victoria", "susan", "karen", "moira", "tessa", "fiona", "kathy"];
const MALE_VOICE_HINTS = ["male", "man", "david", "daniel", "alex", "fred", "george", "james", "oliver", "aaron", "gordon"];

function pickVoiceForGender(gender, lang) {
  if (!webSpeechAvailable) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices?.length) return null;
  const hints = gender === "female" ? FEMALE_VOICE_HINTS : MALE_VOICE_HINTS;
  const langPrefix = (lang || "").split("-")[0].toLowerCase();
  const matchesLang = (v) => !langPrefix || v.lang?.toLowerCase().startsWith(langPrefix);
  const byHint = voices.find(v => matchesLang(v) && hints.some(h => v.name.toLowerCase().includes(h)));
  if (byHint) return byHint;
  // no gendered match for this language — better to use any voice in the right
  // language than force a wrong-language voice just to satisfy gender
  return voices.find(matchesLang) || null;
}

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
    const profile = PROFILES[personaId] || { rate: 1, pitch: 1, gender: "male" };
    u.rate = profile.rate;
    u.pitch = profile.pitch;
    if (lang) u.lang = lang;
    const voice = pickVoiceForGender(profile.gender, lang);
    if (voice) u.voice = voice;
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
