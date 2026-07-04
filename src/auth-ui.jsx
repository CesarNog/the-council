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

const PROFILE_VALUE_KEYS = ["value_freedom", "value_security", "value_meaning", "value_ambition", "value_love", "value_peace", "value_truth", "value_adventure"];

export function ProfileSettings({ user, onSave, onClose, onSignOut, language }) {
  const [situation, setSituation] = useState(user.situation || "");
  const [values, setValues] = useState(user.values || []);
  const [picture, setPicture] = useState(user.customPicture);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const toggle = key => {
    const canonical = t("en", key);
    setValues(cur =>
      cur.includes(canonical) ? cur.filter(x => x !== canonical) : cur.length < 3 ? [...cur, canonical] : cur);
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
    setSaving(true); setError(null);
    try {
      const updated = await updateProfile({ situation: situation.trim(), values, picture });
      onSave(updated);
    } catch {
      setError(t(language, "could_not_save"));
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = picture || user.googlePicture;

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        <div className="eyebrow">{t(language, "your_presence")}</div>

        <div className="avatar-row">
          {avatarSrc && <img src={avatarSrc} alt="" className="avatar" />}
          <label className="btn small">
            {t(language, "change_picture")}
            <input type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
          </label>
        </div>

        <div className="field">
          <div className="hint">{t(language, "name_label")}</div>
          <div className="serif" style={{ fontSize: 18 }}>{user.name}</div>
        </div>

        <div className="field">
          <div className="hint">{t(language, "where_you_stand")}</div>
          <textarea rows={2} value={situation} onChange={e => setSituation(e.target.value)} placeholder={t(language, "onb_situation_placeholder")} />
        </div>

        <div className="field">
          <div className="hint">{t(language, "protect_up_to_three")}</div>
          <div className="chips">
            {PROFILE_VALUE_KEYS.map(key => (
              <button key={key} className={"chip" + (values.includes(t("en", key)) ? " on" : "")} onClick={() => toggle(key)}>{t(language, key)}</button>
            ))}
          </div>
        </div>

        {error && <div className="err" style={{ marginTop: 12, fontSize: 13 }}>{error}</div>}

        <div className="actions" style={{ marginTop: 30 }}>
          <button className="btn primary" onClick={save} disabled={saving}>{saving ? t(language, "saving") : t(language, "save")}</button>
          <button className="btn small" onClick={onClose}>{t(language, "close")}</button>
          <button className="btn small" onClick={onSignOut}>{t(language, "sign_out")}</button>
        </div>
      </div>
    </div>
  );
}
