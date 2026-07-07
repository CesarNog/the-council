// Persona → OpenAI voice mapping (gpt-4o-mini-tts voices)
const OPENAI_VOICES = {
  founder:     "onyx",    // authoritative, deep
  billionaire: "ash",     // confident, measured
  artist:      "nova",    // expressive, warm
  athlete:     "echo",    // energetic, clear
  monk:        "fable",   // calm, wise
  scientist:   "alloy",   // neutral, precise
  explorer:    "verse",   // curious, adventurous
  romantic:    "coral",   // intimate, warm
  shadow:      "ballad",  // low, mysterious
};

// Persona → Gemini prebuilt voice mapping (fallback)
const GEMINI_VOICES = {
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

const TTS_TIMEOUT_MS = 10000;

function withTimeout(ms) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(id) };
}

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
  buf.writeUInt16LE(1, 20);
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

async function openaiTts(text, persona, apiKey) {
  const voice = OPENAI_VOICES[persona] || "alloy";
  const { signal, clear } = withTimeout(TTS_TIMEOUT_MS);
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini-tts",
      input: text,
      voice,
      response_format: "mp3",
    }),
    signal,
  });
  clear();
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`OpenAI TTS ${res.status}: ${detail}`);
  }
  return { buffer: Buffer.from(await res.arrayBuffer()), contentType: "audio/mpeg" };
}

async function geminiTts(text, persona, apiKey) {
  const voice = GEMINI_VOICES[persona] || "Aoede";
  const { signal, clear } = withTimeout(TTS_TIMEOUT_MS);
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-tts:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
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
  clear();
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini TTS ${res.status}: ${detail}`);
  }
  const json = await res.json();
  const part = json.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  if (!part?.data) throw new Error("no audio in Gemini response");
  const rateMatch = (part.mimeType || "").match(/rate=(\d+)/);
  const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
  return { buffer: pcmToWav(Buffer.from(part.data, "base64"), sampleRate), contentType: "audio/wav" };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_TTS_API_KEY;
  if (!openaiKey && !geminiKey) return res.status(503).json({ error: "TTS not configured" });

  const { text, persona } = req.body || {};
  if (!text) return res.status(400).json({ error: "text required" });

  try {
    const result = openaiKey
      ? await openaiTts(text, persona, openaiKey)
      : await geminiTts(text, persona, geminiKey);

    res.setHeader("Content-Type", result.contentType);
    res.setHeader("Cache-Control", "no-store");
    res.end(result.buffer);
  } catch (e) {
    // If OpenAI failed and Gemini key exists, try Gemini as fallback
    if (openaiKey && geminiKey) {
      try {
        const result = await geminiTts(text, persona, geminiKey);
        res.setHeader("Content-Type", result.contentType);
        res.setHeader("Cache-Control", "no-store");
        res.end(result.buffer);
        return;
      } catch (fallbackErr) {
        console.error("Gemini fallback also failed:", fallbackErr.message);
      }
    }
    res.status(502).json({ error: "TTS failed", detail: e.message });
  }
}
