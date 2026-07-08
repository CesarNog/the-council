import { t } from "../../lib/i18n.js";

const STEPS = ["ask", "disagree", "verdict"];

export function HowItWorks({ language }) {
  return (
    <section className="landing-section landing-how" aria-labelledby="how-it-works-title">
      <h2 id="how-it-works-title" className="landing-section-title">{t(language, "landing_how_title")}</h2>
      <div className="landing-how-grid">
        {STEPS.map((key, i) => (
          <article key={key} className="landing-how-card fade-up" style={{ animationDelay: `${i * 0.12}s` }}>
            <span className="landing-how-num">{i + 1}</span>
            <h3>{t(language, `landing_how_${key}_title`)}</h3>
            <p>{t(language, `landing_how_${key}_body`)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
