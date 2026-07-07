import { useState } from "react";
import { acceptAll, rejectOptional, getConsent, setConsent, hasConsentDecision } from "./lib/consent.js";
import { t } from "./lib/i18n.js";

export function useConsentBannerVisible() {
  const [visible, setVisible] = useState(() => !hasConsentDecision());
  const dismiss = () => setVisible(false);
  return [visible, dismiss];
}

export function ConsentBanner({ onAccept, onReject, onSettings, language = "en" }) {
  return (
    <div className="consent-banner" role="dialog" aria-label={t(language, "footer_cookie_settings")}>
      <div className="consent-banner-inner">
        <p className="consent-text">
          {t(language, "consent_text")}
        </p>
        <div className="consent-actions">
          <button className="btn small" onClick={onSettings}>{t(language, "consent_manage")}</button>
          <button className="btn small" onClick={onReject}>{t(language, "consent_necessary_only")}</button>
          <button className="btn primary small" onClick={onAccept}>{t(language, "consent_accept_all")}</button>
        </div>
      </div>
    </div>
  );
}

export function CookieSettings({ onSave, onClose, language = "en" }) {
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
        <div className="eyebrow">{t(language, "footer_cookie_settings")}</div>
        <h2 className="serif" style={{ fontSize: 20, marginBottom: 20 }}>{t(language, "cookie_settings_heading")}</h2>

        <div className="consent-row">
          <div>
            <div className="consent-label">{t(language, "consent_necessary_label")}</div>
            <div className="consent-desc">{t(language, "consent_necessary_desc")}</div>
          </div>
          <div className="consent-toggle on disabled" aria-label={t(language, "consent_always_enabled")}>✓</div>
        </div>

        <div className="consent-row">
          <div>
            <div className="consent-label">{t(language, "consent_analytics_label")}</div>
            <div className="consent-desc">{t(language, "consent_analytics_desc")}</div>
          </div>
          <button
            className={`consent-toggle${analytics ? " on" : ""}`}
            onClick={() => setAnalytics(v => !v)}
            aria-pressed={analytics}
            aria-label={t(language, "consent_toggle_analytics")}
          >
            {analytics ? "✓" : "○"}
          </button>
        </div>

        <div className="consent-row">
          <div>
            <div className="consent-label">{t(language, "consent_advertising_label")}</div>
            <div className="consent-desc">{t(language, "consent_advertising_desc")}</div>
          </div>
          <button
            className={`consent-toggle${advertising ? " on" : ""}`}
            onClick={() => setAdvertising(v => !v)}
            aria-pressed={advertising}
            aria-label={t(language, "consent_toggle_advertising")}
          >
            {advertising ? "✓" : "○"}
          </button>
        </div>

        <div className="consent-actions" style={{ marginTop: 24 }}>
          <button className="btn small" onClick={onClose}>{t(language, "cancel")}</button>
          <button className="btn primary small" onClick={save}>{t(language, "save_preferences")}</button>
        </div>
      </div>
    </div>
  );
}
