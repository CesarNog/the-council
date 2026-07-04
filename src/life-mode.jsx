import { useState } from "react";
import { Sigil } from "./components.jsx";
import { byId } from "./lib/personas.js";
import { updateProfile } from "./lib/auth.js";

export function LifeModeBanner({ lifeMode, onDismiss }) {
  const [open, setOpen] = useState(false);
  if (!lifeMode) return null;

  const persona = byId[lifeMode.persona];
  if (!persona) return null; // dado inesperado da API — nao quebra a tela

  const dismiss = () => {
    updateProfile({ dismissLifeMode: true }).catch(() => {});
    onDismiss();
  };

  return (
    <div className="life-mode" style={{ color: persona.color }}>
      {!open ? (
        <button className="life-mode-teaser" onClick={() => setOpen(true)}>
          <span className="sig"><Sigil id={persona.id} /></span>
          <span className="serif" style={{ fontStyle: "italic" }}>{lifeMode.teaser}</span>
        </button>
      ) : (
        <div className="life-mode-open">
          {lifeMode.turns.map((t, i) => {
            const p = byId[t.p] || persona;
            return (
              <div className="life-mode-turn" key={i} style={{ color: p.color }}>
                <span className="sig"><Sigil id={p.id} /></span>
                <span>{t.t}</span>
              </div>
            );
          })}
          <button className="btn small" onClick={dismiss} style={{ marginTop: 14 }}>Dismiss</button>
        </div>
      )}
    </div>
  );
}
