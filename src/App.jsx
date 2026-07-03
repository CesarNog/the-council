import { useState, useEffect } from "react";
import { Landing, Onboarding, Chamber, ErrorBoundary } from "./components.jsx";

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

function TheCouncilApp() {
  const [sharedId, setSharedId] = useState(sharedIdFromPath);
  const [screen, setScreen] = useState(sharedId ? "shared" : "landing"); // landing | onboarding | chamber | shared
  const [profile, setProfile] = useState({ name: "", situation: "", values: [] });

  const exitShared = () => {
    window.history.pushState({}, "", "/");
    setSharedId(null);
    setScreen("landing");
  };

  return (
    <div className="council-root">
      <div className="grain" />
      {screen === "landing" && <div className="ambient" style={{ background: "radial-gradient(50% 40% at 50% 30%, rgba(201,169,110,.08), transparent 70%)" }} />}
      {screen === "landing" && <Landing onEnter={() => setScreen("onboarding")} />}
      {screen === "onboarding" && <Onboarding onDone={p => { setProfile(p); setScreen("chamber"); }} />}
      {screen === "chamber" && <Chamber profile={profile} />}
      {screen === "shared" && sharedId && <SharedGate id={sharedId} onExit={exitShared} />}
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
