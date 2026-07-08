import { byId } from "./personas.js";

export async function summonCouncil(question, profile, language, decisionContext, personaIds) {
  const res = await fetch("/api/council", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, profile, language, decisionContext, ...(personaIds?.length >= 3 ? { personaIds } : {}) }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || "council unreachable");
    err.kind = res.status === 429 ? "rate_limited" : (body.error || "unreachable");
    if (body.retryAfter) err.retryAfter = body.retryAfter;
    throw err;
  }
  const json = await res.json();
  if (!Array.isArray(json.turns) || !Array.isArray(json.votes) || !json.verdict) throw new Error("bad shape");
  json.turns = json.turns.filter(t => byId[t.p] && t.t);
  json.votes = json.votes.filter(v => byId[v.p]);
  return json;
}

export const DEMO_Q = "Should I quit my job and start something of my own?";

// Static offline demo debate — shown when the Groq API is unreachable. One full
// debate per supported UI language so a fallback never mixes languages on screen.
const FALLBACK_BY_LANG = {
  en: {
    mood: "tense",
    quote: "Staying is just fear wearing a salary.",
    turns: [
      { p: "founder",     t: "Quit. Every month you stay, you're paying tuition for a school you already graduated from." },
      { p: "scientist",   t: "Base rates, Founder: most new ventures die within five years. What's the runway — twelve months of savings? Six?" },
      { p: "billionaire", t: "The Scientist is right about the odds and wrong about the frame. The venture doesn't need to work. You need to survive long enough to get lucky." },
      { p: "monk",        t: "Before you leave the job — can you sit quietly with why you want to leave it?" },
      { p: "shadow",      t: "I'll say it: you don't hate the job. You hate that nobody claps for you there anymore." },
      { p: "artist",      t: "Ouch, Shadow. But hear this — a life written in someone else's font is still someone else's story." },
      { p: "athlete",     t: "Talk is cheap. Have you ever shipped anything at 6 a.m. before work? Quitting won't install discipline. Reps first." },
      { p: "explorer",    t: "The Athlete makes it sound like a prison sentence. Build the smallest real version this month — you can't map a coastline from the harbor." },
      { p: "romantic",    t: "No one has asked who else lives inside this decision. What will your people carry while you 'find yourself'?" },
      { p: "founder",     t: "Romantic, safety is also a cost. It just bills your future instead of your present." },
      { p: "scientist",   t: "Then run the experiment cheaply: one paying customer before you resign. Evidence, not vibes." },
      { p: "monk",        t: "Perhaps the answer is not quit or stay. It is: stop hiding inside either one." },
    ],
    votes: [
      { p: "founder",     v: "yes",     r: "Asymmetric upside. You're young in decision-years." },
      { p: "billionaire", v: "depends", r: "Yes — the day your runway reaches twelve months." },
      { p: "artist",      v: "yes",     r: "You're dimming. I can hear it from here." },
      { p: "athlete",     v: "no",      r: "Earn it first. Build before you leap." },
      { p: "monk",        v: "depends", r: "The question itself isn't ripe yet." },
      { p: "scientist",   v: "no",      r: "No evidence yet. Get one paying customer." },
      { p: "explorer",    v: "yes",     r: "Regret compounds faster than savings." },
      { p: "romantic",    v: "depends", r: "Only with the people you love on board." },
      { p: "shadow",      v: "yes",     r: "Staying is just fear wearing a salary." },
    ],
    verdict: "The Council leans toward leaving — but not tonight. Build the smallest real version while employed, secure your runway and one paying customer, and bring the people you love into the plan before you sign anything.",
    question: "What would you build first if you knew no one would ever clap?",
    realities: [
      { label: "The Safe Path", line: "You stay another year, get the promotion, and wonder every Sunday night what you didn't try." },
      { label: "The Side Door", line: "You build it nights and weekends for six months before ever quitting anything." },
      { label: "The Leap", line: "You quit Friday, panic Monday, and either build something real or learn exactly why the job made sense." },
    ],
  },
  pt: {
    mood: "tense",
    quote: "Ficar é só medo usando fantasia de salário.",
    turns: [
      { p: "founder",     t: "Sai. Cada mês que você fica, está pagando mensalidade de uma escola da qual já se formou." },
      { p: "scientist",   t: "Taxas base, Fundador: a maioria dos empreendimentos morre em cinco anos. Qual é o seu fôlego — doze meses de reserva? Seis?" },
      { p: "billionaire", t: "O Cientista está certo sobre as chances e errado sobre o enquadramento. O negócio não precisa dar certo. Você precisa sobreviver tempo suficiente para ter sorte." },
      { p: "monk",        t: "Antes de deixar o emprego — você consegue sentar em silêncio com o motivo real de querer sair?" },
      { p: "shadow",      t: "Eu vou dizer: você não odeia o emprego. Você odeia que ninguém mais bate palma pra você lá." },
      { p: "artist",      t: "Ai, Sombra. Mas escute isto — uma vida escrita na fonte de outra pessoa ainda é a história de outra pessoa." },
      { p: "athlete",     t: "Conversa é barata. Você já entregou algo às 6 da manhã antes do trabalho? Sair não instala disciplina. Repetição primeiro." },
      { p: "explorer",    t: "O Atleta faz soar como pena de prisão. Construa a menor versão real ainda este mês — você não mapeia um litoral do porto." },
      { p: "romantic",    t: "Ninguém perguntou quem mais vive dentro dessa decisão. O que suas pessoas vão carregar enquanto você 'se encontra'?" },
      { p: "founder",     t: "Romântico, segurança também tem custo. Só que ela cobra do seu futuro, não do seu presente." },
      { p: "scientist",   t: "Então rode o experimento barato: um cliente pagante antes de pedir demissão. Evidência, não vibração." },
      { p: "monk",        t: "Talvez a resposta não seja sair ou ficar. Seja: parar de se esconder dentro de qualquer uma das duas." },
    ],
    votes: [
      { p: "founder",     v: "yes",     r: "Vantagem assimétrica. Você é jovem em anos de decisão." },
      { p: "billionaire", v: "depends", r: "Sim — no dia em que seu fôlego chegar a doze meses." },
      { p: "artist",      v: "yes",     r: "Você está apagando. Dá pra ouvir daqui." },
      { p: "athlete",     v: "no",      r: "Conquiste primeiro. Construa antes de saltar." },
      { p: "monk",        v: "depends", r: "A pergunta em si ainda não amadureceu." },
      { p: "scientist",   v: "no",      r: "Ainda sem evidência. Consiga um cliente pagante." },
      { p: "explorer",    v: "yes",     r: "O arrependimento composta mais rápido que a poupança." },
      { p: "romantic",    v: "depends", r: "Só com as pessoas que você ama no barco." },
      { p: "shadow",      v: "yes",     r: "Ficar é só medo usando fantasia de salário." },
    ],
    verdict: "O Conselho inclina-se para a saída — mas não hoje à noite. Construa a menor versão real enquanto ainda está empregado, garanta seu fôlego financeiro e um cliente pagante, e traga as pessoas que você ama para o plano antes de assinar qualquer coisa.",
    question: "O que você construiria primeiro se soubesse que ninguém jamais bateria palma?",
    realities: [
      { label: "O Caminho Seguro", line: "Você fica mais um ano, consegue a promoção, e se pergunta todo domingo à noite o que não tentou." },
      { label: "A Porta Lateral", line: "Você constrói nas noites e fins de semana por seis meses antes de sair de qualquer coisa." },
      { label: "O Salto", line: "Você sai na sexta, entra em pânico na segunda, e ou constrói algo real ou aprende exatamente por que o emprego fazia sentido." },
    ],
  },
  es: {
    mood: "tense",
    quote: "Quedarse es solo miedo disfrazado de salario.",
    turns: [
      { p: "founder",     t: "Renuncia. Cada mes que te quedas, pagas matrícula en una escuela de la que ya te graduaste." },
      { p: "scientist",   t: "Tasas base, Fundador: la mayoría de los emprendimientos mueren en cinco años. ¿Cuál es tu margen — doce meses de ahorro? ¿Seis?" },
      { p: "billionaire", t: "El Científico tiene razón sobre las probabilidades y se equivoca en el enfoque. El negocio no necesita funcionar. Necesitas sobrevivir lo suficiente para tener suerte." },
      { p: "monk",        t: "Antes de dejar el trabajo — ¿puedes sentarte en silencio con el motivo real de querer irte?" },
      { p: "shadow",      t: "Lo diré yo: no odias el trabajo. Odias que ya nadie te aplaude ahí." },
      { p: "artist",      t: "Auch, Sombra. Pero escucha esto — una vida escrita en la fuente de otro sigue siendo la historia de otro." },
      { p: "athlete",     t: "Hablar es barato. ¿Has entregado algo a las 6 a.m. antes del trabajo alguna vez? Renunciar no instala disciplina. Repeticiones primero." },
      { p: "explorer",    t: "El Atleta lo hace sonar como una condena. Construye la versión más pequeña y real este mismo mes — no puedes mapear una costa desde el puerto." },
      { p: "romantic",    t: "Nadie ha preguntado quién más vive dentro de esta decisión. ¿Qué cargarán los tuyos mientras tú 'te encuentras'?" },
      { p: "founder",     t: "Romántico, la seguridad también tiene un costo. Solo que se lo cobra a tu futuro, no a tu presente." },
      { p: "scientist",   t: "Entonces corre el experimento barato: un cliente que pague antes de renunciar. Evidencia, no vibras." },
      { p: "monk",        t: "Quizás la respuesta no es renunciar o quedarse. Es: dejar de esconderte dentro de cualquiera de las dos." },
    ],
    votes: [
      { p: "founder",     v: "yes",     r: "Ventaja asimétrica. Eres joven en años de decisión." },
      { p: "billionaire", v: "depends", r: "Sí — el día que tu margen llegue a doce meses." },
      { p: "artist",      v: "yes",     r: "Te estás apagando. Se oye desde aquí." },
      { p: "athlete",     v: "no",      r: "Gánatelo primero. Construye antes de saltar." },
      { p: "monk",        v: "depends", r: "La pregunta en sí aún no está madura." },
      { p: "scientist",   v: "no",      r: "Todavía sin evidencia. Consigue un cliente que pague." },
      { p: "explorer",    v: "yes",     r: "El arrepentimiento compone más rápido que los ahorros." },
      { p: "romantic",    v: "depends", r: "Solo con las personas que amas a bordo." },
      { p: "shadow",      v: "yes",     r: "Quedarse es solo miedo disfrazado de salario." },
    ],
    verdict: "El Consejo se inclina hacia irse — pero no esta noche. Construye la versión más pequeña y real mientras sigues empleado, asegura tu margen y un cliente que pague, y trae a las personas que amas al plan antes de firmar nada.",
    question: "¿Qué construirías primero si supieras que nadie te aplaudiría jamás?",
    realities: [
      { label: "El Camino Seguro", line: "Te quedas un año más, consigues el ascenso, y te preguntas cada domingo por la noche qué no intentaste." },
      { label: "La Puerta Lateral", line: "Lo construyes por las noches y fines de semana durante seis meses antes de renunciar a nada." },
      { label: "El Salto", line: "Renuncias el viernes, entras en pánico el lunes, y o construyes algo real o aprendes exactamente por qué el trabajo tenía sentido." },
    ],
  },
  zh: {
    mood: "tense",
    quote: "留下只是穿着薪水外衣的恐惧。",
    turns: [
      { p: "founder",     t: "辞职吧。你多留一个月，就是在为一所你早已毕业的学校缴学费。" },
      { p: "scientist",   t: "看基础概率，创业者：大多数新创业在五年内消亡。你的跑道有多长——十二个月的存款？还是六个月？" },
      { p: "billionaire", t: "科学家的概率没错，但框架错了。这个项目不需要成功，你只需要活得够久，等到运气降临。" },
      { p: "monk",        t: "在辞职之前——你能安静地坐下来，问问自己为什么真的想离开吗？" },
      { p: "shadow",      t: "我来说吧：你不是讨厌这份工作。你是受不了那里已经没人为你鼓掌了。" },
      { p: "artist",      t: "阴影自我，扎心了。但听我说——用别人的字体写就的人生，依然是别人的故事。" },
      { p: "athlete",     t: "说得容易。你有没有在上班前的清晨六点交付过什么？辞职不会自动带来纪律，先从重复训练开始。" },
      { p: "explorer",    t: "运动员说得像是判了无期徒刑。这个月就先搭个最小可行版本——你没法在港口里画出海岸线。" },
      { p: "romantic",    t: "没有人问过，这个决定里还牵动着谁的人生。当你'找自己'的时候，你爱的人要承受什么？" },
      { p: "founder",     t: "浪漫者，安全感也是有代价的，只是它向你的未来收费，而不是向你的现在。" },
      { p: "scientist",   t: "那就用便宜的方式做实验：辞职前先拿到一个付费客户。要证据，不要感觉。" },
      { p: "monk",        t: "也许答案不是辞职或留下，而是：不要再躲在这两个选项的任何一个里。" },
    ],
    votes: [
      { p: "founder",     v: "yes",     r: "不对称的上行空间。你的决策年龄还很年轻。" },
      { p: "billionaire", v: "depends", r: "是的——等你的跑道到十二个月的那天。" },
      { p: "artist",      v: "yes",     r: "你的光正在黯淡，我从这里都能听见。" },
      { p: "athlete",     v: "no",      r: "先去挣得资格，先构建，再跳跃。" },
      { p: "monk",        v: "depends", r: "这个问题本身还没有成熟。" },
      { p: "scientist",   v: "no",      r: "还没有证据。先拿到一个付费客户。" },
      { p: "explorer",    v: "yes",     r: "遗憾的复利比储蓄增长得更快。" },
      { p: "romantic",    v: "depends", r: "只有带上你爱的人才可以。" },
      { p: "shadow",      v: "yes",     r: "留下只是穿着薪水外衣的恐惧。" },
    ],
    verdict: "议会倾向于离开——但不是今晚。在仍受雇期间搭建最小可行版本，确保你的跑道和一个付费客户，并在签下任何东西之前，把你爱的人带入这个计划。",
    question: "如果你知道永远不会有人为你鼓掌，你会最先建造什么？",
    realities: [
      { label: "安全之路", line: "你再留一年，获得晋升，然后每个周日晚上都在想自己没有尝试的是什么。" },
      { label: "侧门之路", line: "你用六个月的夜晚和周末去搭建它，然后才真正辞掉任何东西。" },
      { label: "纵身一跃", line: "你周五辞职，周一恐慌，然后要么建成真正的东西，要么明白这份工作原本为何合理。" },
    ],
  },
};

export function getFallback(language) {
  return FALLBACK_BY_LANG[language] || FALLBACK_BY_LANG.en;
}

// Kept for backward compatibility with any direct importer — prefer getFallback(language).
export const FALLBACK = FALLBACK_BY_LANG.en;
