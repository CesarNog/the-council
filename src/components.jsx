import React, { useState, useEffect, useRef, useMemo } from "react";
import { PERSONAS, byId, MOOD_COLORS, INTENSITY, PACE } from "./lib/personas.js";
import { tally, councilHeadline, shareText, downloadShareCard, shareUrl, copyLink } from "./lib/share.js";
import { summonCouncil, FALLBACK } from "./lib/api.js";
import { saveToHistory } from "./lib/history.js";
import { t, TTS_LANG, QUICK_QUESTIONS_I18N, RICH_QUESTIONS_I18N, personaName, personaTag, personaShortName } from "./lib/i18n.js";
import { speak, stopSpeaking, voiceSupported } from "./lib/voice.js";
import { updateProfile } from "./lib/auth.js";

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

export function Ring({ active, speaking, mentioned, phase, label, language = "en" }) {
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
          <div key={p.id} className={cls} role="img" aria-label={personaName(language, p.id)} style={{ left: `${cx}%`, top: `${cy}%`, color: p.color, "--intensity": INTENSITY[p.id] }}>
            <Sigil id={p.id} />
            <span className="tip" style={{ color: p.color }}>{personaShortName(language, p.id)}</span>
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

function Whisper({ language }) {
  const [i, setI] = useState(0);
  const [vis, setVis] = useState(true);
  useEffect(() => {
    const timer = setInterval(() => {
      setVis(false);
      setTimeout(() => { setI(n => (n + 1) % PERSONAS.length); setVis(true); }, 600);
    }, 4200);
    return () => clearInterval(timer);
  }, []);
  const p = PERSONAS[i];
  return (
    <div style={{ marginTop: 34, minHeight: 46, transition: "opacity .6s ease", opacity: vis ? 1 : 0 }}>
      <span className="serif" style={{ fontStyle: "italic", fontSize: 17, color: p.color }}>"{p.line}"</span>
      <div className="eyebrow" style={{ marginTop: 8, fontSize: 9, color: "var(--ivory-faint)" }}>— {personaName(language, p.id)}</div>
    </div>
  );
}

export function Landing({ onEnter, authSlot, language, history = [], onRevisit, displayName }) {
  const richPool = RICH_QUESTIONS_I18N[language] || RICH_QUESTIONS_I18N.en;
  const richQs = useMemo(() => {
    const start = Math.floor(Math.random() * (richPool.length - 2));
    return richPool.slice(start, start + 3);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const recentQs = history.slice(0, 3);
  return (
    <div className="landing">
      <div className="fade-up d1"><Ring language={language} /></div>
      <div className="eyebrow fade-up d2" style={{ marginTop: 40 }}>The Council</div>
      {displayName && (
        <div className="landing-greeting fade-up d2">{t(language, "landing_greeting_named", displayName)}</div>
      )}
      <h1 className="fade-up d2">{t(language, "landing_title_1")}<br /><em>{t(language, "landing_title_em")}</em></h1>
      <p className="sub fade-up d3">{t(language, "landing_sub")}</p>
      <div className="fade-up d4" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <button className="btn primary" onClick={() => onEnter()}>{t(language, "enter_chamber_cta")}</button>
        <div className="cta-sub">{t(language, "enter_chamber_sub")}</div>
      </div>
      {authSlot && <div className="fade-up d4" style={{ marginTop: 18 }}>{authSlot}</div>}
      {recentQs.length > 0 && (
        <div className="fade-up d4 landing-quick-section">
          <div className="landing-quick-label">{t(language, "past_questions")}</div>
          <div className="landing-quick-chips">
            {recentQs.map(h => (
              <button key={h.id} className="landing-chip landing-chip--history" onClick={() => onRevisit(h.question)}>
                <span className="landing-chip-q">{h.question}</span>
                {h.headline && <span className="landing-chip-hl">{h.headline}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="fade-up d5 landing-quick-section">
        <div className="landing-quick-label">{t(language, "try_example")}</div>
        <div className="landing-quick-chips">
          {richQs.map(q => (
            <button key={q} className="landing-chip" onClick={() => onEnter(q)}>{q}</button>
          ))}
        </div>
      </div>
      <div className="fade-up d5"><Whisper language={language} /></div>
    </div>
  );
}

const WEIGHT_KEYS = ["onb_weight_light", "onb_weight_moderate", "onb_weight_heavy", "onb_weight_sleepless"];
const WEIGHT_VALS = ["light", "moderate", "heavy", "sleepless"];
const CAT_KEYS = ["onb_cat_career", "onb_cat_love", "onb_cat_money", "onb_cat_family", "onb_cat_life_change", "onb_cat_creativity", "onb_cat_emotional", "onb_cat_other"];
const CAT_VALS = ["career", "love", "money", "family", "life_change", "creativity", "emotional", "other"];
const FEAR_KEYS = ["onb_fear_security", "onb_fear_regret", "onb_fear_hurt", "onb_fear_fail", "onb_fear_judged", "onb_fear_start", "onb_fear_unknown"];
const FEAR_VALS = ["security", "regret", "hurt", "fail", "judged", "start", "unknown"];

export function Onboarding({ onDone, initial, language, googleNames }) {
  const [step, setStep] = useState(0);
  // step 0: name
  const [displayName, setDisplayName] = useState(initial?.name || "");
  const [customName, setCustomName] = useState("");
  const [nameMode, setNameMode] = useState(googleNames?.length ? "pick" : "type"); // pick | type | none
  // step 1: decision question
  const [question, setQuestion] = useState("");
  // step 2: emotional weight
  const [emotionalWeight, setEmotionalWeight] = useState("");
  // step 3: category
  const [decisionCategory, setDecisionCategory] = useState("");
  // step 4: main fear
  const [mainFear, setMainFear] = useState("");

  const totalSteps = 5;
  const goBack = () => setStep(s => Math.max(0, s - 1));

  const resolvedName = nameMode === "none" ? "" : (nameMode === "type" ? customName.trim() : displayName);

  const finish = () => {
    onDone({
      name: resolvedName,
      displayName: resolvedName,
      question: question.trim(),
      emotionalWeight,
      decisionCategory,
      mainFear,
    });
  };

  const onKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (step === 1 && question.trim()) setStep(2); } };

  return (
    <div className="onb">
      <div className="progress">{Array.from({ length: totalSteps }, (_, i) => <i key={i} className={i <= step ? "on" : ""} />)}</div>

      {/* Step 0: Name */}
      {step === 0 && (
        <div className="onb-step" key="s0">
          <div className="eyebrow">{t(language, "onb_progress_1")}</div>
          <h2>{googleNames?.length ? t(language, "onb_name_google_intro") : t(language, "onb_name_anon_intro")}</h2>
          {googleNames?.length > 0 && (
            <div className="name-chip-row">
              {googleNames.map(n => (
                <button key={n} className={"name-chip" + (nameMode === "pick" && displayName === n ? " on" : "")}
                  onClick={() => { setDisplayName(n); setNameMode("pick"); }}>
                  {n}
                </button>
              ))}
              <button className={"name-chip" + (nameMode === "none" ? " on" : "")}
                onClick={() => setNameMode("none")}>
                {t(language, "onb_name_prefer_not")}
              </button>
            </div>
          )}
          {!googleNames?.length && (
            <>
              <input type="text" autoFocus value={customName} onChange={e => setCustomName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") setStep(1); }}
                placeholder={t(language, "onb_name_placeholder")} />
              <div style={{ marginTop: 12 }}>
                <button className={"name-chip" + (nameMode === "none" ? " on" : "")}
                  onClick={() => setNameMode(m => m === "none" ? "type" : "none")}>
                  {t(language, "onb_name_prefer_not")}
                </button>
              </div>
            </>
          )}
          {nameMode === "pick" && (
            <div style={{ marginTop: 16 }}>
              <input type="text" value={customName} onChange={e => { setCustomName(e.target.value); setNameMode("type"); }}
                placeholder={t(language, "onb_name_custom_placeholder")} style={{ marginBottom: 0 }} />
            </div>
          )}
          <div style={{ marginTop: 44 }}>
            <button className="btn" onClick={() => setStep(1)}>{t(language, "continue")}</button>
          </div>
        </div>
      )}

      {/* Step 1: Decision question */}
      {step === 1 && (
        <div className="onb-step" key="s1">
          <button className="onb-back" onClick={goBack}>← {t(language, "back").replace("←", "").trim()}</button>
          <div className="eyebrow">{t(language, "onb_progress_2")}</div>
          <h2>{t(language, "onb_decision_q")}</h2>
          <p className="hint">{t(language, "onb_decision_hint")}</p>
          <textarea rows={2} autoFocus value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={onKey}
            placeholder={t(language, "onb_decision_placeholder")} />
          <div style={{ marginTop: 44 }}>
            <button className="btn" onClick={() => setStep(2)} disabled={!question.trim()}>{t(language, "continue")}</button>
          </div>
        </div>
      )}

      {/* Step 2: Emotional weight */}
      {step === 2 && (
        <div className="onb-step" key="s2">
          <button className="onb-back" onClick={goBack}>← {t(language, "back").replace("←", "").trim()}</button>
          <div className="eyebrow">{t(language, "onb_progress_3")}</div>
          <h2>{t(language, "onb_weight_q")}</h2>
          <p className="hint">{t(language, "onb_weight_hint")}</p>
          <div className="onb-option-row">
            {WEIGHT_KEYS.map((key, i) => (
              <button key={key} className={"onb-option" + (emotionalWeight === WEIGHT_VALS[i] ? " on" : "")}
                onClick={() => { setEmotionalWeight(WEIGHT_VALS[i]); setStep(3); }}>
                {t(language, key)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Category */}
      {step === 3 && (
        <div className="onb-step" key="s3">
          <button className="onb-back" onClick={goBack}>← {t(language, "back").replace("←", "").trim()}</button>
          <div className="eyebrow">{t(language, "onb_progress_4")}</div>
          <h2>{t(language, "onb_category_q")}</h2>
          <div className="onb-cat-grid">
            {CAT_KEYS.map((key, i) => (
              <button key={key} className={"onb-option" + (decisionCategory === CAT_VALS[i] ? " on" : "")}
                onClick={() => { setDecisionCategory(CAT_VALS[i]); setStep(4); }}>
                {t(language, key)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Main fear */}
      {step === 4 && (
        <div className="onb-step" key="s4">
          <button className="onb-back" onClick={goBack}>← {t(language, "back").replace("←", "").trim()}</button>
          <div className="eyebrow">{t(language, "onb_progress_5")}</div>
          <h2>{t(language, "onb_fear_q")}</h2>
          <p className="hint">{t(language, "onb_fear_hint")}</p>
          <div className="onb-option-row">
            {FEAR_KEYS.map((key, i) => (
              <button key={key} className={"onb-option" + (mainFear === FEAR_VALS[i] ? " on" : "")}
                onClick={() => setMainFear(FEAR_VALS[i])}>
                {t(language, key)}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 44 }}>
            <button className="btn primary" onClick={finish} disabled={!mainFear}>{t(language, "convene")}</button>
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

export function ShareBar({ asked, debate, language = "en" }) {
  const [copied, setCopied] = useState(false);
  const appUrl = shareUrl(debate?.id);
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const nativeShare = () => {
    navigator.share({ title: t(language, "share_native_title"), text: shareText(asked, debate, { language }), url: appUrl }).catch(() => {});
  };

  const handleCopyLink = () => {
    copyLink(appUrl).then(ok => {
      if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
    });
  };

  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(shareText(asked, debate, { language }) + "\n\n" + appUrl)}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText(asked, debate, { max: 260, language }))}&url=${encodeURIComponent(appUrl)}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}` },
  ];

  return (
    <div className="share-row">
      {canNativeShare && (
        <button className="btn primary share-btn" onClick={nativeShare}><ShareIcon /> {t(language, "share_native")}</button>
      )}
      {links.map(l => (
        <a key={l.label} className="btn share-btn" href={l.href} target="_blank" rel="noopener noreferrer">
          <ShareIcon /> {l.label}
        </a>
      ))}
      <button className="btn share-btn" onClick={handleCopyLink}>
        <ShareIcon /> {copied ? t(language, "link_copied") : t(language, "copy_link")}
      </button>
    </div>
  );
}

function vibrate(pattern) {
  if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(pattern);
}

export function Chamber({ profile, preloaded, initialQuestion, onExit, lifeModeSlot, language, decisionContext }) {
  const [phase, setPhase] = useState("idle"); // idle | summoning | debate | reflecting | voting | verdict | error
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState("");
  const [debate, setDebate] = useState(null);
  const [shown, setShown] = useState(0);
  const [votesShown, setVotesShown] = useState(0);
  const [speaking, setSpeaking] = useState(null); // index do turno tocando agora, ou null
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
    if (phase === "idle") stopSpeaking(); // "New question" corta fala pendente
  }, [phase]);

  const playTurn = (index) => {
    if (!voiceSupported || !debate) return;
    if (speaking === index) { stopSpeaking(); setSpeaking(null); return; }
    const turn = debate.turns[index];
    speak(turn.t, turn.p, {
      onStart: () => setSpeaking(index),
      onEnd: () => setSpeaking(s => (s === index ? null : s)),
      lang: TTS_LANG[language],
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
    vibrate(12);
    return () => clearTimeout(t);
  }, [phase, votesShown, debate]);

  // verdict: sequencia cinematografica — escurece, tally, headline+verdict, quote, resto
  const { yes, no, dep } = tally(debate || { votes: [] });
  const isEclipse = debate && (yes === debate.votes.length || no === debate.votes.length);
  const eclipseVote = isEclipse ? (yes === debate.votes.length ? "yes" : "no") : null;

  // verdict: sequencia cinematografica — escurece, tally, headline+verdict, quote, resto
  // eclipse (unanimidade): tudo mais lento e solene, silencio mais longo antes do reveal
  const [verdictStage, setVerdictStage] = useState(0);
  useEffect(() => {
    if (phase !== "verdict") { setVerdictStage(0); return; }
    const delays = isEclipse ? [2600, 1800, 1400, 1200] : [50, 900, 1000, 900];
    let stage = 0;
    const timers = delays.map(d => {
      stage += 1;
      const s = stage;
      return setTimeout(() => {
        setVerdictStage(s);
        if (s === 2) vibrate(isEclipse ? [30, 80, 30, 80, 120] : [20, 40, 60]);
      }, delays.slice(0, s).reduce((a, b) => a + b, 0));
    });
    return () => timers.forEach(clearTimeout);
  }, [phase, isEclipse]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [shown, votesShown, phase]);

  useEffect(() => stopSpeaking, []); // cleanup ao desmontar

  const [rateLimited, setRateLimited] = useState(false);
  const [retryIn, setRetryIn] = useState(0);

  const convene = async (q) => {
    const qq = (q || question).trim();
    if (!qq) return;
    setAsked(qq); setQuestion(""); setRateLimited(false); setRetryIn(0);
    setDebate(null); setShown(0); setVotesShown(0);
    setPhase("summoning");
    try {
      const result = await summonCouncil(qq, profile, language, decisionContext);
      setDebate(result); setPhase("debate");
    } catch (e) {
      if (e.kind === "rate_limited") {
        // 429: mostrar debate fake identico confundia ("por que ele fala sempre a mesma coisa?") — erro honesto com retry
        setRateLimited(true);
        setRetryIn(e.retryAfter || 60);
        setPhase("error");
        return;
      }
      // falha real de rede: demo offline claramente rotulada
      setDebate({ ...FALLBACK, offline: true });
      setPhase("debate");
    }
  };

  // countdown for rate-limit — ticks down to 0, then auto-retries
  const askedRef = useRef(asked);
  useEffect(() => { askedRef.current = asked; }, [asked]);
  useEffect(() => {
    if (phase !== "error" || !rateLimited || retryIn <= 0) return;
    const id = setTimeout(() => setRetryIn(n => Math.max(0, n - 1)), 1000);
    return () => clearTimeout(id);
  }, [phase, rateLimited, retryIn]);
  useEffect(() => {
    if (phase === "error" && rateLimited && retryIn === 0 && askedRef.current) convene(askedRef.current);
  }, [retryIn]); // eslint-disable-line react-hooks/exhaustive-deps

  // auto-convene on mount — used by quick-question chips and /decisions/:slug pages
  const initialQuestionRef = useRef(initialQuestion);
  useEffect(() => {
    if (initialQuestionRef.current) convene(initialQuestionRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    if (onExit) return onExit();
    setPhase("idle"); setAsked(""); setDebate(null); setShown(0); setVotesShown(0);
  };

  const copyText = () => navigator.clipboard?.writeText(shareText(asked, debate, { language }));

  const recordedRef = useRef(null);
  useEffect(() => {
    if (phase !== "verdict" || !debate?.id || recordedRef.current === debate.id) return;
    recordedRef.current = debate.id;
    updateProfile({
      recordDebate: { id: debate.id, question: asked, verdict: debate.verdict, mood: debate.mood, unanimousVote: eclipseVote },
    }).catch(() => {}); // anonimo (401) ou falha de rede — nao afeta a experiencia, so nao persiste
    if (!debate.offline) saveToHistory({ id: debate.id, question: asked, headline: councilHeadline(debate, "en") });
  }, [phase, debate?.id]);

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
            <div className="eyebrow">{t(language, "chamber_label")}</div>
            <div className="title serif">{profile?.name ? t(language, "in_session_for", profile.name) : t(language, "verdict_reached")}</div>
          </div>
          {phase !== "idle" && <button className="btn small" onClick={reset}>{t(language, "new_question")}</button>}
        </div>

        <Ring
          active={ringActive}
          speaking={speaking !== null && debate ? debate.turns[speaking]?.p : null}
          mentioned={mentionedIds}
          phase={phase}
          language={language}
          label={phase === "summoning" ? t(language, "deliberating") : phase === "reflecting" ? t(language, "reflecting") : phase === "voting" ? t(language, "voting") : phase === "verdict" ? t(language, "adjourned") : null}
        />

        {phase === "idle" && lifeModeSlot}

        {phase === "idle" && (
          <div className="ask">
            <div className="eyebrow" style={{ marginBottom: 18 }}>{t(language, "bring_question")}</div>
            <textarea rows={2} value={question} onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); convene(); } }}
              placeholder={t(language, "question_placeholder")} autoFocus />
            <div style={{ marginTop: 30 }}>
              <button className="btn primary" onClick={() => convene()} disabled={!question.trim()}>{t(language, "convene")}</button>
            </div>
            <div className="quick-questions">
              {QUICK_QUESTIONS_I18N[language].map(q => (
                <button key={q} className="chip" onClick={() => convene(q)}>{q}</button>
              ))}
            </div>
          </div>
        )}

        {phase !== "idle" && asked && (
          <div className="question-banner" style={{ marginTop: 30 }}>
            <div className="eyebrow">{debate?.offline ? t(language, "offline_banner") : t(language, "matter_before_council")}</div>
            <div className="q">"{asked}"</div>
            {decisionContext && (decisionContext.decisionCategory || decisionContext.emotionalWeight || decisionContext.mainFear) && (
              <div className="context-chips">
                {decisionContext.decisionCategory && <span className="context-chip">{t(language, `onb_cat_${decisionContext.decisionCategory}`) || decisionContext.decisionCategory}</span>}
                {decisionContext.emotionalWeight && <span className="context-chip">{t(language, `onb_weight_${decisionContext.emotionalWeight}`) || decisionContext.emotionalWeight}</span>}
                {decisionContext.mainFear && <span className="context-chip">{t(language, `onb_fear_${decisionContext.mainFear}`) || decisionContext.mainFear}</span>}
              </div>
            )}
          </div>
        )}

        {phase === "summoning" && (
          <div className="speaking" style={{ justifyContent: "center" }}>
            <span className="dots"><i /><i /><i /></span>
            {t(language, "the_nine_take_seats")}
          </div>
        )}

        {debate && (phase === "debate" || phase === "reflecting" || phase === "voting" || phase === "verdict") && (
          <div className="feed" aria-live="polite" aria-atomic="false">
            {debate.turns.slice(0, shown).map((turn, i) => {
              const p = byId[turn.p];
              const isPlaying = speaking === i;
              const isFocused = phase === "debate" && i === shown - 1;
              const isDimmed = phase === "debate" && i < shown - 1;
              return (
                <div
                  className={"turn" + (isPlaying ? " playing" : "") + (isFocused ? " focused" : "") + (isDimmed ? " dimmed" : "")}
                  key={i}
                  style={{ color: p.color }}
                >
                  <div className="sig"><Sigil id={p.id} /></div>
                  <div style={{ flex: 1 }}>
                    <div className="who" style={{ color: p.color }}>
                      {personaName(language, p.id)} <span style={{ color: "var(--ivory-faint)", letterSpacing: ".12em" }}>· {personaTag(language, p.id)}</span>
                    </div>
                    <div className="txt">{turn.t}</div>
                  </div>
                  {voiceSupported && (
                    <button
                      className={"listen-btn" + (isPlaying ? " playing" : "")}
                      onClick={() => playTurn(i)}
                      aria-label={isPlaying ? t(language, "stop") : t(language, "listen", personaName(language, p.id))}
                      title={isPlaying ? t(language, "stop") : t(language, "listen_title")}
                    >
                      {isPlaying ? "■" : "▶"}
                    </button>
                  )}
                </div>
              );
            })}
            {phase === "debate" && shown < debate.turns.length && (
              <div className="speaking" role="status" style={{ color: byId[debate.turns[shown].p].color }}>
                <span className="dots"><i /><i /><i /></span>
                {t(language, "is_speaking", personaName(language, debate.turns[shown].p))}
              </div>
            )}
            {phase === "reflecting" && (
              <div className="reflection">{t(language, "chamber_falls_quiet")}</div>
            )}
            {phase === "reflecting" && debate.memoryEcho && (
              <div className="memory-echo" style={{ color: byId[debate.memoryEcho.persona]?.color }}>
                <div className="sig"><Sigil id={debate.memoryEcho.persona} /></div>
                <div>
                  <div className="memory-echo-label">{t(language, "memory_echo_label")}</div>
                  <div className="memory-echo-line serif">{debate.memoryEcho.line}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {debate && (phase === "voting" || phase === "verdict") && (
          <>
            <div className="vote-title">
              <div className="eyebrow">{t(language, "deliberation_closed")}</div>
              <h3 className="serif">{t(language, "council_votes")}</h3>
            </div>
            <div className="votes">
              {debate.votes.slice(0, votesShown).map((v, i) => {
                const p = byId[v.p];
                const cls = v.v === "yes" ? "yes" : v.v === "no" ? "no" : "dep";
                const label = v.v === "yes" ? t(language, "vote_yes") : v.v === "no" ? t(language, "vote_no") : t(language, "vote_depends");
                return (
                  <div className="vote" key={i} style={{ color: p.color, animationDelay: `${i * .04}s` }}>
                    <div className="sig"><Sigil id={p.id} /></div>
                    <div className="nm" style={{ color: p.color }}>{personaShortName(language, p.id)}</div>
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
            <div className={"verdict-dim" + (verdictStage >= 1 ? " lifted" : "") + (isEclipse ? " eclipse-dim" : "")} />

            {isEclipse ? (
              <div className={"eclipse-mark" + (verdictStage >= 1 ? " in" : "")}>
                <div className="eclipse-glyph">☉</div>
                <div className="eclipse-title serif">{t(language, "council_eclipse")}</div>
                <div className="eclipse-sub">{t(language, "eclipse_sub")}</div>
              </div>
            ) : (
              <>
                <div className={"tally" + (verdictStage >= 1 ? " in" : "")}>
                  <i className={yes >= no && yes >= dep ? "winning" : ""} style={{ width: `${(yes / debate.votes.length) * 100}%`, background: "#D8C08A" }} />
                  <i className={dep > yes && dep > no ? "winning" : ""} style={{ width: `${(dep / debate.votes.length) * 100}%`, background: "rgba(237,232,222,.28)" }} />
                  <i className={no > yes && no >= dep ? "winning" : ""} style={{ width: `${(no / debate.votes.length) * 100}%`, background: "rgba(237,232,222,.1)" }} />
                </div>
                <div className={"tally-labels" + (verdictStage >= 1 ? " in" : "")}>
                  <span style={{ color: "#D8C08A" }}>{t(language, "yes")} {yes}</span>
                  <span>{t(language, "depends")} {dep}</span>
                  <span>{t(language, "no")} {no}</span>
                </div>
              </>
            )}

            <div className={"verdict" + (isEclipse ? " eclipse" : "")}>
              {!isEclipse && <div className={"eyebrow reveal" + (verdictStage >= 2 ? " in" : "")}>{yes}–{no}–{dep} · yes–no–depends</div>}
              <div className={"headline serif reveal" + (verdictStage >= 2 ? " in" : "")}>{isEclipse ? t(language, "eclipse_headline", eclipseVote === "yes" ? t(language, "yes") : t(language, "no")) : councilHeadline(debate, language)}</div>
              <div className={"vx serif reveal" + (verdictStage >= 2 ? " in" : "")}>{debate.verdict}</div>
              {debate.quote && <div className={"pull-quote serif reveal" + (verdictStage >= 3 ? " in" : "")}>"{debate.quote}"</div>}
              <div className={"rule reveal" + (verdictStage >= 3 ? " in" : "")} />
              {isEclipse && <div className={"eclipse-rarity reveal" + (verdictStage >= 3 ? " in" : "")}>{t(language, "eclipse_rarity")}</div>}
              {debate.question && <div className={"cq reveal" + (verdictStage >= 4 ? " in" : "")}>{debate.question}</div>}

              {debate.realities?.length > 0 && (
                <div className={"realities reveal" + (verdictStage >= 4 ? " in" : "")}>
                  <div className="eyebrow" style={{ marginBottom: 16 }}>{t(language, "in_another_life")}</div>
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

              <div className={"actions reveal" + (verdictStage >= 4 ? " in" : "")}>
                <ShareBar asked={asked} debate={debate} language={language} />
              </div>
              <div className={"actions secondary reveal" + (verdictStage >= 4 ? " in" : "")}>
                <button className="btn small" onClick={() => downloadShareCard(asked, debate, language)}>{t(language, "download_verdict")}</button>
                <button className="btn small" onClick={copyText}>{t(language, "copy_as_text")}</button>
                <button className="btn small" onClick={reset}>{t(language, "bring_another")}</button>
              </div>
            </div>
          </>
        )}

        {phase === "error" && (
          <div className="err">
            {t(language, rateLimited ? "rate_limited_msg" : "chamber_stuck")}
            {rateLimited && retryIn > 0 && (
              <div className="rate-limit-countdown" role="status" aria-live="polite">{t(language, "rate_limited_retry_in", retryIn)}</div>
            )}
            <div style={{ marginTop: 22 }}>
              <button className="btn" onClick={() => convene(asked)}>{t(language, "knock_again")}</button>
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
