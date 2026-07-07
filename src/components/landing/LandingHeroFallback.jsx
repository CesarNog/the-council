import { useState } from "react";
import { PERSONAS } from "../../lib/personas.js";
import { Sigil } from "../../lib/sigil.jsx";
import { CouncilLogo } from "../CouncilLogo.jsx";
import { t, personaShortName } from "../../lib/i18n.js";

export function LandingHeroFallback({
  language,
  activePersona,
  onPersonaHover,
  ctaHover,
  reducedMotion,
}) {
  const [localActive, setLocalActive] = useState(null);
  const active = activePersona ?? localActive;

  return (
    <div
      className={"landing-orbit-fallback" + (ctaHover ? " cta-glow" : "") + (reducedMotion ? " static" : "")}
      aria-hidden="true"
    >
      <div className="landing-orbit-glow" />
      <div className="landing-orbit-table" />
      <div className="landing-orbit-particles" />
      {PERSONAS.map((p, i) => {
        const a = (-90 + i * 40) * (Math.PI / 180);
        const cx = 50 + 42 * Math.cos(a);
        const cy = 50 + 42 * Math.sin(a);
        const isActive = active === p.id;
        return (
          <button
            key={p.id}
            type="button"
            className={"landing-orbit-node" + (isActive ? " active" : "")}
            style={{ left: `${cx}%`, top: `${cy}%`, "--p-color": p.color }}
            onMouseEnter={() => { setLocalActive(p.id); onPersonaHover?.(p.id); }}
            onMouseLeave={() => { setLocalActive(null); onPersonaHover?.(null); }}
            onFocus={() => { setLocalActive(p.id); onPersonaHover?.(p.id); }}
            onBlur={() => { setLocalActive(null); onPersonaHover?.(null); }}
            aria-label={personaShortName(language, p.id)}
          >
            <span className="landing-orbit-sigil" style={{ color: p.color }}><Sigil id={p.id} /></span>
            {isActive && (
              <span className="landing-orbit-tooltip" style={{ color: p.color }}>
                <strong>{personaShortName(language, p.id)}</strong>
                <em>{t(language, `landing_hover_${p.id}`)}</em>
              </span>
            )}
          </button>
        );
      })}
      <div className="landing-orbit-center">
        <CouncilLogo size={28} />
      </div>
    </div>
  );
}
