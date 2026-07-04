import { useState, useEffect } from "react";
import { Landing, Onboarding, Chamber, ErrorBoundary } from "./components.jsx";
import { GoogleSignIn, ProfileSettings } from "./auth-ui.jsx";
import { LifeModeBanner } from "./life-mode.jsx";
import { signInWithGoogle, signOut, getProfile, updateProfile } from "./lib/auth.js";

function sharedIdFromPath() {
  const m = typeof window !== "undefined" ? window.location.pathname.match(/^\/r\/([a-z0-9]{4,20})$/i) : null;
  return m ? m[1] : null;
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
  const [screen, setScreen] = useState(sharedId ? "shared" : "landing"); // landing | onboarding | chamber | shared
  const [profile, setProfile] = useState({ name: "", situation: "", values: [] });
  const [user, setUser] = useState(null); // null = anonimo ou ainda carregando
  const [checkingSession, setCheckingSession] = useState(!sharedId);
  const [showProfileSettings, setShowProfileSettings] = useState(false);

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

  if (checkingSession) return <div className="council-root"><div className="grain" /></div>;

  return (
    <div className="council-root">
      <div className="grain" />
      {screen === "landing" && <div className="ambient" style={{ background: "radial-gradient(50% 40% at 50% 30%, rgba(201,169,110,.08), transparent 70%)" }} />}
      {screen === "landing" && (
        <Landing
          onEnter={() => setScreen("onboarding")}
          authSlot={!user && <GoogleSignIn onCredential={handleCredential} />}
        />
      )}
      {screen === "onboarding" && (
        <Onboarding
          onDone={handleOnboardingDone}
          initial={user ? { name: user.name, situation: user.situation, values: user.values } : null}
        />
      )}
      {screen === "chamber" && (
        <Chamber
          profile={profile}
          userSlot={userBadge}
          lifeModeSlot={user?.lifeMode && (
            <LifeModeBanner lifeMode={user.lifeMode} onDismiss={() => setUser(u => ({ ...u, lifeMode: null }))} />
          )}
        />
      )}
      {screen === "shared" && sharedId && <SharedGate id={sharedId} onExit={exitShared} />}

      {showProfileSettings && user && (
        <ProfileSettings
          user={user}
          onSave={(u) => { setUser(u); setProfile(p => ({ ...p, situation: u.situation, values: u.values })); setShowProfileSettings(false); }}
          onClose={() => setShowProfileSettings(false)}
          onSignOut={handleSignOut}
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
