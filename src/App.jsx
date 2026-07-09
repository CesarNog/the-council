import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Landing, Onboarding, Chamber, ErrorBoundary, CouncilLogo } from "./components.jsx";
import { ProfileSettings } from "./auth-ui.jsx";
import { CouncilSignIn } from "./clerk-auth-ui.jsx";
import { AppProviders } from "./clerk-provider.jsx";
import { isClerkEnabled, signOutClerkSession } from "./lib/clerk.js";
import { LifeModeBanner } from "./life-mode.jsx";
import { LanguageSelector } from "./language-selector.jsx";
import { ConsentBanner, CookieSettings, useConsentBannerVisible } from "./consent-ui.jsx";
import { acceptAll, rejectOptional } from "./lib/consent.js";
import { initAnalytics, trackPageView } from "./lib/analytics.js";
import { initAds } from "./lib/ads.js";
import { signInWithGoogle, signOut, getProfile, updateProfile } from "./lib/auth.js";
import { detectBrowserLanguage, t } from "./lib/i18n.js";
import { loadHistory } from "./lib/history.js";

function buildLocalLifeMode(language) {
  try {
    if (!localStorage.getItem("council:lifemode_enabled")) return null;
    if (!localStorage.getItem("council:premium_waitlist")) return null;
    const lastCheckIn = parseInt(localStorage.getItem("council:lifemode_checkin") || "0");
    if (Date.now() - lastCheckIn < 24 * 60 * 60 * 1000) return null;
    const history = JSON.parse(localStorage.getItem("council:history") || "[]");
    if (!history.length) return null;
    const last = history[0];
    localStorage.setItem("council:lifemode_checkin", String(Date.now()));
    const personas = ["monk", "shadow", "romantic", "explorer"];
    const persona = personas[Math.floor(Date.now() / 86400000) % personas.length];
    return {
      persona,
      teaser: t(language, "lifemode_teaser"),
      turns: [{ p: persona, t: t(language, `lifemode_${persona}`, last.question) }],
    };
  } catch { return null; }
}

function sharedIdFromPath() {
  const m = typeof window !== "undefined" ? window.location.pathname.match(/^\/r\/([a-z0-9]{4,20})$/i) : null;
  return m ? m[1] : null;
}

function staticPageFromPath() {
  if (typeof window === "undefined") return null;
  const p = window.location.pathname;
  if (p === "/privacy") return "privacy";
  if (p === "/terms") return "terms";
  if (p === "/cookies") return "cookies";
  return null;
}

function isUnknownPath() {
  if (typeof window === "undefined") return false;
  const p = window.location.pathname;
  if (p === "/" || p === "") return false;
  if (/^\/r\/[a-z0-9]{4,20}$/i.test(p)) return false;
  if (p === "/privacy" || p === "/terms" || p === "/cookies") return false;
  return true;
}

const STATIC_PAGE_CONTENT = {
  privacy: {
    title: {
      en: "Privacy Policy", pt: "Política de Privacidade", es: "Política de Privacidad", zh: "隐私政策",
    },
    body: {
      en: `Last updated: July 2026

1. What we collect
When you use The Council, we may store:
• Your debate result — saved for up to 30 days to power shareable links (/r/id). The question is stored as submitted.
• A signed session cookie — set only when you sign in with Google. Contains your user ID only; expires with your browser session.
• Your display name and decision context (emotional weight, category, fear) — stored in your browser's localStorage only, never sent to our servers unless you are signed in.

2. Analytics (optional, with your consent)
If you consent, we use Hotjar to collect anonymous, aggregate usage patterns — scroll depth, click areas. No questions, no names, no personal data. Withdraw consent at any time from Cookie Settings in the footer.

3. What we never do
• Sell your data.
• Share your questions or debates with any third party.
• Build advertising profiles.
• Store your email address (we only receive your Google display name and profile picture URL when you sign in).

4. Your rights
Sign out to delete your session. Debate results expire automatically after 30 days. To request deletion of any stored data, email: cesarnogueira1210@gmail.com

5. Children
The Council is not directed at children under 13. Contact us immediately if you believe a child has submitted data.`,
      pt: `Última atualização: julho de 2026

1. O que coletamos
Ao usar o The Council, podemos armazenar:
• O resultado do seu debate — salvo por até 30 dias para viabilizar links compartilháveis (/r/id). A pergunta é armazenada como enviada.
• Um cookie de sessão assinado — definido apenas quando você entra com o Google. Contém somente o seu ID de usuário; expira com a sessão do navegador.
• Seu nome de exibição e o contexto da decisão (peso emocional, categoria, medo) — armazenados apenas no localStorage do seu navegador, nunca enviados aos nossos servidores a menos que você esteja autenticado.

2. Analytics (opcional, com seu consentimento)
Se você consentir, usamos o Hotjar para coletar padrões de uso anônimos e agregados — profundidade de rolagem, áreas de clique. Nenhuma pergunta, nome ou dado pessoal. Retire seu consentimento a qualquer momento em Configurações de Cookies no rodapé.

3. O que nunca fazemos
• Vender seus dados.
• Compartilhar suas perguntas ou debates com terceiros.
• Criar perfis publicitários.
• Armazenar seu endereço de e-mail (recebemos apenas seu nome de exibição do Google e a URL da foto de perfil ao entrar).

4. Seus direitos
Saia da sua conta para excluir sua sessão. Os resultados dos debates expiram automaticamente após 30 dias. Para solicitar a exclusão de qualquer dado armazenado, envie um e-mail para: cesarnogueira1210@gmail.com

5. Crianças
O The Council não é direcionado a crianças menores de 13 anos. Entre em contato conosco imediatamente se acreditar que uma criança enviou dados.`,
      es: `Última actualización: julio de 2026

1. Qué recopilamos
Cuando usas The Council, podemos almacenar:
• El resultado de tu debate — guardado hasta 30 días para habilitar enlaces compartibles (/r/id). La pregunta se guarda tal como fue enviada.
• Una cookie de sesión firmada — solo se establece cuando inicias sesión con Google. Contiene únicamente tu ID de usuario; expira con la sesión del navegador.
• Tu nombre visible y el contexto de la decisión (peso emocional, categoría, miedo) — almacenados solo en el localStorage de tu navegador, nunca enviados a nuestros servidores a menos que hayas iniciado sesión.

2. Analítica (opcional, con tu consentimiento)
Si das tu consentimiento, usamos Hotjar para recopilar patrones de uso anónimos y agregados — profundidad de scroll, áreas de clic. Sin preguntas, sin nombres, sin datos personales. Puedes retirar tu consentimiento en cualquier momento desde Ajustes de Cookies en el pie de página.

3. Lo que nunca hacemos
• Vender tus datos.
• Compartir tus preguntas o debates con terceros.
• Crear perfiles publicitarios.
• Almacenar tu dirección de correo (solo recibimos tu nombre visible de Google y la URL de tu foto de perfil al iniciar sesión).

4. Tus derechos
Cierra sesión para eliminar tu sesión. Los resultados de los debates expiran automáticamente a los 30 días. Para solicitar la eliminación de cualquier dato almacenado, escribe a: cesarnogueira1210@gmail.com

5. Menores
The Council no está dirigido a menores de 13 años. Contáctanos de inmediato si crees que un menor ha enviado datos.`,
      zh: `最后更新：2026年7月

1. 我们收集的信息
使用 The Council 时，我们可能会存储：
• 你的辩论结果——最多保存 30 天，用于生成可分享链接（/r/id）。问题会按你提交的原文保存。
• 已签名的会话 Cookie——仅在你使用 Google 登录时设置。仅包含你的用户 ID；随浏览器会话结束而失效。
• 你的显示名称和决策背景（情绪权重、类别、担忧）——仅存储在你浏览器的 localStorage 中，除非你已登录，否则不会发送到我们的服务器。

2. 分析（可选，需你同意）
如果你同意，我们会使用 Hotjar 收集匿名的汇总使用模式——滚动深度、点击区域。不涉及问题内容、姓名或个人数据。你可以随时在页脚的 Cookie设置 中撤回同意。

3. 我们绝不会做的事
• 出售你的数据。
• 将你的问题或辩论内容分享给任何第三方。
• 建立广告画像。
• 存储你的电子邮箱地址（登录时我们只获取你的 Google 显示名称和头像 URL）。

4. 你的权利
退出登录即可删除你的会话。辩论结果会在 30 天后自动过期。如需请求删除任何已存储的数据，请发送邮件至：cesarnogueira1210@gmail.com

5. 儿童隐私
The Council 不面向 13 岁以下儿童。如果你认为有儿童提交了数据，请立即与我们联系。`,
    },
  },
  terms: {
    title: {
      en: "Terms of Service", pt: "Termos de Serviço", es: "Términos de Servicio", zh: "服务条款",
    },
    body: {
      en: `Last updated: July 2026

1. What The Council is
The Council is a reflective decision-support tool. Nine AI personas — each representing a different facet of human perspective — debate the question you bring. It is designed to help you think, not to tell you what to do.

2. What The Council is not
The Council does not provide legal, financial, medical, psychological, or any other professional advice. The personas' perspectives are creative, generative prompts — not authoritative guidance. Never make consequential decisions based solely on AI output.

3. Your responsibilities
By using The Council, you agree to:
• Use the service for lawful purposes only.
• Not attempt to extract, scrape, reverse-engineer, or abuse the underlying AI system.
• Not submit questions containing personal information of third parties without their consent.

4. Availability
The Council is offered as-is. We make no guarantees of uptime, accuracy, or fitness for any particular purpose. The service may change or be discontinued at any time without notice.

5. Limitation of liability
To the fullest extent permitted by applicable law, The Council and its creator are not liable for any decisions made or actions taken in reliance on the AI-generated output.

6. Contact
Questions or concerns: cesarnogueira1210@gmail.com`,
      pt: `Última atualização: julho de 2026

1. O que é o The Council
O The Council é uma ferramenta reflexiva de apoio à decisão. Nove personas de IA — cada uma representando uma faceta diferente da perspectiva humana — debatem a questão que você traz. Ele foi criado para ajudar você a pensar, não para dizer o que fazer.

2. O que o The Council não é
O The Council não fornece aconselhamento jurídico, financeiro, médico, psicológico ou qualquer outro tipo de orientação profissional. As perspectivas das personas são estímulos criativos e generativos — não orientação com autoridade. Nunca tome decisões consequentes baseando-se apenas na saída da IA.

3. Suas responsabilidades
Ao usar o The Council, você concorda em:
• Usar o serviço apenas para fins lícitos.
• Não tentar extrair, coletar dados (scraping), fazer engenharia reversa ou abusar do sistema de IA subjacente.
• Não enviar perguntas contendo informações pessoais de terceiros sem o consentimento deles.

4. Disponibilidade
O The Council é oferecido no estado em que se encontra ("as-is"). Não garantimos disponibilidade, precisão ou adequação a qualquer finalidade específica. O serviço pode mudar ou ser descontinuado a qualquer momento, sem aviso prévio.

5. Limitação de responsabilidade
Na máxima extensão permitida pela legislação aplicável, o The Council e seu criador não se responsabilizam por decisões tomadas ou ações realizadas com base na saída gerada por IA.

6. Contato
Dúvidas ou preocupações: cesarnogueira1210@gmail.com`,
      es: `Última actualización: julio de 2026

1. Qué es The Council
The Council es una herramienta reflexiva de apoyo a la toma de decisiones. Nueve personas de IA — cada una representando una faceta distinta de la perspectiva humana — debaten la pregunta que traes. Está diseñado para ayudarte a pensar, no para decirte qué hacer.

2. Qué no es The Council
The Council no ofrece asesoramiento legal, financiero, médico, psicológico ni de ningún otro tipo profesional. Las perspectivas de las personas son estímulos creativos y generativos — no orientación con autoridad. Nunca tomes decisiones importantes basándote únicamente en la salida de la IA.

3. Tus responsabilidades
Al usar The Council, aceptas:
• Usar el servicio solo con fines lícitos.
• No intentar extraer, hacer scraping, aplicar ingeniería inversa o abusar del sistema de IA subyacente.
• No enviar preguntas que contengan información personal de terceros sin su consentimiento.

4. Disponibilidad
The Council se ofrece tal cual ("as-is"). No garantizamos el tiempo de actividad, la precisión ni la idoneidad para ningún propósito particular. El servicio puede cambiar o discontinuarse en cualquier momento sin previo aviso.

5. Limitación de responsabilidad
En la máxima medida permitida por la ley aplicable, The Council y su creador no son responsables de ninguna decisión tomada ni acción realizada basándose en la salida generada por la IA.

6. Contacto
Preguntas o inquietudes: cesarnogueira1210@gmail.com`,
      zh: `最后更新：2026年7月

1. The Council 是什么
The Council 是一款反思型决策辅助工具。九个 AI 人格——每个代表人类视角的不同面向——会就你提出的问题展开辩论。它旨在帮助你思考，而不是替你做决定。

2. The Council 不是什么
The Council 不提供法律、财务、医疗、心理或任何其他专业建议。这些人格的观点是创造性的生成式内容，而非权威指导。切勿仅凭 AI 输出做出重大决定。

3. 你的责任
使用 The Council 即表示你同意：
• 仅将本服务用于合法目的。
• 不尝试提取、爬取、逆向工程或滥用底层 AI 系统。
• 不提交包含第三方个人信息且未经其同意的问题。

4. 服务可用性
The Council 按“现状”提供。我们不对正常运行时间、准确性或特定用途的适用性做任何保证。服务可能随时变更或终止，恕不另行通知。

5. 责任限制
在适用法律允许的最大范围内，The Council 及其创建者不对基于 AI 生成内容所做出的任何决定或采取的任何行动承担责任。

6. 联系方式
问题或疑虑：cesarnogueira1210@gmail.com`,
    },
  },
  cookies: {
    title: {
      en: "Cookie Policy", pt: "Política de Cookies", es: "Política de Cookies", zh: "Cookie政策",
    },
    body: {
      en: `Last updated: July 2026

The Council uses cookies and browser storage (localStorage) for the following purposes:

Necessary (always active)
• Session cookie — keeps you signed in across page reloads when using Google Sign-In. Expires with your browser session.
• Language preference — remembers your chosen language between visits (localStorage).
• Display name — remembers the name you chose for the Council to use (localStorage).

Analytics (optional — requires your consent)
• Hotjar — collects anonymous, aggregate usage patterns (scroll depth, click areas). No questions, no personal data. You may withdraw consent at any time from Cookie Settings in the footer.

Advertising (optional — requires your consent)
• Discreet ads help keep The Council free. Ad cookies are only set if you consent.

Managing your preferences
Click Cookie Settings in the footer at any time to review or change your choices.`,
      pt: `Última atualização: julho de 2026

O The Council usa cookies e armazenamento do navegador (localStorage) para os seguintes fins:

Necessários (sempre ativos)
• Cookie de sessão — mantém você conectado entre recarregamentos de página ao usar o login com Google. Expira com a sessão do navegador.
• Preferência de idioma — lembra o idioma escolhido entre as visitas (localStorage).
• Nome de exibição — lembra o nome que você escolheu para o Council usar (localStorage).

Analytics (opcional — requer seu consentimento)
• Hotjar — coleta padrões de uso anônimos e agregados (profundidade de rolagem, áreas de clique). Nenhuma pergunta, nenhum dado pessoal. Você pode retirar seu consentimento a qualquer momento em Configurações de Cookies no rodapé.

Publicidade (opcional — requer seu consentimento)
• Anúncios discretos ajudam a manter o The Council gratuito. Cookies de anúncios só são definidos com o seu consentimento.

Gerenciando suas preferências
Clique em Configurações de Cookies no rodapé a qualquer momento para revisar ou alterar suas escolhas.`,
      es: `Última actualización: julio de 2026

The Council usa cookies y almacenamiento del navegador (localStorage) para los siguientes fines:

Necesarias (siempre activas)
• Cookie de sesión — te mantiene conectado entre recargas de página al usar el inicio de sesión con Google. Expira con la sesión del navegador.
• Preferencia de idioma — recuerda el idioma elegido entre visitas (localStorage).
• Nombre visible — recuerda el nombre que elegiste para que The Council lo use (localStorage).

Analítica (opcional — requiere tu consentimiento)
• Hotjar — recopila patrones de uso anónimos y agregados (profundidad de scroll, áreas de clic). Sin preguntas, sin datos personales. Puedes retirar tu consentimiento en cualquier momento desde Ajustes de Cookies en el pie de página.

Publicidad (opcional — requiere tu consentimiento)
• Anuncios discretos ayudan a mantener The Council gratuito. Las cookies publicitarias solo se activan si das tu consentimiento.

Gestionar tus preferencias
Haz clic en Ajustes de Cookies en el pie de página en cualquier momento para revisar o cambiar tus opciones.`,
      zh: `最后更新：2026年7月

The Council 会出于以下目的使用 Cookie 和浏览器存储（localStorage）：

必要（始终启用）
• 会话 Cookie——在使用 Google 登录时，让你在页面刷新后仍保持登录状态。随浏览器会话结束而失效。
• 语言偏好——记住你在不同访问之间选择的语言（localStorage）。
• 显示名称——记住你为 The Council 设置的使用名称（localStorage）。

分析（可选——需你同意）
• Hotjar——收集匿名的汇总使用模式（滚动深度、点击区域）。不涉及问题内容或个人数据。你可以随时在页脚的 Cookie设置 中撤回同意。

广告（可选——需你同意）
• 低干扰广告帮助 The Council 保持免费。仅在你同意的情况下才会设置广告 Cookie。

管理你的偏好
随时点击页脚中的 Cookie设置，即可查看或更改你的选择。`,
    },
  },
};

function StaticPage({ page, onBack, language = "en" }) {
  const c = STATIC_PAGE_CONTENT[page];
  const title = c?.title[language] || c?.title.en || "Not Found";
  const body = c?.body[language] || c?.body.en || "";
  return (
    <div className="landing static-page">
      <button className="btn small" style={{ marginBottom: 32 }} onClick={onBack}>{t(language, "back")}</button>
      <h1 className="serif">{title}</h1>
      <div className="static-body">
        {body.split("\n\n").map((para) => (
          <p key={para.slice(0, 40)}>{para}</p>
        ))}
      </div>
    </div>
  );
}

function NotFoundPage({ onHome, language = "en" }) {
  return (
    <div className="landing">
      <div className="fade-up d1" style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(80px,16vw,160px)", color: "var(--gold)", opacity: 0.15, lineHeight: 1, marginTop: 32, letterSpacing: "-0.04em" }}>404</div>
      <div className="eyebrow fade-up d2" style={{ marginTop: 24 }}>{t(language, "not_found_eyebrow")}</div>
      <h1 className="fade-up d2">{t(language, "not_found_title")}</h1>
      <p className="sub fade-up d3" style={{ maxWidth: 440 }}>{t(language, "not_found_sub")}</p>
      <div className="fade-up d4" style={{ marginTop: 32 }}>
        <button className="btn primary" onClick={onHome}>{t(language, "not_found_cta")}</button>
      </div>
    </div>
  );
}

function eclipsePreviewDebate() {
  if (typeof window === "undefined") return null;
  if (new URLSearchParams(window.location.search).get("preview") !== "eclipse") return null;
  const ids = ["founder", "billionaire", "artist", "athlete", "monk", "scientist", "explorer", "romantic", "shadow"];
  return {
    question: "[QA preview] Should I take the leap?",
    debate: {
      id: "preview",
      mood: "electric",
      turns: ids.map(p => ({ p, t: "[Eclipse QA preview turn]" })),
      votes: ids.map(p => ({ p, v: "yes", r: "[QA]" })),
      verdict: "[QA preview] This is a synthetic unanimous debate used only to visually validate the Eclipse sequence.",
      quote: "[QA preview quote]",
      question: "[QA preview reflection question]",
      realities: [],
    },
  };
}

function SharedConversionBanner({ onEnter, language = "en" }) {
  return (
    <div className="shared-conversion-banner">
      <p className="shared-conversion-text">
        {t(language, "shared_conversion_text")}
      </p>
      <button className="btn primary shared-conversion-btn" onClick={onEnter}>
        {t(language, "shared_conversion_cta")}
      </button>
    </div>
  );
}

function SharedGate({ id, onExit, onEnter, language = "en" }) {
  const [result, setResult] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch(`/api/result?id=${encodeURIComponent(id)}`)
      .then(r => { if (!r.ok) throw new Error("not_found"); return r.json(); })
      .then(d => setResult({ question: d.asked, debate: d }))
      .catch(() => setFailed(true));
  }, [id]);

  if (failed) {
    return (
      <div className="landing">
        <div className="eyebrow">{t(language, "shared_gone_eyebrow")}</div>
        <h1 style={{ fontSize: "clamp(28px,4vw,44px)" }}>{t(language, "shared_gone_title")}</h1>
        <p style={{ opacity: 0.6, marginTop: 16, fontSize: 15 }}>
          {t(language, "shared_gone_sub")}
        </p>
        <button className="btn primary" style={{ marginTop: 30 }} onClick={onEnter || onExit}>
          {t(language, "shared_gone_cta")}
        </button>
      </div>
    );
  }
  if (!result) {
    return (
      <div className="landing">
        <div className="speaking" style={{ justifyContent: "center" }}>
          <span className="dots"><i /><i /><i /></span>
          {t(language, "shared_loading")}
        </div>
      </div>
    );
  }
  return (
    <>
      <Chamber profile={{}} preloaded={result} onExit={onExit} language={language} />
      <SharedConversionBanner onEnter={onEnter || onExit} language={language} />
    </>
  );
}

function userHasCompletedProfile(user) {
  return !!(user?.name);
}

function decisionQuestionFromWindow() {
  if (typeof window === "undefined") return null;
  const q = window.__COUNCIL_DECISION__;
  if (q) delete window.__COUNCIL_DECISION__;
  return q || null;
}

function TheCouncilApp({ clerkSignOut }) {
  const [sharedId, setSharedId] = useState(sharedIdFromPath);
  const [staticPage, setStaticPage] = useState(staticPageFromPath);
  const [is404] = useState(isUnknownPath);
  const [eclipsePreview] = useState(eclipsePreviewDebate);
  const [decisionQuestion] = useState(decisionQuestionFromWindow);
  const [quickQuestion, setQuickQuestion] = useState(null);
  const [screen, setScreen] = useState(sharedId ? "shared" : eclipsePreview ? "chamber" : decisionQuestion ? "chamber" : "landing"); // landing | onboarding | chamber | shared
  const [consentBannerVisible, dismissConsentBanner] = useConsentBannerVisible();
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const [profile, setProfile] = useState({ name: "", situation: "", values: [] });
  const [user, setUser] = useState(null); // null = anonimo ou ainda carregando
  const [checkingSession, setCheckingSession] = useState(!sharedId);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [displayName, setDisplayName] = useState(() => {
    try { return localStorage.getItem("council:displayName") || ""; } catch { return ""; }
  });
  const [decisionContext, setDecisionContext] = useState(null);
  const [localLifeMode, setLocalLifeMode] = useState(null);
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem("council:lang");
      return saved || detectBrowserLanguage();
    } catch {
      return detectBrowserLanguage();
    }
  });
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("council:theme") || "dark"; } catch { return "dark"; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    try { localStorage.setItem("council:theme", theme); } catch {}
  }, [theme]);

  const changeLanguage = (code) => {
    setLanguage(code);
    try { localStorage.setItem("council:lang", code); } catch {}
  };

  const toggleTheme = () => setTheme(th => th === "dark" ? "light" : "dark");

  useEffect(() => {
    setLocalLifeMode(buildLocalLifeMode(language));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { initAnalytics(); initAds(); }, []);

  useEffect(() => { trackPageView(screen); }, [screen]);

  useEffect(() => {
    if (sharedId) return;
    getProfile()
      .then(u => {
        if (!u) return;
        setUser(u);
        if (userHasCompletedProfile(u)) {
          setProfile({ name: u.name, situation: u.situation, values: u.values });
          // auto-init displayName from Google name if not yet set
          if (!displayName && u.name) {
            const given = u.name.split(" ")[0];
            setDisplayName(given);
            try { localStorage.setItem("council:displayName", given); } catch {}
          }
          setScreen("chamber");
        }
      })
      .catch(() => {})
      .finally(() => setCheckingSession(false));
  }, [sharedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAuthUser = (u) => {
    setUser(u);
    if (userHasCompletedProfile(u)) {
      setProfile({ name: u.name, situation: u.situation, values: u.values });
      if (!displayName && u.name) {
        const given = u.name.split(" ")[0];
        setDisplayName(given);
        try { localStorage.setItem("council:displayName", given); } catch {}
      }
      setScreen("chamber");
    } else {
      setScreen("onboarding");
    }
  };

  const handleCredential = async (credential) => {
    setLoginError(null);
    try {
      const u = await signInWithGoogle(credential);
      handleAuthUser(u);
    } catch (err) {
      if (err.kind === "network_error") setLoginError("login_error_network");
      else if (err.kind === "unconfigured") setLoginError("login_error_unconfigured");
      else setLoginError("login_error_generic");
    }
  };

  const handleOnboardingDone = (p) => {
    const name = p.name || p.displayName || "";
    setProfile({ name, situation: "", values: [] });
    if (p.displayName) {
      setDisplayName(p.displayName);
      try { localStorage.setItem("council:displayName", p.displayName); } catch {}
    }
    if (p.emotionalWeight || p.decisionCategory || p.mainFear) {
      setDecisionContext({ emotionalWeight: p.emotionalWeight, decisionCategory: p.decisionCategory, mainFear: p.mainFear });
    }
    if (p.question) {
      setQuickQuestion(p.question);
    }
    setScreen("chamber");
    if (user && name) {
      updateProfile({ name }).then(setUser).catch(() => {});
    }
  };

  const handleSignOut = async () => {
    await signOut();
    await signOutClerkSession();
    if (clerkSignOut) await clerkSignOut();
    setUser(null);
    setShowProfileSettings(false);
    setProfile({ name: "", situation: "", values: [] });
    setDecisionContext(null);
    setScreen("landing");
  };

  const exitShared = () => {
    window.history.pushState({}, "", "/");
    setSharedId(null);
    setScreen("landing");
  };

  const userBadge = user ? (
    <button className="user-badge" onClick={() => setShowProfileSettings(true)} aria-label={t(language, "profile_settings")}>
      {(user.customPicture || user.googlePicture)
        ? <img src={user.customPicture || user.googlePicture} alt="" />
        : <span className="user-initial">{(user.name || "?")[0].toUpperCase()}</span>
      }
    </button>
  ) : null;

  if (checkingSession) return (
    <div className="council-root">
      <div className="grain" />
      <div className="page-main" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100dvh" }} aria-label={t(language, "loading")} role="status">
        <span className="dots"><i /><i /><i /></span>
      </div>
    </div>
  );

  const rootClass = [
    "council-root",
    consentBannerVisible && !showCookieSettings ? "consent-banner-active" : "",
  ].filter(Boolean).join(" ");

  const footer = (
    <footer className="site-footer">
      <div className="footer-inner">
        <span className="footer-brand" style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><CouncilLogo size={13} />The Council</span>
        <span className="footer-note">{t(language, "footer_disclaimer")}</span>
        <span className="footer-links">
          <a href="/privacy" onClick={e => { e.preventDefault(); setStaticPage("privacy"); }}>{t(language, "footer_privacy")}</a>
          <span className="footer-sep">·</span>
          <a href="/terms" onClick={e => { e.preventDefault(); setStaticPage("terms"); }}>{t(language, "footer_terms")}</a>
          <span className="footer-sep">·</span>
          <button className="footer-link-btn" onClick={() => setShowCookieSettings(true)}>{t(language, "footer_cookie_settings")}</button>
          <span className="footer-sep">·</span>
          <a href="https://github.com/CesarNog/the-council" target="_blank" rel="noopener noreferrer">GitHub</a>
          <span className="footer-sep">·</span>
          <a href="https://buymeacoffee.com/cesarnog" target="_blank" rel="noopener noreferrer" className="footer-link-coffee">{t(language, "buy_me_coffee")}</a>
          <span className="footer-sep">·</span>
          <span>{t(language, "developed_by")} <a href="https://github.com/CesarNog" target="_blank" rel="noopener noreferrer">CesarNog</a></span>
          <span className="footer-sep">·</span>
          <span>© 2026</span>
        </span>
      </div>
    </footer>
  );

  const consentUi = (
    <>
      {consentBannerVisible && !showCookieSettings && (
        <ConsentBanner
          language={language}
          onAccept={() => { acceptAll(); initAnalytics(); initAds(); dismissConsentBanner(); }}
          onReject={() => { rejectOptional(); dismissConsentBanner(); }}
          onSettings={() => setShowCookieSettings(true)}
        />
      )}
      {showCookieSettings && (
        <CookieSettings
          language={language}
          onSave={() => { initAnalytics(); initAds(); setShowCookieSettings(false); dismissConsentBanner(); }}
          onClose={() => setShowCookieSettings(false)}
        />
      )}
    </>
  );

  return (
    <div className={rootClass}>
      <div className="grain" />
      <header className="site-header">
        <button className="brand" onClick={() => { if (staticPage) setStaticPage(null); else if (screen !== "landing" && !sharedId) setScreen("landing"); }}>
          <CouncilLogo size={20} className="brand-logo" />
          <span className="brand-name">The Council</span>
        </button>
        <div className="header-right">
          <LanguageSelector language={language} onChange={changeLanguage} />
          <button className="theme-toggle" onClick={toggleTheme} aria-label={theme === "dark" ? t(language, "theme_switch_to_light") : t(language, "theme_switch_to_dark")}>
            {theme === "dark" ? "☀" : "☾"}
          </button>
          {loginError && (
            <div className="login-error-tooltip" role="alert">
              {t(language, loginError)}
              <button className="login-error-dismiss" onClick={() => setLoginError(null)} aria-label={t(language, "dismiss")}>✕</button>
            </div>
          )}
          {userBadge}
        </div>
      </header>

      <main className="page-main">
        {staticPage ? (
          <StaticPage page={staticPage} language={language} onBack={() => setStaticPage(null)} />
        ) : is404 ? (
          <NotFoundPage language={language} onHome={() => { window.history.pushState({}, "", "/"); window.location.reload(); }} />
        ) : (
          <>
            {screen === "landing" && <div className="ambient" style={{ background: "radial-gradient(50% 40% at 50% 30%, rgba(201,169,110,.08), transparent 70%)" }} />}
            {screen === "landing" && (
              <Landing
                onEnter={(q) => {
                  if (q) { setQuickQuestion(q); setScreen("chamber"); }
                  else if (user && userHasCompletedProfile(user)) setScreen("chamber");
                  else setScreen("onboarding");
                }}
                authSlot={!user && (
                  <CouncilSignIn
                    language={language}
                    onCredential={handleCredential}
                    onClerkUser={handleAuthUser}
                    onClerkError={() => setLoginError("login_error_generic")}
                  />
                )}
                language={language}
                history={loadHistory()}
                onRevisit={(q) => { setQuickQuestion(q); setScreen("chamber"); }}
                displayName={displayName}
                authenticated={!!user}
              />
            )}
            {screen === "onboarding" && (
              <Onboarding
                onDone={handleOnboardingDone}
                initial={user ? { name: user.name, situation: user.situation, values: user.values } : null}
                language={language}
                googleNames={user?.name ? [user.name.split(" ")[0], user.name].filter((n, i, a) => a.indexOf(n) === i) : null}
                initialDisplayName={displayName}
              />
            )}
            {screen === "chamber" && (
              <Chamber
                profile={profile}
                language={language}
                preloaded={eclipsePreview}
                initialQuestion={decisionQuestion || quickQuestion}
                decisionContext={decisionContext}
                lifeModeSlot={(user?.lifeMode || localLifeMode) && (
                  <LifeModeBanner
                    lifeMode={user?.lifeMode || localLifeMode}
                    language={language}
                    onDismiss={() => { setUser(u => u ? { ...u, lifeMode: null } : u); setLocalLifeMode(null); }}
                  />
                )}
              />
            )}
            {screen === "shared" && sharedId && (
              <SharedGate
                id={sharedId}
                language={language}
                onExit={exitShared}
                onEnter={() => {
                  window.history.pushState({}, "", "/");
                  setSharedId(null);
                  if (user && userHasCompletedProfile(user)) setScreen("chamber");
                  else setScreen("onboarding");
                }}
              />
            )}
          </>
        )}
      </main>

      {showProfileSettings && user && (
        <ProfileSettings
          user={user}
          language={language}
          theme={theme}
          onThemeToggle={toggleTheme}
          onLanguageChange={changeLanguage}
          onSave={(u) => { setUser(u); setProfile(p => ({ ...p, situation: u.situation, values: u.values })); setShowProfileSettings(false); }}
          onClose={() => setShowProfileSettings(false)}
          onSignOut={handleSignOut}
          onRevisit={(q) => { setQuickQuestion(q); setShowProfileSettings(false); setScreen("chamber"); }}
        />
      )}

      {footer}
      {consentUi}
    </div>
  );
}

function TheCouncilAppWithClerk() {
  const { signOut: clerkSignOut } = useAuth();
  return <TheCouncilApp clerkSignOut={clerkSignOut} />;
}

export default function TheCouncil() {
  return (
    <ErrorBoundary>
      <AppProviders>
        {isClerkEnabled() ? <TheCouncilAppWithClerk /> : <TheCouncilApp />}
      </AppProviders>
    </ErrorBoundary>
  );
}
