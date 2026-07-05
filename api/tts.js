// Persona → Gemini prebuilt voice mapping
const VOICES = {
  founder:     "Orus",
  billionaire: "Charon",
  artist:      "Aoede",
  athlete:     "Fenrir",
  monk:        "Kore",
  scientist:   "Zephyr",
  explorer:    "Puck",
  romantic:    "Leda",
  shadow:      "Schedar",
};

// Wraps raw PCM (linear16) in a RIFF WAV container so browsers can play it.
function pcmToWav(pcmBuf, sampleRate = 24000) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuf.byteLength;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);          // PCM format
  buf.writeUInt16LE(numChannels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(byteRate, 28);
  buf.writeUInt16LE(blockAlign, 32);
  buf.writeUInt16LE(bitsPerSample, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);
  Buffer.from(pcmBuf).copy(buf, 44);
  return buf;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const apiKey = process.env.GEMINI_TTS_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "TTS not configured" });

  const { text, persona } = req.body || {};
  if (!text) return res.status(400).json({ error: "text required" });

  const voice = VOICES[persona] || "Aoede";

  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
          },
        },
      }),
    }
  );

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    return res.status(502).json({ error: "Gemini TTS failed", detail });
  }

  const json = await upstream.json();
  const part = json.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  if (!part?.data) return res.status(502).json({ error: "no audio in response" });

  const rateMatch = (part.mimeType || "").match(/rate=(\d+)/);
  const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;

  const wav = pcmToWav(Buffer.from(part.data, "base64"), sampleRate);
  res.setHeader("Content-Type", "audio/wav");
  res.setHeader("Cache-Control", "no-store");
  res.end(wav);
}
