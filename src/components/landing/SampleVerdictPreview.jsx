import { t } from "../../lib/i18n.js";

export function SampleVerdictPreview({ language }) {
  return (
    <section id="sample-verdict" className="landing-section landing-verdict-preview" aria-labelledby="verdict-preview-title">
      <h2 id="verdict-preview-title" className="landing-section-title">{t(language, "landing_verdict_preview_title")}</h2>
      <article className="landing-verdict-card">
        <p className="landing-verdict-q">"{t(language, "landing_sample_question")}"</p>
        <p className="landing-verdict-tally">{t(language, "landing_sample_tally")}</p>
        <p className="landing-verdict-body">{t(language, "landing_sample_verdict")}</p>
        <span className="landing-verdict-tag">{t(language, "landing_verdict_tag")}</span>
      </article>
    </section>
  );
}
