import { useState } from "react";
import { joinWaitlist } from "../../lib/waitlist.js";
import { t } from "../../lib/i18n.js";

const PREMIUM_FEATURES = [
  { key: "sub_premium_1", icon: "∞" },
  { key: "sub_premium_2", icon: "◈" },
  { key: "sub_premium_3", icon: "✦" },
  { key: "sub_premium_4", icon: "⊠" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function PremiumTeaser({ language }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | sending | done | error
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !EMAIL_RE.test(trimmed)) {
      setError(t(language, "sub_email_invalid"));
      return;
    }
    setError("");
    setState("sending");
    try {
      await joinWaitlist({ email: trimmed, language });
      setState("done");
    } catch {
      setState("error");
      setError(t(language, "sub_email_error"));
    }
  };

  return (
    <section className="landing-section landing-premium-teaser" aria-labelledby="premium-teaser-title">
      <div className="landing-premium-glow" aria-hidden="true" />
      <div className="landing-premium-inner">
        <div className="landing-premium-badge">{t(language, "sub_teaser_label")}</div>
        <h2 id="premium-teaser-title" className="landing-section-title" style={{ marginBottom: 8 }}>
          {t(language, "sub_heading")}
        </h2>
        <p className="landing-section-sub">{t(language, "sub_teaser_sub")}</p>

        <ul className="landing-premium-features" aria-label="Premium features">
          {PREMIUM_FEATURES.map(({ key, icon }) => (
            <li key={key} className="landing-premium-feat">
              <span className="landing-premium-feat-icon" aria-hidden="true">{icon}</span>
              <span>{t(language, key)}</span>
            </li>
          ))}
        </ul>

        {state === "done" ? (
          <div className="landing-premium-done" role="status">
            <span className="landing-premium-check" aria-hidden="true">✓</span>
            {t(language, "sub_on_waitlist")}
          </div>
        ) : (
          <form className="landing-premium-form" onSubmit={handleSubmit} noValidate>
            <input
              type="email"
              className={"landing-premium-input" + (error ? " error" : "")}
              placeholder={t(language, "sub_email_placeholder")}
              value={email}
              onChange={e => { setEmail(e.target.value); setError(""); setState("idle"); }}
              disabled={state === "sending"}
              aria-label={t(language, "sub_notify_me")}
            />
            <button
              type="submit"
              className="btn primary landing-premium-btn"
              disabled={state === "sending"}
            >
              {state === "sending"
                ? t(language, "sub_email_sending")
                : t(language, "sub_notify_me")}
            </button>
            {error && <div className="landing-premium-error" role="alert">{error}</div>}
          </form>
        )}
      </div>
    </section>
  );
}
