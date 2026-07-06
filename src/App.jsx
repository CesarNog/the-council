import { useState, useEffect } from "react";
import { Landing, Onboarding, Chamber, ErrorBoundary } from "./components.jsx";
import { GoogleSignIn, ProfileSettings } from "./auth-ui.jsx";
import { LifeModeBanner } from "./life-mode.jsx";
import { LanguageSelector } from "./language-selector.jsx";
import { ConsentBanner, CookieSettings, useConsentBannerVisible } from "./consent-ui.jsx";
import { acceptAll, rejectOptional } from "./lib/consent.js";
import { initAnalytics, trackPageView } from "./lib/analytics.js";
import { initAds } from "./lib/ads.js";
import { signInWithGoogle, signOut, getProfile, updateProfile } from "./lib/auth.js";
import { detectBrowserLanguage, t } from "./lib/i18n.js";
import { loadHistory } from "./lib/history.js";

function sharedIdFromPath() {
  const m = typeof window !== "undefined" ? window.location.pathname.match(/^\/r\/([a-z0-9]{4,20})$/i) : null;
  return m ? m[1] : null;
}

function staticPageFromPath() {
  if (typeof window === "undefined") return null;
  const p = window.location.pathname;
  if (p === "/privacy") return "privacy";
  if (p === "/terms") return "terms";
  if (p === "/cookies") return "cookies";
  return null;
}

function StaticPage({ page, onBack, language = "en" }) {
  const content = {
    privacy: {
      title: "Privacy Policy",
      body: `TODO: Legal review required before public launch.\n\nThe Council stores minimal data. Debate results are persisted only to power shareable links. We do not sell or share your data with third parties. Analytics (if consented) are used solely to improve the product.\n\nFor questions, contact: [your email here].`,
    },
    terms: {
      title: "Terms of Service",
      body: `TODO: Legal review required before public launch.\n\nThe Council is a reflective decision tool. It does not provide legal, financial, medical, or professional advice. Use the personas' perspectives as creative prompts — not as authoritative guidance.\n\nBy using The Council, you accept these terms.`,
    },
    cookies: {
      title: "Cookie Policy",
      body: `TODO: Legal review required before public launch.\n\nThe Council uses cookies and localStorage for:\n\n• Necessary: session continuity, language preference.\n• Analytics (optional): aggregate usage patterns via Hotjar. No personal data.\n• Advertising (optional): discreet ads that help keep The Council free.\n\nYou can update your preferences at any time from the footer.`,
    },
  };
  const { title, body } = content[page] || { title: "Not Found", body: "" };
  return (
    <div className="landing" style={{ maxWidth: 680, margin: "0 auto", padding: "60px 24px" }}>
      <button className="btn small" style={{ marginBottom: 32 }} onClick={onBack}>{t(language, "back")}</button>
      <h1 className="serif" style={{ fontSize: "clamp(24px,3vw,36px)", marginBottom: 24 }}>{title}</h1>
      <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 15, lineHeight: 1.7, opacity: 0.85 }}>{body}</pre>
    </div>
  );
}

function eclipsePreviewDebate() {
  if (typeof window === "undefined") return null;
  if (new URLSearchParams(window.location.search).get("preview") !== "eclipse") return null;
  const ids = ["founder", "billionaire", "artist", "athlete", "monk", "scientist", "explorer", "romantic", "shadow"];
  return {
    question: "[QA preview] Should I take the leap?",
    debate: {
      id: "preview",
      mood: "electric",
      turns: ids.map(p => ({ p, t: "[Eclipse QA preview turn]" })),
      votes: ids.map(p => ({ p, v: "yes", r: "[QA]" })),
      verdict: "[QA preview] This is a synthetic unanimous debate used only to visually validate the Eclipse sequence.",
      quote: "[QA preview quote]",
      question: "[QA preview reflection question]",
      realities: [],
    },
  };
}

function SharedConversionBanner({ onEnter, language = "en" }) {
  return (
    <div className="shared-conversion-banner">
      <p className="shared-conversion-text">
        {t(language, "shared_conversion_text")}
      </p>
      <button className="btn primary shared-conversion-btn" onClick={onEnter}>
        {t(language, "shared_conversion_cta")}
      </button>
    </div>
  );
}

function SharedGate({ id, onExit, onEnter, language = "en" }) {
  const [result, setResult] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch(`/api/result?id=${encodeURIComponent(id)}`)
      .then(r => { if (!r.ok) throw new Error("not_found"); return r.json(); })
      .then(d => setResult({ question: d.asked, debate: d }))
      .catch(() => setFailed(true));
  }, [id]);

  if (failed) {
    return (
      <div className="landing">
        <div className="eyebrow">{t(language, "shared_gone_eyebrow")}</div>
        <h1 style={{ fontSize: "clamp(28px,4vw,44px)" }}>{t(language, "shared_gone_title")}</h1>
        <p style={{ opacity: 0.6, marginTop: 16, fontSize: 15 }}>
          {t(language, "shared_gone_sub")}
        </p>
        <button className="btn primary" style={{ marginTop: 30 }} onClick={onEnter || onExit}>
          {t(language, "shared_gone_cta")}
        </button>
      </div>
    );
  }
  if (!result) {
    return (
      <div className="landing">
        <div className="speaking" style={{ justifyContent: "center" }}>
          <span className="dots"><i /><i /><i /></span>
          {t(language, "shared_loading")}
        </div>
      </div>
    );
  }
  return (
    <>
      <Chamber profile={{}} preloaded={result} onExit={onExit} />
      <SharedConversionBanner onEnter={onEnter || onExit} language={language} />
    </>
  );
}

function userHasCompletedProfile(user) {
  return !!(user?.name);
}

function decisionQuestionFromWindow() {
  if (typeof window === "undefined") return null;
  const q = window.__COUNCIL_DECISION__;
  if (q) delete window.__COUNCIL_DECISION__;
  return q || null;
}

function TheCouncilApp() {
  const [sharedId, setSharedId] = useState(sharedIdFromPath);
  const [staticPage, setStaticPage] = useState(staticPageFromPath);
  const [eclipsePreview] = useState(eclipsePreviewDebate);
  const [decisionQuestion] = useState(decisionQuestionFromWindow);
  const [quickQuestion, setQuickQuestion] = useState(null);
  const [screen, setScreen] = useState(sharedId ? "shared" : eclipsePreview ? "chamber" : decisionQuestion ? "chamber" : "landing"); // landing | onboarding | chamber | shared
  const [consentBannerVisible, dismissConsentBanner] = useConsentBannerVisible();
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const [profile, setProfile] = useState({ name: "", situation: "", values: [] });
  const [user, setUser] = useState(null); // null = anonimo ou ainda carregando
  const [checkingSession, setCheckingSession] = useState(!sharedId);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [displayName, setDisplayName] = useState(() => {
    try { return localStorage.getItem("council:displayName") || ""; } catch { return ""; }
  });
  const [decisionContext, setDecisionContext] = useState(null);
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem("council:lang");
      return saved || detectBrowserLanguage();
    } catch {
      return detectBrowserLanguage();
    }
  });

  const changeLanguage = (code) => {
    setLanguage(code);
    try { localStorage.setItem("council:lang", code); } catch {}
  };

  useEffect(() => { initAnalytics(); initAds(); }, []);

  useEffect(() => { trackPageView(screen); }, [screen]);

  useEffect(() => {
    if (sharedId) return;
    getProfile()
      .then(u => {
        if (!u) return;
        setUser(u);
        if (userHasCompletedProfile(u)) {
          setProfile({ name: u.name, situation: u.situation, values: u.values });
          // auto-init displayName from Google name if not yet set
          if (!displayName && u.name) {
            const given = u.name.split(" ")[0];
            setDisplayName(given);
            try { localStorage.setItem("council:displayName", given); } catch {}
          }
          setScreen("chamber");
        }
      })
      .catch(() => {})
      .finally(() => setCheckingSession(false));
  }, [sharedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCredential = async (credential) => {
    setLoginError(null);
    try {
      const u = await signInWithGoogle(credential);
      setUser(u);
      if (userHasCompletedProfile(u)) {
        setProfile({ name: u.name, situation: u.situation, values: u.values });
        if (!displayName && u.name) {
          const given = u.name.split(" ")[0];
          setDisplayName(given);
          try { localStorage.setItem("council:displayName", given); } catch {}
        }
        setScreen("chamber");
      } else {
        setScreen("onboarding");
      }
    } catch (err) {
      if (err.kind === "network_error") setLoginError("login_error_network");
      else if (err.kind === "unconfigured") setLoginError("login_error_unconfigured");
      else setLoginError("login_error_generic");
    }
  };

  const handleOnboardingDone = (p) => {
    const name = p.name || p.displayName || "";
    setProfile({ name, situation: "", values: [] });
    if (p.displayName) {
      setDisplayName(p.displayName);
      try { localStorage.setItem("council:displayName", p.displayName); } catch {}
    }
    if (p.emotionalWeight || p.decisionCategory || p.mainFear) {
      setDecisionContext({ emotionalWeight: p.emotionalWeight, decisionCategory: p.decisionCategory, mainFear: p.mainFear });
    }
    if (p.question) {
      setQuickQuestion(p.question);
    }
    setScreen("chamber");
    if (user && name) {
      updateProfile({ name }).then(setUser).catch(() => {});
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setShowProfileSettings(false);
    setProfile({ name: "", situation: "", values: [] });
    setDecisionContext(null);
    setScreen("landing");
  };

  const exitShared = () => {
    window.history.pushState({}, "", "/");
    setSharedId(null);
    setScreen("landing");
  };

  const userBadge = user ? (
    <button className="user-badge" onClick={() => setShowProfileSettings(true)} aria-label="Profile settings">
      {(user.customPicture || user.googlePicture)
        ? <img src={user.customPicture || user.googlePicture} alt="" />
        : <span className="user-initial">{(user.name || "?")[0].toUpperCase()}</span>
      }
    </button>
  ) : null;

  if (staticPage) {
    return (
      <div className="council-root">
        <div className="grain" />
        <StaticPage page={staticPage} language={language} onBack={() => { window.history.back(); setStaticPage(null); }} />
      </div>
    );
  }

  if (checkingSession) return <div className="council-root"><div className="grain" /></div>;

  return (
    <div className="council-root">
      <div className="grain" />
      <header className="site-header">
        <button className="brand" onClick={() => { if (screen !== "landing" && !sharedId) setScreen("landing"); }}>
          <span className="brand-glyph">⚖</span>
          <span className="brand-name">The Council</span>
        </button>
        <div className="header-right">
          <LanguageSelector language={language} onChange={changeLanguage} />
          {loginError && (
            <div className="login-error-tooltip" role="alert">
              {t(language, loginError)}
              <button className="login-error-dismiss" onClick={() => setLoginError(null)} aria-label="Dismiss">✕</button>
            </div>
          )}
          {userBadge}
        </div>
      </header>
      {screen === "landing" && <div className="ambient" style={{ background: "radial-gradient(50% 40% at 50% 30%, rgba(201,169,110,.08), transparent 70%)" }} />}
      {screen === "landing" && (
        <Landing
          onEnter={(q) => {
            if (q) { setQuickQuestion(q); setScreen("chamber"); }
            else if (user && userHasCompletedProfile(user)) setScreen("chamber");
            else setScreen("onboarding");
          }}
          authSlot={!user && <GoogleSignIn onCredential={handleCredential} />}
          language={language}
          history={loadHistory()}
          onRevisit={(q) => { setQuickQuestion(q); setScreen("chamber"); }}
          displayName={displayName}
        />
      )}
      {screen === "onboarding" && (
        <Onboarding
          onDone={handleOnboardingDone}
          initial={user ? { name: user.name, situation: user.situation, values: user.values } : null}
          language={language}
          googleNames={user?.name ? [user.name.split(" ")[0], user.name].filter((n, i, a) => a.indexOf(n) === i) : null}
        />
      )}
      {screen === "chamber" && (
        <Chamber
          profile={profile}
          language={language}
          preloaded={eclipsePreview}
          initialQuestion={decisionQuestion || quickQuestion}
          decisionContext={decisionContext}
          lifeModeSlot={user?.lifeMode && (
            <LifeModeBanner lifeMode={user.lifeMode} language={language} onDismiss={() => setUser(u => ({ ...u, lifeMode: null }))} />
          )}
        />
      )}
      {screen === "shared" && sharedId && (
        <SharedGate
          id={sharedId}
          language={language}
          onExit={exitShared}
          onEnter={() => {
            window.history.pushState({}, "", "/");
            setSharedId(null);
            if (user && userHasCompletedProfile(user)) setScreen("chamber");
            else setScreen("onboarding");
          }}
        />
      )}

      {showProfileSettings && user && (
        <ProfileSettings
          user={user}
          language={language}
          onSave={(u) => { setUser(u); setProfile(p => ({ ...p, situation: u.situation, values: u.values })); setShowProfileSettings(false); }}
          onClose={() => setShowProfileSettings(false)}
          onSignOut={handleSignOut}
        />
      )}

      <footer className="site-footer">
        <div className="footer-inner">
          <span className="footer-brand">⚖ The Council</span>
          <span className="footer-note">{t(language, "footer_disclaimer")}</span>
          <span className="footer-links">
            <a href="/privacy" onClick={e => { e.preventDefault(); setStaticPage("privacy"); }}>Privacy</a>
            <span className="footer-sep">·</span>
            <a href="/terms" onClick={e => { e.preventDefault(); setStaticPage("terms"); }}>Terms</a>
            <span className="footer-sep">·</span>
            <button className="footer-link-btn" onClick={() => setShowCookieSettings(true)}>Cookie Settings</button>
            <span className="footer-sep">·</span>
            <a href="https://github.com/CesarNog/the-council" target="_blank" rel="noopener noreferrer">GitHub</a>
            <span className="footer-sep">·</span>
            <a href="https://buymeacoffee.com/cesarnog" target="_blank" rel="noopener noreferrer" className="footer-link-coffee">{t(language, "buy_me_coffee")}</a>
            <span className="footer-sep">·</span>
            <span>{t(language, "developed_by")} <a href="https://github.com/CesarNog" target="_blank" rel="noopener noreferrer">CesarNog</a></span>
            <span className="footer-sep">·</span>
            <span>© 2026</span>
          </span>
        </div>
      </footer>

      {consentBannerVisible && !showCookieSettings && (
        <ConsentBanner
          onAccept={() => { acceptAll(); initAnalytics(); initAds(); dismissConsentBanner(); }}
          onReject={() => { rejectOptional(); dismissConsentBanner(); }}
          onSettings={() => setShowCookieSettings(true)}
        />
      )}

      {showCookieSettings && (
        <CookieSettings
          onSave={() => { initAnalytics(); initAds(); setShowCookieSettings(false); dismissConsentBanner(); }}
          onClose={() => setShowCookieSettings(false)}
        />
      )}
    </div>
  );
}

export default function TheCouncil() {
  return (
    <ErrorBoundary>
      <TheCouncilApp />
    </ErrorBoundary>
  );
}
