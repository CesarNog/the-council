import { LANGUAGES, t } from "./lib/i18n.js";

export function LanguageSelector({ language, onChange }) {
  return (
    <div className="lang-selector">
      {LANGUAGES.map(l => (
        <button
          key={l.code}
          className={"lang-chip" + (l.code === language ? " on" : "")}
          onClick={() => onChange(l.code)}
          aria-pressed={l.code === language}
        >
          {l.label}
        </button>
      ))}
      {/* phones: four chips wrapped to two header rows — a native select fits one */}
      <select
        className="lang-select"
        value={language}
        onChange={e => onChange(e.target.value)}
        aria-label={t(language, "lang_label")}
      >
        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
    </div>
  );
}
