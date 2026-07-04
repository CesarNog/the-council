import { useState } from "react";
import { Sigil } from "./components.jsx";
import { byId } from "./lib/personas.js";
import { updateProfile } from "./lib/auth.js";
import { t } from "./lib/i18n.js";

export function LifeModeBanner({ lifeMode, onDismiss, language }) {
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
          {lifeMode.turns.map((turn, i) => {
            const p = byId[turn.p] || persona;
            return (
              <div className="life-mode-turn" key={i} style={{ color: p.color }}>
                <span className="sig"><Sigil id={p.id} /></span>
                <span>{turn.t}</span>
              </div>
            );
          })}
          <button className="btn small" onClick={dismiss} style={{ marginTop: 14 }}>{t(language, "dismiss")}</button>
        </div>
      )}
    </div>
  );
}
