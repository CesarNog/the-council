import { PERSONAS } from "../../lib/personas.js";
import { Sigil } from "../../lib/sigil.jsx";
import { t, personaName } from "../../lib/i18n.js";

export function PersonaPreview({ language }) {
  return (
    <section className="landing-section landing-personas" aria-labelledby="personas-title">
      <h2 id="personas-title" className="landing-section-title">{t(language, "landing_personas_title")}</h2>
      <p className="landing-section-sub">{t(language, "landing_personas_sub")}</p>
      <div className="landing-persona-grid">
        {PERSONAS.map((p) => (
          <article
            key={p.id}
            className="landing-persona-card"
            style={{ "--p-color": p.color }}
            tabIndex={0}
          >
            <span className="landing-persona-sigil" style={{ color: p.color }}><Sigil id={p.id} /></span>
            <h3>{personaName(language, p.id)}</h3>
            <p className="landing-persona-philo">{t(language, `landing_philo_${p.id}`)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
