import { useState, useEffect, useRef } from "react";
import { updateProfile, resizeImageToDataUrl } from "./lib/auth.js";
import { t, LANGUAGES, personaShortName } from "./lib/i18n.js";
import { loadHistory, clearHistory } from "./lib/history.js";
import { PERSONAS } from "./lib/personas.js";
import { joinWaitlist } from "./lib/waitlist.js";

export function GoogleSignIn({ onCredential }) {
  const ref = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;
    const init = () => {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp) => onCredential(resp.credential),
      });
      window.google.accounts.id.renderButton(ref.current, {
        theme: "filled_black", size: "large", shape: "pill", text: "continue_with",
      });
    };
    if (window.google?.accounts?.id) { init(); return; }
    // StrictMode double-invokes effects in dev, and multiple GoogleSignIn instances
    // can mount at once — guard against appending the GSI script twice. The
    // data-gsi-ready flag also prevents a double init() when the script is still
    // loading: without it, the first mount's script.onload and a second mount's
    // addEventListener("load", ...) would both fire once the script resolves.
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      if (existing.dataset.gsiReady) init();
      else existing.addEventListener("load", init, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => { script.dataset.gsiReady = "1"; init(); };
    document.head.appendChild(script);
  }, [onCredential]);

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return null;
  return <div ref={ref} />;
}

const PROFILE_VALUE_KEYS = [
  "value_freedom", "value_security", "value_meaning", "value_ambition",
  "value_love", "value_peace", "value_truth", "value_adventure",
];

const NAV_ITEMS = [
  { key: "profile",       icon: <IconUser /> },
  { key: "notifications", icon: <IconBell /> },
  { key: "privacy",       icon: <IconLock /> },
  { key: "security",      icon: <IconShield /> },
  { key: "preferences",   icon: <IconSliders /> },
  { key: "subscription",  icon: <IconStar /> },
  { key: "history",       icon: <IconClock /> },
];

function IconUser() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
}
function IconBell() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}
function IconLock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function IconSliders() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
      <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/>
      <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/>
      <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function IconStar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
function IconCamera() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function ProgressRing({ pct }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(pct, 100) / 100);
  return (
    <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden="true">
      <circle cx="42" cy="42" r={r} fill="none" stroke="var(--line)" strokeWidth="3" />
      <circle
        cx="42" cy="42" r={r} fill="none" stroke="var(--gold)" strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${circ}`}
        strokeDashoffset={`${offset}`}
        transform="rotate(-90 42 42)"
        style={{ transition: "stroke-dashoffset .8s cubic-bezier(.2,.7,.2,1)" }}
      />
      <text x="42" y="46" textAnchor="middle" fill="var(--gold)"
        fontSize="13" fontFamily="var(--mono)" fontWeight="600">{pct}%</text>
    </svg>
  );
}

const NAV_HEADING_KEY = {
  profile: "your_presence",
  notifications: "notif_heading",
  privacy: "privacy_heading",
  security: "security_heading",
  preferences: "pref_heading",
  subscription: "sub_heading",
  history: "hist_heading",
};

export function ProfileSettings({ user, onSave, onClose, onSignOut, onThemeToggle, onLanguageChange, onRevisit, onViewHistory, theme = "dark", language }) {
  const [activeNav, setActiveNav] = useState("profile");

  // profile tab
  const [situation, setSituation] = useState(user.situation || "");
  const [values, setValues] = useState(user.values || []);
  const [picture, setPicture] = useState(user.customPicture);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedMsg, setSavedMsg] = useState(false);

  // notifications tab
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("council:notif") || "{}"); } catch { return {}; }
  });
  const [notifSaved, setNotifSaved] = useState(false);

  // privacy tab
  const [privacyCleared, setPrivacyCleared] = useState(false);

  // history tab
  const [historyItems, setHistoryItems] = useState(() => loadHistory());
  const [histCleared, setHistCleared] = useState(false);

  // subscription tab
  const [onWaitlist, setOnWaitlist] = useState(() => {
    try { return !!localStorage.getItem("council:premium_waitlist"); } catch { return false; }
  });
  const [lifeModeEnabled, setLifeModeEnabled] = useState(() => {
    try { return !!localStorage.getItem("council:lifemode_enabled"); } catch { return false; }
  });
  const [customPersonas, setCustomPersonas] = useState(() => {
    try {
      const stored = localStorage.getItem("council:custom_personas");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [personaSaved, setPersonaSaved] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistState, setWaitlistState] = useState("idle"); // idle | sending | done | error
  const [waitlistError, setWaitlistError] = useState("");

  const MAX_SITUATION = 140;
  const avatarSrc = picture || user.googlePicture;

  const checks = [
    !!avatarSrc,
    !!user.name,
    situation.trim().length > 0,
    values.length > 0,
  ];
  const pct = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  const toggle = (key) => {
    const canonical = t("en", key);
    setValues(cur =>
      cur.includes(canonical)
        ? cur.filter(x => x !== canonical)
        : cur.length < 3 ? [...cur, canonical] : cur
    );
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError(t(language, "only_image_files")); return; }
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setPicture(dataUrl);
      setError(null);
    } catch {
      setError(t(language, "could_not_read_image"));
    }
  };

  const save = async () => {
    setSaving(true); setError(null); setSavedMsg(false);
    try {
      const updated = await updateProfile({ situation: situation.trim(), values, picture });
      onSave(updated);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2800);
    } catch {
      setError(t(language, "could_not_save"));
    } finally {
      setSaving(false);
    }
  };

  const initials = user.name
    ? user.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()
    : "?";

  const saveNotifPref = (key, val) => {
    const next = { ...notifPrefs, [key]: val };
    setNotifPrefs(next);
    try { localStorage.setItem("council:notif", JSON.stringify(next)); } catch {}
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2000);
  };

  const handleClearLocal = () => {
    const lang = localStorage.getItem("council:lang");
    const th = localStorage.getItem("council:theme");
    Object.keys(localStorage).filter(k => k.startsWith("council:")).forEach(k => localStorage.removeItem(k));
    if (lang) try { localStorage.setItem("council:lang", lang); } catch {}
    if (th) try { localStorage.setItem("council:theme", th); } catch {}
    setHistoryItems([]);
    setPrivacyCleared(true);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistoryItems([]);
    setHistCleared(true);
    setTimeout(() => setHistCleared(false), 2500);
  };

  const handleWaitlist = async () => {
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmed = waitlistEmail.trim();
    if (!trimmed || !EMAIL_RE.test(trimmed)) {
      setWaitlistError(t(language, "sub_email_invalid"));
      return;
    }
    setWaitlistError("");
    setWaitlistState("sending");
    try {
      await joinWaitlist({ email: trimmed, language });
      setWaitlistState("done");
      setOnWaitlist(true);
      try { localStorage.setItem("council:premium_waitlist", "1"); } catch {}
    } catch {
      setWaitlistState("error");
      setWaitlistError(t(language, "sub_email_error"));
    }
  };

  const handleLeaveWaitlist = () => {
    setOnWaitlist(false);
    setWaitlistState("idle");
    setWaitlistEmail("");
    try { localStorage.removeItem("council:premium_waitlist"); } catch {}
  };

  const toggleLifeMode = () => {
    const next = !lifeModeEnabled;
    setLifeModeEnabled(next);
    try {
      if (next) localStorage.setItem("council:lifemode_enabled", "1");
      else { localStorage.removeItem("council:lifemode_enabled"); localStorage.removeItem("council:lifemode_checkin"); }
    } catch {}
  };

  const togglePersona = (id) => {
    const current = customPersonas || PERSONAS.map(p => p.id);
    const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
    if (next.length < 3) return;
    const normalized = next.length === PERSONAS.length ? null : next;
    setCustomPersonas(normalized);
    try {
      if (normalized) localStorage.setItem("council:custom_personas", JSON.stringify(normalized));
      else localStorage.removeItem("council:custom_personas");
    } catch {}
    setPersonaSaved(true);
    setTimeout(() => setPersonaSaved(false), 2000);
  };

  const resetPersonas = () => {
    setCustomPersonas(null);
    try { localStorage.removeItem("council:custom_personas"); } catch {}
    setPersonaSaved(true);
    setTimeout(() => setPersonaSaved(false), 2000);
  };

  const heading = t(language, NAV_HEADING_KEY[activeNav] || "your_presence");

  return (
    <div className="profile-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={t(language, "your_presence")}>
      <div className="profile-dashboard" onClick={e => e.stopPropagation()}>

        {/* ── LEFT NAV ── */}
        <nav className="profile-nav" aria-label={t(language, "your_presence")}>
          <div className="profile-nav-header">
            <div className="profile-nav-avatar">
              {avatarSrc
                ? <img src={avatarSrc} alt="" />
                : <span>{initials}</span>}
            </div>
            <div className="profile-nav-name">{user.name || "—"}</div>
          </div>

          <ul className="profile-nav-list" role="list">
            {NAV_ITEMS.map(item => (
              <li key={item.key} role="listitem">
                <button
                  className={"profile-nav-item" + (activeNav === item.key ? " on" : "")}
                  onClick={() => setActiveNav(item.key)}
                  aria-current={activeNav === item.key ? "page" : undefined}
                >
                  <span className="profile-nav-icon" aria-hidden="true">{item.icon}</span>
                  <span className="profile-nav-label">{t(language, "profile_nav_" + item.key)}</span>
                </button>
              </li>
            ))}
          </ul>

          <button className="profile-nav-signout" onClick={onSignOut}>
            {t(language, "sign_out")}
          </button>
        </nav>

        {/* ── MAIN CONTENT ── */}
        <main className="profile-main">
          <div className="profile-main-header">
            <div className="eyebrow">{heading}</div>
            <button className="profile-close-btn" onClick={onClose} aria-label={t(language, "close")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* ── Profile tab ── */}
          {activeNav === "profile" && (<>
            <div className="profile-avatar-section">
              <div className="profile-avatar-wrap">
                {avatarSrc
                  ? <img src={avatarSrc} alt="" className="profile-avatar-lg" />
                  : <div className="profile-avatar-initials-lg">{initials}</div>}
                <label className="profile-avatar-edit" aria-label={t(language, "change_picture")}>
                  <IconCamera />
                  <input type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
                </label>
              </div>
              <div className="profile-name-block">
                <div className="hint" style={{ fontSize: 11 }}>{t(language, "name_label")}</div>
                <div className="profile-name-display">{user.name || "—"}</div>
              </div>
            </div>

            <div className="field">
              <div className="hint">{t(language, "where_you_stand")}</div>
              <div className="profile-textarea-wrap">
                <textarea
                  rows={3}
                  value={situation}
                  onChange={e => setSituation(e.target.value.slice(0, MAX_SITUATION))}
                  placeholder={t(language, "onb_situation_placeholder")}
                  aria-label={t(language, "where_you_stand")}
                  maxLength={MAX_SITUATION}
                />
                <div
                  className={"profile-char-count" + (situation.length >= MAX_SITUATION ? " at-limit" : "")}
                  aria-live="polite" aria-atomic="true"
                >
                  {situation.length}/{MAX_SITUATION}
                </div>
              </div>
            </div>

            <div className="field">
              <div className="profile-values-header hint">
                <span>{t(language, "protect_up_to_three")}</span>
                <span className="profile-values-count" aria-live="polite">{values.length}/3</span>
              </div>
              <div className="chips profile-chips">
                {PROFILE_VALUE_KEYS.map(key => {
                  const canonical = t("en", key);
                  const on = values.includes(canonical);
                  const disabled = !on && values.length >= 3;
                  return (
                    <button
                      key={key}
                      className={"chip" + (on ? " on" : "") + (disabled ? " chip-disabled" : "")}
                      onClick={() => toggle(key)}
                      aria-pressed={on}
                      aria-disabled={disabled}
                    >
                      {t(language, key)}
                    </button>
                  );
                })}
              </div>
            </div>

            {user.debateHistory?.length > 0 && (
              <div className="field profile-history-mobile">
                <div className="hint">{t(language, "your_journey")}</div>
                <div className="echo-timeline">
                  {user.debateHistory.slice(0, 4).map((h, i) => {
                    const isEclipse = !!h.unanimousVote;
                    return (
                      <button
                        key={h.id || i}
                        type="button"
                        className={"echo-entry" + (isEclipse ? " eclipse" : "")}
                        onClick={() => onViewHistory?.(h.id)}
                        disabled={!h.id}
                      >
                        <div className="echo-dot">{isEclipse ? "☉" : "·"}</div>
                        <div>
                          <div className="echo-q">{h.question}</div>
                          <div className="echo-date">
                            {new Date(h.at).toLocaleDateString(language === "pt" ? "pt-BR" : language)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {error && (
              <div className="err" role="alert" style={{ marginTop: 14, fontSize: 13 }}>{error}</div>
            )}
            {savedMsg && (
              <div className="profile-saved-toast" role="status">{t(language, "changes_saved")}</div>
            )}

            <div className="profile-actions">
              <button className="btn primary profile-btn-primary" onClick={save} disabled={saving}>
                {saving ? t(language, "saving") : t(language, "save_changes")}
              </button>
              <button className="btn small" onClick={onClose}>{t(language, "close")}</button>
            </div>
          </>)}

          {/* ── Notifications tab ── */}
          {activeNav === "notifications" && (<>
            <div className="prof-section">
              <div className="consent-row">
                <div>
                  <div className="consent-label">{t(language, "notif_digest")}</div>
                  <div className="consent-desc">{t(language, "notif_digest_desc")}</div>
                </div>
                <button
                  className={"consent-toggle" + (notifPrefs.digest ? " on" : "")}
                  onClick={() => saveNotifPref("digest", !notifPrefs.digest)}
                  aria-pressed={!!notifPrefs.digest}
                >
                  {notifPrefs.digest ? "✓" : "○"}
                </button>
              </div>
              <div className="consent-row">
                <div>
                  <div className="consent-label">{t(language, "notif_lifemode")}</div>
                  <div className="consent-desc">{t(language, "notif_lifemode_desc")}</div>
                </div>
                <button
                  className={"consent-toggle" + (notifPrefs.lifeMode ? " on" : "")}
                  onClick={() => saveNotifPref("lifeMode", !notifPrefs.lifeMode)}
                  aria-pressed={!!notifPrefs.lifeMode}
                >
                  {notifPrefs.lifeMode ? "✓" : "○"}
                </button>
              </div>
              <div className="consent-row">
                <div>
                  <div className="consent-label">{t(language, "notif_features")}</div>
                  <div className="consent-desc">{t(language, "notif_features_desc")}</div>
                </div>
                <button
                  className={"consent-toggle" + (notifPrefs.features ? " on" : "")}
                  onClick={() => saveNotifPref("features", !notifPrefs.features)}
                  aria-pressed={!!notifPrefs.features}
                >
                  {notifPrefs.features ? "✓" : "○"}
                </button>
              </div>
            </div>
            {notifSaved && (
              <div className="profile-saved-toast" role="status">{t(language, "notif_saved")}</div>
            )}
          </>)}

          {/* ── Privacy tab ── */}
          {activeNav === "privacy" && (<>
            <div className="prof-section">
              <div className="hint" style={{ marginBottom: 8 }}>{t(language, "privacy_on_device")}</div>
              <div style={{ fontSize: 13, color: "var(--ivory-dim)", lineHeight: 1.6, marginBottom: 16 }}>
                {t(language, "privacy_on_device_items")}
              </div>
              {user && (
                <>
                  <div className="hint" style={{ marginBottom: 8 }}>{t(language, "privacy_in_cloud")}</div>
                  <div style={{ fontSize: 13, color: "var(--ivory-dim)", lineHeight: 1.6 }}>
                    {t(language, "privacy_in_cloud_items")}
                  </div>
                </>
              )}
            </div>
            <div className="prof-section">
              {privacyCleared
                ? <div className="profile-saved-toast" role="status">{t(language, "privacy_cleared")}</div>
                : (
                  <button className="btn small" onClick={handleClearLocal}>
                    {t(language, "privacy_clear_local")}
                  </button>
                )
              }
            </div>
            <div className="prof-section">
              <button
                className="btn small"
                style={{ marginBottom: 16 }}
                onClick={() => window.open("/privacy", "_blank")}
              >
                {t(language, "privacy_read_policy")}
              </button>
              <div style={{ fontSize: 12, color: "var(--ivory-faint)", lineHeight: 1.6 }}>
                {t(language, "privacy_deletion_contact")}<br />
                <a href="mailto:cesarnogueira1210@gmail.com" style={{ color: "var(--gold)", textDecoration: "none" }}>
                  cesarnogueira1210@gmail.com
                </a>
              </div>
            </div>
          </>)}

          {/* ── Security tab ── */}
          {activeNav === "security" && (<>
            <div className="prof-section">
              <div className="hint" style={{ marginBottom: 12 }}>{t(language, "security_active_session")}</div>
              <div className="prof-session-card">
                <div className="prof-session-name">{t(language, "security_signed_in_as", user.name || "—")}</div>
                <div className="prof-session-sub">{t(language, "security_this_device")}</div>
              </div>
              <button className="btn small" onClick={onSignOut} style={{ marginTop: 8 }}>
                {t(language, "sign_out")}
              </button>
            </div>
            <div className="prof-section">
              <div className="hint" style={{ marginBottom: 8 }}>{t(language, "security_deletion_heading")}</div>
              <div style={{ fontSize: 12, color: "var(--ivory-faint)", lineHeight: 1.7 }}>
                {t(language, "security_deletion_desc")}<br />
                <a href="mailto:cesarnogueira1210@gmail.com" style={{ color: "var(--gold)", textDecoration: "none" }}>
                  cesarnogueira1210@gmail.com
                </a>
              </div>
            </div>
          </>)}

          {/* ── Preferences tab ── */}
          {activeNav === "preferences" && (<>
            <div className="prof-section">
              <div className="hint" style={{ marginBottom: 12 }}>{t(language, "pref_appearance")}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className={"btn small" + (theme === "dark" ? " primary" : "")}
                  onClick={() => theme !== "dark" && onThemeToggle?.()}
                  aria-pressed={theme === "dark"}
                >
                  {t(language, "pref_dark")}
                </button>
                <button
                  className={"btn small" + (theme === "light" ? " primary" : "")}
                  onClick={() => theme !== "light" && onThemeToggle?.()}
                  aria-pressed={theme === "light"}
                >
                  {t(language, "pref_light")}
                </button>
              </div>
            </div>
            <div className="prof-section">
              <div className="hint" style={{ marginBottom: 12 }}>{t(language, "pref_language_label")}</div>
              <div className="lang-selector">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    className={"lang-chip" + (l.code === language ? " on" : "")}
                    onClick={() => onLanguageChange?.(l.code)}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </>)}

          {/* ── Subscription tab ── */}
          {activeNav === "subscription" && (<>
            <div className="prof-section" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: 18 }}>{t(language, "sub_heading")}</div>
              <span className="prof-plan-badge">{onWaitlist ? t(language, "sub_premium_active") : t(language, "sub_current_plan")}</span>
            </div>

            <div className="prof-section">
              <div className="hint" style={{ marginBottom: 12 }}>{t(language, "sub_included")}</div>
              {["sub_free_1","sub_free_2","sub_free_3","sub_free_4"].map(k => (
                <div key={k} className="prof-feat-row">
                  <span className="prof-feat-check">✓</span>
                  <span>{t(language, k)}</span>
                </div>
              ))}
            </div>

            {/* Not on waitlist: premium card with email signup */}
            {!onWaitlist && waitlistState !== "done" && (
              <div className="prof-section prof-premium-card">
                <div className="prof-premium-header">
                  <span className="prof-premium-label">{t(language, "sub_teaser_label")}</span>
                </div>
                <div className="prof-premium-sub">{t(language, "sub_teaser_sub")}</div>
                <div className="prof-premium-features">
                  {[
                    { key: "sub_premium_1", icon: "∞" },
                    { key: "sub_premium_2", icon: "◈" },
                    { key: "sub_premium_3", icon: "✦" },
                    { key: "sub_premium_4", icon: "⊠" },
                  ].map(({ key, icon }) => (
                    <div key={key} className="prof-feat-row prof-feat-row--premium">
                      <span className="prof-feat-premium-icon">{icon}</span>
                      <span>{t(language, key)}</span>
                    </div>
                  ))}
                </div>
                <div className="prof-waitlist-form">
                  <input
                    type="email"
                    className={"prof-waitlist-input" + (waitlistError ? " error" : "")}
                    placeholder={t(language, "sub_email_placeholder")}
                    value={waitlistEmail}
                    onChange={e => { setWaitlistEmail(e.target.value); setWaitlistError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleWaitlist()}
                    disabled={waitlistState === "sending"}
                    aria-label={t(language, "sub_notify_me")}
                  />
                  <button
                    className="btn small prof-waitlist-btn"
                    onClick={handleWaitlist}
                    disabled={waitlistState === "sending"}
                  >
                    {waitlistState === "sending"
                      ? t(language, "sub_email_sending")
                      : t(language, "sub_email_join")}
                  </button>
                  {waitlistError && (
                    <div className="prof-waitlist-error" role="alert">{waitlistError}</div>
                  )}
                </div>
              </div>
            )}

            {/* Waitlist confirmed (just joined) */}
            {!onWaitlist && waitlistState === "done" && (
              <div className="prof-section">
                <div className="prof-waitlist-done">
                  <span className="prof-feat-check">✓</span>
                  {t(language, "sub_on_waitlist")}
                </div>
              </div>
            )}

            {/* Premium active: full feature panel */}
            {onWaitlist && (<>
              <div className="prof-section">
                <div className="hint" style={{ marginBottom: 6 }}>{t(language, "sub_lifemode_heading")}</div>
                <div style={{ fontSize: 12, color: "var(--ivory-faint)", lineHeight: 1.6, marginBottom: 12 }}>
                  {t(language, "sub_lifemode_desc")}
                </div>
                <div className="consent-row" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 0 }}>
                  <div style={{ fontSize: 13, color: "var(--ivory-dim)" }}>
                    {lifeModeEnabled ? t(language, "sub_lifemode_active") : t(language, "sub_lifemode_enable")}
                  </div>
                  <button
                    className={"consent-toggle" + (lifeModeEnabled ? " on" : "")}
                    onClick={toggleLifeMode}
                    aria-pressed={lifeModeEnabled}
                  >
                    {lifeModeEnabled ? "✓" : "○"}
                  </button>
                </div>
              </div>

              <div className="prof-section">
                <div className="hint" style={{ marginBottom: 6 }}>{t(language, "sub_persona_heading")}</div>
                <div style={{ fontSize: 12, color: "var(--ivory-faint)", lineHeight: 1.6, marginBottom: 12 }}>
                  {t(language, "sub_persona_desc")}
                </div>
                <div className="sub-persona-grid">
                  {PERSONAS.map(p => {
                    const active = !customPersonas || customPersonas.includes(p.id);
                    const activeCount = customPersonas ? customPersonas.length : PERSONAS.length;
                    const atMin = active && activeCount <= 3;
                    return (
                      <button
                        key={p.id}
                        className={"sub-persona-chip" + (active ? " on" : "")}
                        style={{ "--persona-color": p.color }}
                        onClick={() => !atMin && togglePersona(p.id)}
                        aria-pressed={active}
                        disabled={atMin}
                      >
                        <span className="sub-persona-dot" style={{ background: active ? p.color : "var(--line)" }} />
                        <span>{personaShortName(language, p.id)}</span>
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                  {customPersonas && (
                    <button className="btn small" onClick={resetPersonas}>
                      {t(language, "sub_persona_all")}
                    </button>
                  )}
                  {personaSaved && (
                    <div style={{ fontSize: 12, color: "var(--gold)", fontFamily: "var(--mono)" }}>
                      {t(language, "sub_persona_saved")}
                    </div>
                  )}
                </div>
              </div>

              <div className="prof-section">
                <div className="hint" style={{ marginBottom: 6 }}>{t(language, "sub_email_heading")}</div>
                <div style={{ fontSize: 12, color: "var(--ivory-faint)", lineHeight: 1.6, marginBottom: 10 }}>
                  {t(language, "sub_email_desc")}
                </div>
                <div className="prof-feat-row">
                  <span className="prof-feat-check">✓</span>
                  <span style={{ fontSize: 12, color: "var(--ivory-dim)" }}>{t(language, "email_verdict_btn")} — {t(language, "sub_premium_4").toLowerCase()}</span>
                </div>
              </div>

              <div className="prof-section">
                <button className="btn small" onClick={handleLeaveWaitlist} aria-pressed={true}>
                  {t(language, "sub_leave_waitlist")}
                </button>
              </div>
            </>)}
          </>)}

          {/* ── History tab ── */}
          {activeNav === "history" && (<>
            {historyItems.length === 0
              ? (
                <div className="prof-hist-empty">
                  {histCleared
                    ? t(language, "hist_cleared")
                    : t(language, "hist_empty")}
                </div>
              )
              : (<>
                <div className="prof-section">
                  {historyItems.map((h, i) => (
                    <div key={h.id || i} className="prof-hist-entry">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="prof-hist-q">{h.question}</div>
                        <div className="prof-hist-meta">
                          {new Date(h.timestamp || h.at || 0).toLocaleDateString(language === "pt" ? "pt-BR" : language)}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        {h.id && onViewHistory && (
                          <button
                            className="btn small"
                            style={{ fontSize: 10, padding: "8px 14px" }}
                            onClick={() => onViewHistory(h.id)}
                          >
                            {t(language, "hist_view")}
                          </button>
                        )}
                        {onRevisit && (
                          <button
                            className="btn small"
                            style={{ fontSize: 10, padding: "8px 14px" }}
                            onClick={() => onRevisit(h.question)}
                          >
                            {t(language, "hist_revisit")}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn small" onClick={handleClearHistory}>
                  {t(language, "hist_clear")}
                </button>
                {histCleared && (
                  <div className="profile-saved-toast" role="status" style={{ marginTop: 12 }}>
                    {t(language, "hist_cleared")}
                  </div>
                )}
              </>)
            }
          </>)}
        </main>

        {/* ── RIGHT SIDEBAR ── */}
        <aside className="profile-aside" aria-label={t(language, "profile_completeness")}>
          <div className="profile-ring-wrap">
            <ProgressRing pct={pct} />
            <div className="profile-ring-label">{t(language, "profile_completeness")}</div>
          </div>

          <div className="profile-checklist">
            {[
              { key: "profile_check_photo",  done: checks[0] },
              { key: "profile_check_name",   done: checks[1] },
              { key: "profile_check_about",  done: checks[2] },
              { key: "profile_check_values", done: checks[3] },
            ].map(c => (
              <div key={c.key} className={"profile-check-item" + (c.done ? " done" : "")}>
                <span className="profile-check-icon" aria-hidden="true">
                  {c.done ? <IconCheck /> : null}
                </span>
                <span>{t(language, c.key)}</span>
              </div>
            ))}
          </div>

          {user.debateHistory?.length > 0 && (
            <div className="profile-aside-history">
              <div className="hint" style={{ marginBottom: 8, fontSize: 11 }}>{t(language, "your_journey")}</div>
              <div className="echo-timeline">
                {user.debateHistory.slice(0, 5).map((h, i) => {
                  const isEclipse = !!h.unanimousVote;
                  return (
                    <button
                      key={h.id || i}
                      type="button"
                      className={"echo-entry" + (isEclipse ? " eclipse" : "")}
                      onClick={() => onViewHistory?.(h.id)}
                      disabled={!h.id}
                    >
                      <div className="echo-dot">{isEclipse ? "☉" : "·"}</div>
                      <div>
                        <div className="echo-q">{h.question}</div>
                        <div className="echo-date">
                          {new Date(h.at).toLocaleDateString(language === "pt" ? "pt-BR" : language)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
