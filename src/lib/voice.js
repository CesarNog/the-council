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

export const voiceSupported = typeof window !== "undefined" && "speechSynthesis" in window;

let currentUtterance = null;

export function speak(text, personaId, { onStart, onEnd } = {}) {
  if (!voiceSupported) return;
  window.speechSynthesis.cancel(); // uma fala por vez — corta a anterior se ainda estiver rodando
  const u = new SpeechSynthesisUtterance(text);
  const profile = PROFILES[personaId] || { rate: 1, pitch: 1 };
  u.rate = profile.rate;
  u.pitch = profile.pitch;
  u.onstart = () => onStart?.();
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.(); // fala falhou (voz indisponivel etc) — nao trava o estado visual
  currentUtterance = u;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (voiceSupported) window.speechSynthesis.cancel();
  currentUtterance = null;
}
