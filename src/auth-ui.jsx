import { useState, useEffect, useRef } from "react";
import { updateProfile, resizeImageToDataUrl } from "./lib/auth.js";
import { t } from "./lib/i18n.js";

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
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = init;
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
  { key: "notifications", icon: <IconBell />,   soon: true },
  { key: "privacy",       icon: <IconLock />,   soon: true },
  { key: "security",      icon: <IconShield />, soon: true },
  { key: "preferences",   icon: <IconSliders />,soon: true },
  { key: "subscription",  icon: <IconStar />,   soon: true },
  { key: "history",       icon: <IconClock />,  soon: true },
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

export function ProfileSettings({ user, onSave, onClose, onSignOut, language }) {
  const [activeNav, setActiveNav] = useState("profile");
  const [situation, setSituation] = useState(user.situation || "");
  const [values, setValues] = useState(user.values || []);
  const [picture, setPicture] = useState(user.customPicture);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedMsg, setSavedMsg] = useState(false);

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
                  className={"profile-nav-item" + (activeNav === item.key ? " on" : "") + (item.soon ? " soon" : "")}
                  onClick={() => !item.soon && setActiveNav(item.key)}
                  aria-current={activeNav === item.key ? "page" : undefined}
                  aria-disabled={item.soon ? "true" : undefined}
                  tabIndex={item.soon ? -1 : 0}
                >
                  <span className="profile-nav-icon" aria-hidden="true">{item.icon}</span>
                  <span className="profile-nav-label">{t(language, "profile_nav_" + item.key)}</span>
                  {item.soon && (
                    <span className="profile-nav-soon">{t(language, "coming_soon")}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          <button className="profile-nav-signout" onClick={onSignOut}>
            {t(language, "sign_out")}
          </button>
        </nav>

        {/* ── MAIN FORM ── */}
        <main className="profile-main">
          <div className="profile-main-header">
            <div className="eyebrow">{t(language, "your_presence")}</div>
            <button className="profile-close-btn" onClick={onClose} aria-label={t(language, "close")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Avatar */}
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

          {/* Situation */}
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

          {/* Values */}
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

          {/* Debate history (mobile only — also shown in aside on desktop) */}
          {user.debateHistory?.length > 0 && (
            <div className="field profile-history-mobile">
              <div className="hint">{t(language, "your_journey")}</div>
              <div className="echo-timeline">
                {user.debateHistory.slice(0, 4).map((h, i) => {
                  const isEclipse = !!h.unanimousVote;
                  return (
                    <div key={h.id || i} className={"echo-entry" + (isEclipse ? " eclipse" : "")}>
                      <div className="echo-dot">{isEclipse ? "☉" : "·"}</div>
                      <div>
                        <div className="echo-q">{h.question}</div>
                        <div className="echo-date">
                          {new Date(h.at).toLocaleDateString(language === "pt" ? "pt-BR" : language)}
                        </div>
                      </div>
                    </div>
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
                    <div key={h.id || i} className={"echo-entry" + (isEclipse ? " eclipse" : "")}>
                      <div className="echo-dot">{isEclipse ? "☉" : "·"}</div>
                      <div>
                        <div className="echo-q">{h.question}</div>
                        <div className="echo-date">
                          {new Date(h.at).toLocaleDateString(language === "pt" ? "pt-BR" : language)}
                        </div>
                      </div>
                    </div>
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
