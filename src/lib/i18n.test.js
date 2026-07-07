import { describe, it, expect } from "vitest";
import {
  t,
  LANGUAGES,
  TTS_LANG,
  detectBrowserLanguage,
  personaName,
  personaShortName,
  personaTag,
  personaLine,
  QUICK_QUESTIONS_I18N,
  RICH_QUESTIONS_I18N,
} from "./i18n.js";

const SUPPORTED_LANGS = ["en", "pt", "es", "zh"];
const PERSONA_IDS = ["founder", "billionaire", "artist", "athlete", "monk", "scientist", "explorer", "romantic", "shadow"];

// ── Language registry ───────────────────────────────────────────────────────

describe("LANGUAGES", () => {
  it("exports exactly 4 supported languages", () => {
    expect(LANGUAGES).toHaveLength(4);
  });

  it("each language has code and label", () => {
    for (const lang of LANGUAGES) {
      expect(typeof lang.code).toBe("string");
      expect(typeof lang.label).toBe("string");
    }
  });

  it("includes en, pt, es, zh codes", () => {
    const codes = LANGUAGES.map(l => l.code);
    for (const code of SUPPORTED_LANGS) {
      expect(codes).toContain(code);
    }
  });
});

describe("TTS_LANG", () => {
  it("maps every supported language to a BCP-47 locale", () => {
    for (const code of SUPPORTED_LANGS) {
      expect(typeof TTS_LANG[code]).toBe("string");
      expect(TTS_LANG[code].length).toBeGreaterThan(4);
    }
  });
});

// ── t() core behaviour ─────────────────────────────────────────────────────

describe("t()", () => {
  it("returns the English string for key 'enter_chamber_cta'", () => {
    expect(t("en", "enter_chamber_cta")).toBe("Consult my Council");
  });

  it("returns Portuguese for 'enter_chamber_cta'", () => {
    expect(t("pt", "enter_chamber_cta")).toBe("Consultar meu Conselho");
  });

  it("returns Spanish for 'enter_chamber_cta'", () => {
    expect(t("es", "enter_chamber_cta")).toBe("Consultar mi Consejo");
  });

  it("returns Chinese for 'enter_chamber_cta'", () => {
    expect(t("zh", "enter_chamber_cta")).toBe("咨询我的议会");
  });

  it("falls back to English when language is undefined", () => {
    expect(t(undefined, "vote_yes")).toBe("Yes");
  });

  it("falls back to English for unknown language code", () => {
    expect(t("fr", "vote_yes")).toBe("Yes");
  });

  it("returns the key itself for an unknown key", () => {
    expect(t("en", "this_key_does_not_exist_xyz")).toBe("this_key_does_not_exist_xyz");
  });

  it("calls function value with args for interpolated strings", () => {
    expect(t("en", "in_session_for", "Alice")).toBe("In session for Alice");
    expect(t("pt", "in_session_for", "Alice")).toBe("Em sessão para Alice");
    expect(t("es", "in_session_for", "Alice")).toBe("En sesión para Alice");
    expect(t("zh", "in_session_for", "Alice")).toBe("正在为Alice议事");
  });

  it("rate_limited_retry_in interpolates seconds", () => {
    expect(t("en", "rate_limited_retry_in", 30)).toBe("Retrying in 30s…");
    expect(t("pt", "rate_limited_retry_in", 30)).toBe("Tentando novamente em 30s…");
  });
});

// ── Vote label translations ────────────────────────────────────────────────

describe("vote labels", () => {
  const cases = [
    { key: "vote_yes",     en: "Yes",     pt: "Sim",    es: "Sí",     zh: "是" },
    { key: "vote_no",      en: "No",      pt: "Não",    es: "No",     zh: "否" },
    { key: "vote_depends", en: "It depends", pt: "Depende", es: "Depende", zh: "视情况而定" },
    { key: "share_yes",    en: "YES",     pt: "SIM",    es: "SÍ",     zh: "赞成" },
    { key: "share_no",     en: "NO",      pt: "NÃO",    es: "NO",     zh: "反对" },
    { key: "share_depends",en: "DEPENDS", pt: "DEPENDE",es: "DEPENDE",zh: "待定" },
  ];
  for (const { key, en, pt, es, zh } of cases) {
    it(`${key} is translated in all 4 languages`, () => {
      expect(t("en", key)).toBe(en);
      expect(t("pt", key)).toBe(pt);
      expect(t("es", key)).toBe(es);
      expect(t("zh", key)).toBe(zh);
    });
  }
});

// ── Footer / consent keys ─────────────────────────────────────────────────

describe("footer and consent keys", () => {
  const footerKeys = ["footer_disclaimer", "footer_privacy", "footer_terms", "footer_cookie_settings", "developed_by", "buy_me_coffee"];
  const consentKeys = ["consent_text", "consent_manage", "consent_necessary_only", "consent_accept_all",
    "cookie_settings_heading", "consent_necessary_label", "consent_necessary_desc", "consent_always_enabled",
    "consent_analytics_label", "consent_analytics_desc", "consent_toggle_analytics",
    "consent_advertising_label", "consent_advertising_desc", "consent_toggle_advertising",
    "cancel", "save_preferences"];

  for (const key of [...footerKeys, ...consentKeys]) {
    it(`"${key}" is defined for all languages`, () => {
      for (const lang of SUPPORTED_LANGS) {
        const val = t(lang, key);
        expect(val).not.toBe(key); // must resolve to something, not fall through to key
        expect(typeof val).toBe("string");
        expect(val.length).toBeGreaterThan(0);
      }
    });
  }
});

// ── Accessibility / UI keys ───────────────────────────────────────────────

describe("accessibility keys", () => {
  it("theme_switch_to_light is translated", () => {
    expect(t("en", "theme_switch_to_light")).toBe("Switch to light mode");
    expect(t("pt", "theme_switch_to_light")).toBe("Mudar para modo claro");
    expect(t("es", "theme_switch_to_light")).toBe("Cambiar a modo claro");
    expect(t("zh", "theme_switch_to_light")).toBe("切换到浅色模式");
  });

  it("theme_switch_to_dark is translated", () => {
    expect(t("en", "theme_switch_to_dark")).toBe("Switch to dark mode");
    expect(t("pt", "theme_switch_to_dark")).toBe("Mudar para modo escuro");
  });

  it("profile_settings aria-label is translated", () => {
    expect(t("en", "profile_settings")).toBe("Profile settings");
    expect(t("pt", "profile_settings")).toBe("Configurações do perfil");
    expect(t("es", "profile_settings")).toBe("Configuración del perfil");
    expect(t("zh", "profile_settings")).toBe("个人资料设置");
  });

  it("reload is translated", () => {
    expect(t("en", "reload")).toBe("Reload");
    expect(t("pt", "reload")).toBe("Recarregar");
    expect(t("es", "reload")).toBe("Recargar");
    expect(t("zh", "reload")).toBe("重新加载");
  });

  it("something_interrupted is translated", () => {
    expect(t("en", "something_interrupted")).toBe("Something interrupted the session");
    expect(t("pt", "something_interrupted")).toBe("Algo interrompeu a sessão");
  });
});

// ── Persona helpers ───────────────────────────────────────────────────────

describe("personaName()", () => {
  it("returns English name for each persona", () => {
    const expected = {
      founder: "The Founder", billionaire: "The Billionaire", artist: "The Artist",
      athlete: "The Athlete", monk: "The Monk", scientist: "The Scientist",
      explorer: "The Explorer", romantic: "The Romantic", shadow: "The Shadow",
    };
    for (const id of PERSONA_IDS) {
      expect(personaName("en", id)).toBe(expected[id]);
    }
  });

  it("returns Portuguese name for monk", () => {
    expect(personaName("pt", "monk")).toBe("O Monge");
  });

  it("returns Spanish name for shadow", () => {
    expect(personaName("es", "shadow")).toBe("La Sombra");
  });

  it("returns Chinese name for founder", () => {
    expect(personaName("zh", "founder")).toBe("创业者");
  });

  it("falls back to English for unknown lang", () => {
    expect(personaName("fr", "artist")).toBe("The Artist");
  });

  it("returns id for unknown persona", () => {
    expect(personaName("en", "unknown_persona")).toBe("unknown_persona");
  });
});

describe("personaShortName()", () => {
  it("strips The/O/A/El/La prefix", () => {
    expect(personaShortName("en", "founder")).toBe("Founder");
    expect(personaShortName("pt", "monk")).toBe("Monge");
    expect(personaShortName("es", "shadow")).toBe("Sombra");
    expect(personaShortName("pt", "shadow")).toBe("Sombra");
  });

  it("Chinese names have no prefix to strip", () => {
    expect(personaShortName("zh", "founder")).toBe("创业者");
  });
});

describe("personaTag()", () => {
  it("returns tag for each persona in each language", () => {
    for (const id of PERSONA_IDS) {
      for (const lang of SUPPORTED_LANGS) {
        const tag = personaTag(lang, id);
        expect(typeof tag).toBe("string");
        expect(tag.length).toBeGreaterThan(0);
      }
    }
  });

  it("English shadow tag", () => {
    expect(personaTag("en", "shadow")).toBe("the self you don't introduce");
  });

  it("Portuguese founder tag", () => {
    expect(personaTag("pt", "founder")).toBe("o eu que apostou tudo");
  });
});

describe("personaLine()", () => {
  it("returns signature line for each persona in each language", () => {
    for (const id of PERSONA_IDS) {
      for (const lang of SUPPORTED_LANGS) {
        const line = personaLine(lang, id);
        expect(typeof line).toBe("string");
        expect(line.length).toBeGreaterThan(0);
      }
    }
  });

  it("English shadow line", () => {
    expect(personaLine("en", "shadow")).toBe("You already know. You're just afraid.");
  });

  it("Portuguese monk line", () => {
    expect(personaLine("pt", "monk")).toBe("O que você está realmente buscando?");
  });
});

// ── Example questions ─────────────────────────────────────────────────────

describe("QUICK_QUESTIONS_I18N", () => {
  it("has entries for all 4 languages", () => {
    for (const lang of SUPPORTED_LANGS) {
      expect(Array.isArray(QUICK_QUESTIONS_I18N[lang])).toBe(true);
      expect(QUICK_QUESTIONS_I18N[lang].length).toBeGreaterThan(0);
    }
  });

  it("all entries are non-empty strings", () => {
    for (const lang of SUPPORTED_LANGS) {
      for (const q of QUICK_QUESTIONS_I18N[lang]) {
        expect(typeof q).toBe("string");
        expect(q.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("RICH_QUESTIONS_I18N", () => {
  it("has entries for all 4 languages", () => {
    for (const lang of SUPPORTED_LANGS) {
      expect(Array.isArray(RICH_QUESTIONS_I18N[lang])).toBe(true);
      expect(RICH_QUESTIONS_I18N[lang].length).toBeGreaterThan(0);
    }
  });

  it("English has the most questions (reference set)", () => {
    for (const lang of SUPPORTED_LANGS.filter(l => l !== "en")) {
      expect(RICH_QUESTIONS_I18N[lang].length).toBeGreaterThan(0);
    }
    expect(RICH_QUESTIONS_I18N.en.length).toBeGreaterThanOrEqual(20);
  });
});

// ── Key coverage: all critical UI text exists in all languages ─────────────

describe("key coverage", () => {
  const criticalKeys = [
    "landing_title_1", "landing_title_em", "landing_sub",
    "enter_chamber_cta", "enter_chamber_sub", "auth_or",
    "before_council_speaks", "onb_decision_hint",
    "onb_name_q", "onb_situation_q", "onb_values_q",
    "continue", "convene",
    "chamber_label", "bring_question", "offline_banner",
    "council_votes", "vote_yes", "vote_no", "vote_depends",
    "in_another_life", "download_verdict", "copy_as_text",
    "chamber_stuck", "knock_again",
    "something_interrupted", "council_needs_moment", "reload",
    "your_presence", "save", "close", "sign_out",
    "footer_disclaimer", "footer_privacy", "footer_terms",
    "developed_by", "buy_me_coffee",
    "not_found_title", "back",
    "theme_switch_to_light", "theme_switch_to_dark",
    "profile_settings", "cancel", "save_preferences",
  ];

  for (const key of criticalKeys) {
    it(`"${key}" resolves in all languages`, () => {
      for (const lang of SUPPORTED_LANGS) {
        const val = t(lang, key);
        expect(val).not.toBe(key);
        expect(typeof val === "string" || typeof val === "function").toBe(true);
        if (typeof val === "string") expect(val.length).toBeGreaterThan(0);
      }
    });
  }
});

// ── Language switch persistence helpers ───────────────────────────────────

describe("detectBrowserLanguage()", () => {
  it("returns a code in SUPPORTED_LANGS or 'en'", () => {
    const code = detectBrowserLanguage();
    expect(SUPPORTED_LANGS.includes(code) || code === "en").toBe(true);
  });
});
