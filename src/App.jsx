import { useState, useEffect } from "react";
import { Landing, Onboarding, Chamber, ErrorBoundary } from "./components.jsx";
import { GoogleSignIn, ProfileSettings } from "./auth-ui.jsx";
import { LifeModeBanner } from "./life-mode.jsx";
import { LanguageSelector } from "./language-selector.jsx";
import { ConsentBanner, CookieSettings, useConsentBannerVisible } from "./consent-ui.jsx";
import { acceptAll, rejectOptional } from "./lib/consent.js";
import { initAds } from "./lib/ads.js";
import { signInWithGoogle, signOut, getProfile, updateProfile } from "./lib/auth.js";
import { detectBrowserLanguage, t } from "./lib/i18n.js";

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

function StaticPage({ page, onBack }) {
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
      <button className="btn small" style={{ marginBottom: 32 }} onClick={onBack}>← Back</button>
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

function SharedGate({ id, onExit }) {
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
        <div className="eyebrow">This verdict is gone</div>
        <h1 style={{ fontSize: "clamp(28px,4vw,44px)" }}>The Council has already adjourned.</h1>
        <button className="btn primary" style={{ marginTop: 30 }} onClick={onExit}>Bring your own matter</button>
      </div>
    );
  }
  if (!result) {
    return (
      <div className="landing">
        <div className="speaking" style={{ justifyContent: "center" }}>
          <span className="dots"><i /><i /><i /></span>
          Recovering the record
        </div>
      </div>
    );
  }
  return <Chamber profile={{}} preloaded={result} onExit={onExit} />;
}

function userHasCompletedProfile(user) {
  return !!(user?.name && user?.situation && user?.values?.length);
}

function TheCouncilApp() {
  const [sharedId, setSharedId] = useState(sharedIdFromPath);
  const [staticPage, setStaticPage] = useState(staticPageFromPath);
  const [eclipsePreview] = useState(eclipsePreviewDebate);
  const [screen, setScreen] = useState(sharedId ? "shared" : eclipsePreview ? "chamber" : "landing"); // landing | onboarding | chamber | shared
  const [consentBannerVisible, dismissConsentBanner] = useConsentBannerVisible();
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const [profile, setProfile] = useState({ name: "", situation: "", values: [] });
  const [user, setUser] = useState(null); // null = anonimo ou ainda carregando
  const [checkingSession, setCheckingSession] = useState(!sharedId);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
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

  useEffect(() => { initAds(); }, []);

  useEffect(() => {
    if (sharedId) return;
    getProfile()
      .then(u => {
        if (!u) return;
        setUser(u);
        if (userHasCompletedProfile(u)) {
          setProfile({ name: u.name, situation: u.situation, values: u.values });
          setScreen("chamber");
        }
      })
      .catch(() => {})
      .finally(() => setCheckingSession(false));
  }, [sharedId]);

  const handleCredential = async (credential) => {
    try {
      const u = await signInWithGoogle(credential);
      setUser(u);
      if (userHasCompletedProfile(u)) {
        setProfile({ name: u.name, situation: u.situation, values: u.values });
        setScreen("chamber");
      } else {
        setScreen("onboarding");
      }
    } catch {
      // sign-in falhou silenciosamente — usuario continua no fluxo anonimo normal
    }
  };

  const handleOnboardingDone = (p) => {
    setProfile(p);
    setScreen("chamber");
    if (user) {
      updateProfile({ situation: p.situation, values: p.values }).then(setUser).catch(() => {});
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setShowProfileSettings(false);
    setProfile({ name: "", situation: "", values: [] });
    setScreen("landing");
  };

  const exitShared = () => {
    window.history.pushState({}, "", "/");
    setSharedId(null);
    setScreen("landing");
  };

  const userBadge = user ? (
    <button className="user-badge" onClick={() => setShowProfileSettings(true)}>
      {(user.customPicture || user.googlePicture) && <img src={user.customPicture || user.googlePicture} alt="" />}
    </button>
  ) : null;

  if (staticPage) {
    return (
      <div className="council-root">
        <div className="grain" />
        <StaticPage page={staticPage} onBack={() => { window.history.back(); setStaticPage(null); }} />
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
          {userBadge}
        </div>
      </header>
      {screen === "landing" && <div className="ambient" style={{ background: "radial-gradient(50% 40% at 50% 30%, rgba(201,169,110,.08), transparent 70%)" }} />}
      {screen === "landing" && (
        <Landing
          onEnter={() => setScreen("onboarding")}
          authSlot={!user && <GoogleSignIn onCredential={handleCredential} />}
          language={language}
        />
      )}
      {screen === "onboarding" && (
        <Onboarding
          onDone={handleOnboardingDone}
          initial={user ? { name: user.name, situation: user.situation, values: user.values } : null}
          language={language}
        />
      )}
      {screen === "chamber" && (
        <Chamber
          profile={profile}
          language={language}
          preloaded={eclipsePreview}
          lifeModeSlot={user?.lifeMode && (
            <LifeModeBanner lifeMode={user.lifeMode} language={language} onDismiss={() => setUser(u => ({ ...u, lifeMode: null }))} />
          )}
        />
      )}
      {screen === "shared" && sharedId && <SharedGate id={sharedId} onExit={exitShared} />}

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
            <span>© 2026</span>
          </span>
        </div>
      </footer>

      {consentBannerVisible && !showCookieSettings && (
        <ConsentBanner
          onAccept={() => { acceptAll(); initAds(); dismissConsentBanner(); }}
          onReject={() => { rejectOptional(); dismissConsentBanner(); }}
          onSettings={() => setShowCookieSettings(true)}
        />
      )}

      {showCookieSettings && (
        <CookieSettings
          onSave={() => { initAds(); setShowCookieSettings(false); dismissConsentBanner(); }}
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
