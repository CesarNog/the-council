import React, { useState, useEffect, useRef, useMemo } from "react";
import { PERSONAS, byId, MOOD_COLORS, INTENSITY, PACE } from "./lib/personas.js";
import { tally, councilHeadline, shareText, downloadShareCard } from "./lib/share.js";
import { summonCouncil, FALLBACK } from "./lib/api.js";
import { QUICK_QUESTIONS } from "./lib/prompts.js";
import { speak, stopSpeaking, voiceSupported } from "./lib/voice.js";

export function Sigil({ id }) {
  const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (id) {
    case "founder":     return <svg viewBox="0 0 24 24"><path {...s} d="M13 2 6.5 13H11l-2 9L18.5 9H13l1.5-7Z"/></svg>;
    case "billionaire": return <svg viewBox="0 0 24 24"><path {...s} d="M12 3 21 20H3L12 3Z"/><path {...s} d="M7.6 14h8.8"/></svg>;
    case "artist":      return <svg viewBox="0 0 24 24"><path {...s} d="M12 12c0-1.2 1.9-1.2 1.9 0 0 2.2-3.8 2.2-3.8 0 0-3.6 5.7-3.6 5.7 0 0 5-8.6 5-8.6 0 0-6.4 11.5-6.4 11.5 0"/></svg>;
    case "athlete":     return <svg viewBox="0 0 24 24"><path {...s} d="M2 16.5h5.5L11 6.5l3.5 13 2-8H22"/></svg>;
    case "monk":        return <svg viewBox="0 0 24 24"><path {...s} d="M18.8 7.2A8.4 8.4 0 1 0 20.4 12"/></svg>;
    case "scientist":   return <svg viewBox="0 0 24 24"><ellipse {...s} cx="12" cy="12" rx="9" ry="3.6" transform="rotate(58 12 12)"/><ellipse {...s} cx="12" cy="12" rx="9" ry="3.6" transform="rotate(-58 12 12)"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>;
    case "explorer":    return <svg viewBox="0 0 24 24"><circle {...s} cx="12" cy="12" r="8.6"/><path {...s} d="M12 6.4 14.4 12 12 17.6 9.6 12Z"/></svg>;
    case "romantic":    return <svg viewBox="0 0 24 24"><circle {...s} cx="9.4" cy="12" r="5.4"/><circle {...s} cx="14.6" cy="12" r="5.4"/></svg>;
    case "shadow":      return <svg viewBox="0 0 24 24"><circle {...s} cx="12" cy="12" r="8.4"/><circle cx="14.8" cy="9.4" r="3.4" fill="currentColor" opacity=".85"/></svg>;
    default:            return null;
  }
}

export function Ring({ active, speaking, mentioned, phase, label }) {
  return (
    <div className="ring-wrap">
      <div className="ring-orbit" />
      <div className="ring-orbit inner" />
      {PERSONAS.map((p, i) => {
        const a = (-90 + i * 40) * Math.PI / 180;
        const cx = 50 + 44 * Math.cos(a), cy = 50 + 44 * Math.sin(a);
        const cls = "node"
          + (active === p.id ? " active" : " breathing")
          + (speaking === p.id ? " speaking-voice" : "")
          + (mentioned?.has(p.id) && active !== p.id ? " mentioned" : "");
        return (
          <div key={p.id} className={cls} role="img" aria-label={p.name} style={{ left: `${cx}%`, top: `${cy}%`, color: p.color, "--intensity": INTENSITY[p.id] }}>
            <Sigil id={p.id} />
            <span className="tip" style={{ color: p.color }}>{p.name.replace("The ", "")}</span>
          </div>
        );
      })}
      <div className="ring-center">
        <span className={"glyph" + (phase === "summoning" ? " pulse" : "")}>⚖</span>
        {label && <span className="eyebrow" style={{ fontSize: 9, opacity: .8 }}>{label}</span>}
      </div>
    </div>
  );
}

function Whisper() {
  const [i, setI] = useState(0);
  const [vis, setVis] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setVis(false);
      setTimeout(() => { setI(n => (n + 1) % PERSONAS.length); setVis(true); }, 600);
    }, 4200);
    return () => clearInterval(t);
  }, []);
  const p = PERSONAS[i];
  return (
    <div style={{ marginTop: 34, minHeight: 46, transition: "opacity .6s ease", opacity: vis ? 1 : 0 }}>
      <span className="serif" style={{ fontStyle: "italic", fontSize: 17, color: p.color }}>“{p.line}”</span>
      <div className="eyebrow" style={{ marginTop: 8, fontSize: 9, color: "var(--ivory-faint)" }}>— {p.name}</div>
    </div>
  );
}

export function Landing({ onEnter, authSlot }) {
  return (
    <div className="landing">
      <div className="fade-up d1"><Ring /></div>
      <div className="eyebrow fade-up d2" style={{ marginTop: 40 }}>The Council</div>
      <h1 className="fade-up d2">Nine versions of you.<br /><em>One verdict.</em></h1>
      <p className="sub fade-up d3">
        The founder you never became. The monk you almost were. The shadow you keep quiet.
        Bring them one real decision — and listen to them argue about your life.
      </p>
      <button className="btn primary fade-up d4" onClick={onEnter}>Enter the chamber</button>
      {authSlot && <div className="fade-up d4" style={{ marginTop: 18 }}>{authSlot}</div>}
      <div className="fade-up d4"><Whisper /></div>
    </div>
  );
}

const VALUES = ["Freedom", "Security", "Meaning", "Ambition", "Love", "Peace", "Truth", "Adventure"];

export function Onboarding({ onDone, initial }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initial?.name || "");
  const [situation, setSituation] = useState(initial?.situation || "");
  const [values, setValues] = useState(initial?.values || []);

  const toggle = v => setValues(cur =>
    cur.includes(v) ? cur.filter(x => x !== v) : cur.length < 3 ? [...cur, v] : cur);

  const next = () => step < 2 ? setStep(step + 1) : onDone({ name: name.trim(), situation: situation.trim(), values });
  const onKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); next(); } };

  return (
    <div className="onb">
      <div className="progress">{[0, 1, 2].map(i => <i key={i} className={i <= step ? "on" : ""} />)}</div>
      {step === 0 && (
        <div className="onb-step" key="s0">
          <div className="eyebrow">Rite of entry · I</div>
          <h2>What shall the Council call you?</h2>
          <p className="hint">A first name is enough. They already know the rest.</p>
          <input type="text" autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={onKey} placeholder="Your name" />
          <div style={{ marginTop: 44 }}>
            <button className="btn" onClick={next} disabled={!name.trim()}>Continue</button>
          </div>
        </div>
      )}
      {step === 1 && (
        <div className="onb-step" key="s1">
          <div className="eyebrow">Rite of entry · II</div>
          <h2>Where do you stand right now?</h2>
          <p className="hint">One honest line. They can smell a rehearsed answer.</p>
          <textarea rows={2} autoFocus value={situation} onChange={e => setSituation(e.target.value)} onKeyDown={onKey}
            placeholder="e.g. Product manager, 31, restless" />
          <div style={{ marginTop: 44 }}>
            <button className="btn" onClick={next} disabled={!situation.trim()}>Continue</button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="onb-step" key="s2">
          <div className="eyebrow">Rite of entry · III</div>
          <h2>What do you protect above all?</h2>
          <p className="hint">Choose up to three. The Council will remember.</p>
          <div className="chips">
            {VALUES.map(v => (
              <button key={v} className={"chip" + (values.includes(v) ? " on" : "")} onClick={() => toggle(v)}>{v}</button>
            ))}
          </div>
          <div style={{ marginTop: 44 }}>
            <button className="btn primary" onClick={next} disabled={values.length === 0}>Convene the Council</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 4 20 4 20 11" /><path d="M20 4 10 14" /><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
    </svg>
  );
}

export function ShareBar({ asked, debate }) {
  const appUrl = debate?.id && typeof window !== "undefined"
    ? `${window.location.origin}/r/${debate.id}`
    : (typeof window !== "undefined" ? window.location.href : "https://the-council-murex.vercel.app");
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const nativeShare = () => {
    navigator.share({ title: "The Council has ruled", text: shareText(asked, debate), url: appUrl }).catch(() => {});
  };

  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(shareText(asked, debate) + "\n\n" + appUrl)}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText(asked, debate, { max: 260 }))}&url=${encodeURIComponent(appUrl)}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}` },
  ];

  return (
    <div className="share-row">
      {canNativeShare && (
        <button className="btn primary share-btn" onClick={nativeShare}><ShareIcon /> Share</button>
      )}
      {links.map(l => (
        <a key={l.label} className="btn share-btn" href={l.href} target="_blank" rel="noopener noreferrer">
          <ShareIcon /> {l.label}
        </a>
      ))}
    </div>
  );
}

export function Chamber({ profile, preloaded, onExit, userSlot, lifeModeSlot }) {
  const [phase, setPhase] = useState("idle"); // idle | summoning | debate | reflecting | voting | verdict | error
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState("");
  const [debate, setDebate] = useState(null);
  const [shown, setShown] = useState(0);
  const [votesShown, setVotesShown] = useState(0);
  const [voiceOn, setVoiceOn] = useState(() => {
    if (!voiceSupported) return false;
    try { return localStorage.getItem("council:voice") !== "off"; } catch { return true; }
  });
  const [speaking, setSpeaking] = useState(null); // persona id falando agora, ou null
  const endRef = useRef(null);

  // visita via /r/:id — pula convene(), entra direto no reveal com o debate ja gerado
  useEffect(() => {
    if (!preloaded) return;
    setAsked(preloaded.question);
    setDebate(preloaded.debate);
    setPhase("debate");
  }, [preloaded]);

  const activeSpeaker = phase === "debate" && debate && shown > 0 && shown <= debate.turns.length
    ? debate.turns[shown - 1].p : null;

  const votingSpeaker = phase === "voting" && debate && votesShown > 0 && votesShown <= debate.votes.length
    ? debate.votes[votesShown - 1].p : null;

  const ringActive = activeSpeaker || votingSpeaker;

  useEffect(() => {
    if (!voiceOn || !activeSpeaker || !debate) return;
    const text = debate.turns[shown - 1].t;
    speak(text, activeSpeaker, { onStart: () => setSpeaking(activeSpeaker), onEnd: () => setSpeaking(null) });
    return () => stopSpeaking();
  }, [activeSpeaker, shown, voiceOn]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase === "idle") stopSpeaking(); // "New question" corta fala pendente
  }, [phase]);

  const toggleVoice = () => {
    setVoiceOn(v => {
      const next = !v;
      try { localStorage.setItem("council:voice", next ? "on" : "off"); } catch {}
      if (!next) stopSpeaking();
      return next;
    });
  };

  const mentionedIds = useMemo(() => {
    if (!activeSpeaker || !debate) return new Set();
    const turnText = (debate.turns[shown - 1]?.t || "").toLowerCase();
    const set = new Set();
    PERSONAS.forEach(p => {
      if (p.id === activeSpeaker) return;
      if (turnText.includes(p.name.replace("The ", "").toLowerCase())) set.add(p.id);
    });
    return set;
  }, [activeSpeaker, shown, debate]);

  // sequential turn reveal
  useEffect(() => {
    if (phase !== "debate" || !debate) return;
    if (shown >= debate.turns.length) {
      const t = setTimeout(() => setPhase("reflecting"), 500);
      return () => clearTimeout(t);
    }
    const turn = debate.turns[shown];
    const paceMult = PACE[turn.p] || 1;
    const delay = shown === 0 ? 700 : Math.min((1000 + turn.t.length * 16) * paceMult, 3400);
    const t = setTimeout(() => setShown(s => s + 1), delay);
    return () => clearTimeout(t);
  }, [phase, shown, debate]);

  // reflection beat — silêncio com peso antes do voto
  useEffect(() => {
    if (phase !== "reflecting") return;
    const t = setTimeout(() => setPhase("voting"), 2200);
    return () => clearTimeout(t);
  }, [phase]);

  // sequential vote reveal
  useEffect(() => {
    if (phase !== "voting" || !debate) return;
    if (votesShown >= debate.votes.length) {
      const t = setTimeout(() => setPhase("verdict"), 1400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVotesShown(v => v + 1), 520);
    return () => clearTimeout(t);
  }, [phase, votesShown, debate]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [shown, votesShown, phase]);

  useEffect(() => stopSpeaking, []); // cleanup ao desmontar

  const convene = async (q) => {
    const qq = (q || question).trim();
    if (!qq) return;
    setAsked(qq); setQuestion("");
    setDebate(null); setShown(0); setVotesShown(0);
    setPhase("summoning");
    try {
      const result = await summonCouncil(qq, profile);
      setDebate(result); setPhase("debate");
    } catch (e) {
      // gateway indisponível: a demo nunca trava — sessão offline com debate canônico
      setDebate({ ...FALLBACK, offline: true });
      setPhase("debate");
    }
  };

  const reset = () => {
    if (onExit) return onExit();
    setPhase("idle"); setAsked(""); setDebate(null); setShown(0); setVotesShown(0);
  };

  const copyText = () => navigator.clipboard?.writeText(shareText(asked, debate));

  const { yes, no, dep } = tally(debate || { votes: [] });

  const ambientColor = ringActive
    ? byId[ringActive].color
    : (debate?.mood && MOOD_COLORS[debate.mood]) || "#C9A96E";

  return (
    <>
      <div className="ambient" style={{
        background: `radial-gradient(50% 42% at 50% 12%, ${ambientColor}14, transparent 70%)`
      }} />
      <div className="chamber">
        <div className="chamber-head">
          <div>
            <div className="eyebrow">The Chamber</div>
            <div className="title serif">{profile?.name ? `In session for ${profile.name}` : "A verdict already reached"}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {userSlot}
            {voiceSupported && (
              <button className="btn small" onClick={toggleVoice} title={voiceOn ? "Mute voices" : "Unmute voices"}>
                {voiceOn ? "🔊" : "🔇"}
              </button>
            )}
            {phase !== "idle" && <button className="btn small" onClick={reset}>New question</button>}
          </div>
        </div>

        <Ring
          active={ringActive}
          speaking={speaking}
          mentioned={mentionedIds}
          phase={phase}
          label={phase === "summoning" ? "deliberating" : phase === "reflecting" ? "reflecting" : phase === "voting" ? "voting" : phase === "verdict" ? "adjourned" : null}
        />

        {phase === "idle" && lifeModeSlot}

        {phase === "idle" && (
          <div className="ask">
            <div className="eyebrow" style={{ marginBottom: 18 }}>Bring your question before the Council</div>
            <textarea rows={2} value={question} onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); convene(); } }}
              placeholder="Should I…" autoFocus />
            <div style={{ marginTop: 30 }}>
              <button className="btn primary" onClick={() => convene()} disabled={!question.trim()}>Convene the Council</button>
            </div>
            <div className="quick-questions">
              {QUICK_QUESTIONS.map(q => (
                <button key={q} className="chip" onClick={() => convene(q)}>{q}</button>
              ))}
            </div>
          </div>
        )}

        {phase !== "idle" && asked && (
          <div className="question-banner" style={{ marginTop: 30 }}>
            <div className="eyebrow">{debate?.offline ? "Offline demo · sample debate, not about your question" : "The matter before the Council"}</div>
            <div className="q">“{asked}”</div>
          </div>
        )}

        {phase === "summoning" && (
          <div className="speaking" style={{ justifyContent: "center" }}>
            <span className="dots"><i /><i /><i /></span>
            The nine take their seats
          </div>
        )}

        {debate && (phase === "debate" || phase === "reflecting" || phase === "voting" || phase === "verdict") && (
          <div className="feed" aria-live="polite" aria-atomic="false">
            {debate.turns.slice(0, shown).map((t, i) => {
              const p = byId[t.p];
              return (
                <div className="turn" key={i} style={{ color: p.color }}>
                  <div className="sig"><Sigil id={p.id} /></div>
                  <div>
                    <div className="who" style={{ color: p.color }}>{p.name} <span style={{ color: "var(--ivory-faint)", letterSpacing: ".12em" }}>· {p.tag}</span></div>
                    <div className="txt">{t.t}</div>
                  </div>
                </div>
              );
            })}
            {phase === "debate" && shown < debate.turns.length && (
              <div className="speaking" role="status" style={{ color: byId[debate.turns[shown].p].color }}>
                <span className="dots"><i /><i /><i /></span>
                {byId[debate.turns[shown].p].name} is speaking
              </div>
            )}
            {phase === "reflecting" && (
              <div className="reflection">The chamber falls quiet. Nine minds, weighing.</div>
            )}
          </div>
        )}

        {debate && (phase === "voting" || phase === "verdict") && (
          <>
            <div className="vote-title">
              <div className="eyebrow">Deliberation closed</div>
              <h3 className="serif">The Council votes</h3>
            </div>
            <div className="votes">
              {debate.votes.slice(0, votesShown).map((v, i) => {
                const p = byId[v.p];
                const cls = v.v === "yes" ? "yes" : v.v === "no" ? "no" : "dep";
                const label = v.v === "yes" ? "Yes" : v.v === "no" ? "No" : "It depends";
                return (
                  <div className="vote" key={i} style={{ color: p.color, animationDelay: `${i * .04}s` }}>
                    <div className="sig"><Sigil id={p.id} /></div>
                    <div className="nm" style={{ color: p.color }}>{p.name.replace("The ", "")}</div>
                    <div className={"vv " + cls}>{label}</div>
                    <div className="rr">{v.r}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {debate && phase === "verdict" && (
          <>
            <div className="tally">
              <i style={{ width: `${(yes / debate.votes.length) * 100}%`, background: "#D8C08A" }} />
              <i style={{ width: `${(dep / debate.votes.length) * 100}%`, background: "rgba(237,232,222,.28)" }} />
              <i style={{ width: `${(no / debate.votes.length) * 100}%`, background: "rgba(237,232,222,.1)" }} />
            </div>
            <div className="tally-labels">
              <span style={{ color: "#D8C08A" }}>Yes {yes}</span>
              <span>Depends {dep}</span>
              <span>No {no}</span>
            </div>

            <div className="verdict">
              <div className="eyebrow">{yes}–{no}–{dep} · yes–no–depends</div>
              <div className="headline serif">{councilHeadline(debate)}</div>
              <div className="vx serif">{debate.verdict}</div>
              {debate.quote && <div className="pull-quote serif">“{debate.quote}”</div>}
              <div className="rule" />
              {debate.question && <div className="cq">{debate.question}</div>}

              {debate.realities?.length > 0 && (
                <div className="realities">
                  <div className="eyebrow" style={{ marginBottom: 16 }}>In another life…</div>
                  <div className="realities-grid">
                    {debate.realities.map((r, i) => (
                      <div className="reality" key={i}>
                        <div className="reality-label">{r.label}</div>
                        <div className="reality-line">{r.line}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="actions">
                <ShareBar asked={asked} debate={debate} />
              </div>
              <div className="actions secondary">
                <button className="btn small" onClick={() => downloadShareCard(asked, debate)}>Download verdict card</button>
                <button className="btn small" onClick={copyText}>Copy as text</button>
                <button className="btn small" onClick={reset}>Bring another matter</button>
              </div>
            </div>
          </>
        )}

        {phase === "error" && (
          <div className="err">
            The chamber doors are stuck — the Council could not be reached.<br />
            <div style={{ marginTop: 22 }}>
              <button className="btn" onClick={() => convene(asked)}>Knock again</button>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </>
  );
}

export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { broke: false }; }
  static getDerivedStateFromError() { return { broke: true }; }
  componentDidCatch(err, info) { console.error("council: render crash", err, info); }
  render() {
    if (!this.state.broke) return this.props.children;
    return (
      <div className="council-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 20, textAlign: "center", padding: 24 }}>
        <div className="eyebrow">Something interrupted the session</div>
        <div className="serif" style={{ fontSize: 22, maxWidth: "30ch" }}>The Council needs a moment to reconvene.</div>
        <button className="btn primary" onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }
}
