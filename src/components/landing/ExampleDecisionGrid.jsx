import { Events } from "../../lib/analytics.js";
import { t, LANDING_EXAMPLE_KEYS } from "../../lib/i18n.js";

export function ExampleDecisionGrid({ language, onSelect, authenticated }) {
  return (
    <section className="landing-section landing-examples" aria-labelledby="examples-title">
      <h2 id="examples-title" className="landing-section-title">{t(language, "landing_examples_title")}</h2>
      <div className="landing-example-grid">
        {LANDING_EXAMPLE_KEYS.map((key) => {
          const q = t(language, key);
          return (
            <button
              key={key}
              type="button"
              className="landing-example-chip"
              onClick={() => {
                Events.landingCta({ action: "example_question", authenticated: !!authenticated, language });
                onSelect(q);
              }}
            >
              {q}
            </button>
          );
        })}
      </div>
    </section>
  );
}
