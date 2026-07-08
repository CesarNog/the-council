import { useState, useEffect } from "react";
import { LandingHeroFallback } from "./LandingHeroFallback.jsx";
import { HowItWorks } from "./HowItWorks.jsx";
import { PersonaPreview } from "./PersonaPreview.jsx";
import { ExampleDecisionGrid } from "./ExampleDecisionGrid.jsx";
import { SampleVerdictPreview } from "./SampleVerdictPreview.jsx";
import { PremiumTeaser } from "./PremiumTeaser.jsx";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import { firstName } from "../../lib/name.js";
import { t, personaShortName, LANDING_EXAMPLE_KEYS } from "../../lib/i18n.js";
import { Events } from "../../lib/analytics.js";

export function Landing({ onEnter, authSlot, language, history = [], onRevisit, displayName, authenticated }) {
  const reducedMotion = useReducedMotion();
  const [activePersona, setActivePersona] = useState(null);
  const [ctaHover, setCtaHover] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.("(max-width: 768px)");
    if (!mq) return;
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const recentQs = history.slice(0, 2);
  const greetingName = firstName(displayName);
  const greeting = greetingName
    ? t(language, "landing_greeting_named", greetingName)
    : authenticated
      ? t(language, "landing_greeting_anon")
      : null;

  const heroVisual = (
    <LandingHeroFallback
      language={language}
      activePersona={activePersona}
      onPersonaHover={setActivePersona}
      ctaHover={ctaHover}
      reducedMotion={reducedMotion}
    />
  );

  const personaHint = activePersona ? (
    <div className="landing-persona-hint fade-up" aria-live="polite">
      <span style={{ color: "var(--gold)" }}>{personaShortName(language, activePersona)}</span>
      <span> — {t(language, `landing_hover_${activePersona}`)}</span>
    </div>
  ) : null;

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero-atmosphere" aria-hidden="true" />
        <div className="landing-hero-visual">
          <div className="landing-hero-visual-vignette" aria-hidden="true" />
          {heroVisual}
        </div>
        <div className="landing-hero-copy">
          <div className="eyebrow fade-up d1">The Council</div>
          {greeting && <p className="landing-greeting fade-up d2">{greeting}</p>}
          <h1 className="fade-up d2">
            {t(language, "landing_title_1")}<br /><em>{t(language, "landing_title_em")}</em>
          </h1>
          <p className="sub fade-up d3">{t(language, "landing_sub")}</p>
          <p className="landing-trust fade-up d3">{t(language, "landing_trust")}</p>
          {personaHint}
          <div className="fade-up d4 cta-group landing-cta-group">
            <button
              className="btn primary landing-cta-primary"
              onClick={() => { Events.landingCta({ action: "primary", authenticated: !!authenticated, language }); onEnter(); }}
              onMouseEnter={() => setCtaHover(true)}
              onMouseLeave={() => setCtaHover(false)}
              onFocus={() => setCtaHover(true)}
              onBlur={() => setCtaHover(false)}
            >
              {t(language, "enter_chamber_cta")}
            </button>
            <button
              type="button"
              className="btn small landing-cta-secondary"
              onClick={() => {
                Events.landingCta({ action: "demo", authenticated: !!authenticated, language });
                document.getElementById("sample-verdict")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
              }}
            >
              {t(language, "landing_secondary_cta")}
            </button>
            <div className="cta-sub">{t(language, "enter_chamber_sub")}</div>
            {authSlot && (
              <div className="auth-slot-wrap">
                <div className="auth-divider"><span>{t(language, "auth_or")}</span></div>
                {authSlot}
              </div>
            )}
          </div>
          {recentQs.length > 0 && (
            <div className="fade-up d4 landing-quick-section landing-quick-compact landing-quick-hero">
              <div className="landing-quick-label">{t(language, "past_questions")}</div>
              <div className="landing-quick-chips">
                {recentQs.map(h => (
                  <button key={h.id} type="button" className="landing-chip landing-chip--history" onClick={() => onRevisit(h.question)}>
                    <span className="landing-chip-q">{h.question}</span>
                    {h.headline && <span className="landing-chip-hl">{h.headline}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="fade-up d4 landing-hero-examples">
            {LANDING_EXAMPLE_KEYS.slice(0, isMobile ? 3 : 6).map((key) => {
              const q = t(language, key);
              return (
                <button
                  key={key}
                  type="button"
                  className="landing-hero-example-chip"
                  onClick={() => {
                    Events.landingCta({ action: "hero_example", authenticated: !!authenticated, language });
                    onEnter(q);
                  }}
                >
                  {q}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <HowItWorks language={language} />
      <PersonaPreview language={language} />
      <ExampleDecisionGrid language={language} onSelect={(q) => onEnter(q)} authenticated={authenticated} />
      <SampleVerdictPreview language={language} />
      <PremiumTeaser language={language} />

      <section className="landing-section landing-final-cta">
        <h2 className="landing-section-title">{t(language, "landing_final_cta_title")}</h2>
        <button
          type="button"
          className="btn primary"
          onClick={() => { Events.landingCta({ action: "footer", authenticated: !!authenticated, language }); onEnter(); }}
        >
          {t(language, "enter_chamber_cta")}
        </button>
      </section>
    </div>
  );
}
