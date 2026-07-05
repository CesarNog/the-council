import { byId } from "./personas.js";

export async function summonCouncil(question, profile, language) {
  const res = await fetch("/api/council", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, profile, language }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error("council unreachable");
    err.kind = res.status === 429 ? "rate_limited" : "unreachable";
    if (body.retryAfter) err.retryAfter = body.retryAfter;
    throw err;
  }
  const json = await res.json();
  if (!Array.isArray(json.turns) || !Array.isArray(json.votes) || !json.verdict) throw new Error("bad shape");
  json.turns = json.turns.filter(t => byId[t.p] && t.t);
  json.votes = json.votes.filter(v => byId[v.p]);
  return json;
}

export const DEMO_Q = "Should I quit my job and start something of my own?";

export const FALLBACK = {
  mood: "tense",
  quote: "Staying is just fear wearing a salary.",
  turns: [
    { p: "founder",     t: "Quit. Every month you stay, you're paying tuition for a school you already graduated from." },
    { p: "scientist",   t: "Base rates, Founder: most new ventures die within five years. What's the runway — twelve months of savings? Six?" },
    { p: "billionaire", t: "The Scientist is right about the odds and wrong about the frame. The venture doesn't need to work. You need to survive long enough to get lucky." },
    { p: "monk",        t: "Before you leave the job — can you sit quietly with why you want to leave it?" },
    { p: "shadow",      t: "I'll say it: you don't hate the job. You hate that nobody claps for you there anymore." },
    { p: "artist",      t: "Ouch, Shadow. But hear this — a life written in someone else's font is still someone else's story." },
    { p: "athlete",     t: "Talk is cheap. Have you ever shipped anything at 6 a.m. before work? Quitting won't install discipline. Reps first." },
    { p: "explorer",    t: "The Athlete makes it sound like a prison sentence. Build the smallest real version this month — you can't map a coastline from the harbor." },
    { p: "romantic",    t: "No one has asked who else lives inside this decision. What will your people carry while you 'find yourself'?" },
    { p: "founder",     t: "Romantic, safety is also a cost. It just bills your future instead of your present." },
    { p: "scientist",   t: "Then run the experiment cheaply: one paying customer before you resign. Evidence, not vibes." },
    { p: "monk",        t: "Perhaps the answer is not quit or stay. It is: stop hiding inside either one." },
  ],
  votes: [
    { p: "founder",     v: "yes",     r: "Asymmetric upside. You're young in decision-years." },
    { p: "billionaire", v: "depends", r: "Yes — the day your runway reaches twelve months." },
    { p: "artist",      v: "yes",     r: "You're dimming. I can hear it from here." },
    { p: "athlete",     v: "no",      r: "Earn it first. Build before you leap." },
    { p: "monk",        v: "depends", r: "The question itself isn't ripe yet." },
    { p: "scientist",   v: "no",      r: "No evidence yet. Get one paying customer." },
    { p: "explorer",    v: "yes",     r: "Regret compounds faster than savings." },
    { p: "romantic",    v: "depends", r: "Only with the people you love on board." },
    { p: "shadow",      v: "yes",     r: "Staying is just fear wearing a salary." },
  ],
  verdict: "The Council leans toward leaving — but not tonight. Build the smallest real version while employed, secure your runway and one paying customer, and bring the people you love into the plan before you sign anything.",
  question: "What would you build first if you knew no one would ever clap?",
  realities: [
    { label: "The Safe Path", line: "You stay another year, get the promotion, and wonder every Sunday night what you didn't try." },
    { label: "The Side Door", line: "You build it nights and weekends for six months before ever quitting anything." },
    { label: "The Leap", line: "You quit Friday, panic Monday, and either build something real or learn exactly why the job made sense." },
  ],
};
