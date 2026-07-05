import { useState } from "react";
import { acceptAll, rejectOptional, getConsent, setConsent, hasConsentDecision } from "./lib/consent.js";

export function useConsentBannerVisible() {
  const [visible, setVisible] = useState(() => !hasConsentDecision());
  const dismiss = () => setVisible(false);
  return [visible, dismiss];
}

export function ConsentBanner({ onAccept, onReject, onSettings }) {
  return (
    <div className="consent-banner" role="dialog" aria-label="Cookie consent">
      <div className="consent-banner-inner">
        <p className="consent-text">
          The Council uses cookies to remember your preferences and understand how people use the product.
          We don't sell your data.
        </p>
        <div className="consent-actions">
          <button className="btn small" onClick={onSettings}>Manage</button>
          <button className="btn small" onClick={onReject}>Necessary only</button>
          <button className="btn primary small" onClick={onAccept}>Accept all</button>
        </div>
      </div>
    </div>
  );
}

export function CookieSettings({ onSave, onClose }) {
  const current = getConsent();
  const [analytics, setAnalytics] = useState(current.analytics);
  const [advertising, setAdvertising] = useState(current.advertising);

  const save = () => {
    setConsent({ analytics, advertising });
    onSave?.();
  };

  return (
    <div className="consent-overlay" onClick={onClose}>
      <div className="consent-panel" onClick={e => e.stopPropagation()}>
        <div className="eyebrow">Cookie Settings</div>
        <h2 className="serif" style={{ fontSize: 20, marginBottom: 20 }}>Manage your preferences</h2>

        <div className="consent-row">
          <div>
            <div className="consent-label">Necessary</div>
            <div className="consent-desc">Session memory, language preference. Always on.</div>
          </div>
          <div className="consent-toggle on disabled" aria-label="Always enabled">✓</div>
        </div>

        <div className="consent-row">
          <div>
            <div className="consent-label">Analytics</div>
            <div className="consent-desc">Helps us understand how the product is used. Never tied to your identity.</div>
          </div>
          <button
            className={`consent-toggle${analytics ? " on" : ""}`}
            onClick={() => setAnalytics(v => !v)}
            aria-pressed={analytics}
            aria-label="Toggle analytics"
          >
            {analytics ? "✓" : "○"}
          </button>
        </div>

        <div className="consent-row">
          <div>
            <div className="consent-label">Advertising</div>
            <div className="consent-desc">Allows discreet ads that help keep The Council free.</div>
          </div>
          <button
            className={`consent-toggle${advertising ? " on" : ""}`}
            onClick={() => setAdvertising(v => !v)}
            aria-pressed={advertising}
            aria-label="Toggle advertising"
          >
            {advertising ? "✓" : "○"}
          </button>
        </div>

        <div className="consent-actions" style={{ marginTop: 24 }}>
          <button className="btn small" onClick={onClose}>Cancel</button>
          <button className="btn primary small" onClick={save}>Save preferences</button>
        </div>
      </div>
    </div>
  );
}
