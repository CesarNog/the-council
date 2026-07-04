import { LANGUAGES } from "./lib/i18n.js";

export function LanguageSelector({ language, onChange }) {
  return (
    <div className="lang-selector">
      {LANGUAGES.map(l => (
        <button
          key={l.code}
          className={"lang-chip" + (l.code === language ? " on" : "")}
          onClick={() => onChange(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
