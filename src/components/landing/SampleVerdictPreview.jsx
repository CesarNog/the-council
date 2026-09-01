import { t } from "../../lib/i18n.js";

// Mirrors the exact counts already baked into landing_sample_tally ("YES 5 ·
// NO 1 · DEPENDS 3") across all four languages — kept as plain numbers here
// so the bar's proportions can never drift out of sync with that text.
const SAMPLE_YES = 5, SAMPLE_NO = 1, SAMPLE_DEPENDS = 3;
const SAMPLE_TOTAL = SAMPLE_YES + SAMPLE_NO + SAMPLE_DEPENDS;

export function SampleVerdictPreview({ language }) {
  return (
    <section id="sample-verdict" className="landing-section landing-verdict-preview" aria-labelledby="verdict-preview-title">
      <h2 id="verdict-preview-title" className="landing-section-title">{t(language, "landing_verdict_preview_title")}</h2>
      <article className="landing-verdict-card">
        <div className="chapter-eyebrow" style={{ margin: "0 0 20px" }}>{t(language, "chapter_vote")}</div>
        <p className="landing-verdict-q">"{t(language, "landing_sample_question")}"</p>
        <div className="landing-tally-bar" role="img" aria-label={t(language, "landing_sample_tally")}>
          <span className="landing-tally-seg yes" style={{ width: `${(SAMPLE_YES / SAMPLE_TOTAL) * 100}%` }} />
          <span className="landing-tally-seg no" style={{ width: `${(SAMPLE_NO / SAMPLE_TOTAL) * 100}%` }} />
          <span className="landing-tally-seg depends" style={{ width: `${(SAMPLE_DEPENDS / SAMPLE_TOTAL) * 100}%` }} />
        </div>
        <p className="landing-verdict-tally">{t(language, "landing_sample_tally")}</p>
        <div className="chapter-eyebrow" style={{ margin: "28px 0 16px" }}>{t(language, "chapter_verdict")}</div>
        <p className="landing-verdict-body">{t(language, "landing_sample_verdict")}</p>
        <span className="landing-verdict-tag">{t(language, "landing_verdict_tag")}</span>
      </article>
    </section>
  );
}
