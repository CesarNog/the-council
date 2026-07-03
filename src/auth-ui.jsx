import { useState, useEffect, useRef } from "react";
import { updateProfile, resizeImageToDataUrl } from "./lib/auth.js";

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

const PROFILE_VALUES = ["Freedom", "Security", "Meaning", "Ambition", "Love", "Peace", "Truth", "Adventure"];

export function ProfileSettings({ user, onSave, onClose, onSignOut }) {
  const [situation, setSituation] = useState(user.situation || "");
  const [values, setValues] = useState(user.values || []);
  const [picture, setPicture] = useState(user.customPicture);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const toggle = v => setValues(cur =>
    cur.includes(v) ? cur.filter(x => x !== v) : cur.length < 3 ? [...cur, v] : cur);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Only image files."); return; }
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setPicture(dataUrl);
      setError(null);
    } catch {
      setError("Could not read that image.");
    }
  };

  const save = async () => {
    setSaving(true); setError(null);
    try {
      const updated = await updateProfile({ situation: situation.trim(), values, picture });
      onSave(updated);
    } catch {
      setError("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = picture || user.googlePicture;

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        <div className="eyebrow">Your presence at the table</div>

        <div className="avatar-row">
          {avatarSrc && <img src={avatarSrc} alt="" className="avatar" />}
          <label className="btn small">
            Change picture
            <input type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
          </label>
        </div>

        <div className="field">
          <div className="hint">Name</div>
          <div className="serif" style={{ fontSize: 18 }}>{user.name}</div>
        </div>

        <div className="field">
          <div className="hint">Where you stand right now</div>
          <textarea rows={2} value={situation} onChange={e => setSituation(e.target.value)} placeholder="e.g. Product manager, 31, restless" />
        </div>

        <div className="field">
          <div className="hint">What you protect above all — up to three</div>
          <div className="chips">
            {PROFILE_VALUES.map(v => (
              <button key={v} className={"chip" + (values.includes(v) ? " on" : "")} onClick={() => toggle(v)}>{v}</button>
            ))}
          </div>
        </div>

        {error && <div className="err" style={{ marginTop: 12, fontSize: 13 }}>{error}</div>}

        <div className="actions" style={{ marginTop: 30 }}>
          <button className="btn primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          <button className="btn small" onClick={onClose}>Close</button>
          <button className="btn small" onClick={onSignOut}>Sign out</button>
        </div>
      </div>
    </div>
  );
}
