export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
  { code: "es", label: "Español" },
  { code: "zh", label: "中文" },
];

export const TTS_LANG = { en: "en-US", pt: "pt-BR", es: "es-ES", zh: "zh-CN" };

export function detectBrowserLanguage() {
  if (typeof navigator === "undefined") return "en";
  const code = (navigator.language || "en").slice(0, 2).toLowerCase();
  return LANGUAGES.some(l => l.code === code) ? code : "en";
}

const S = {
  landing_title_1: { en: "Nine versions of you.", pt: "Nove versões de você.", es: "Nueve versiones de ti.", zh: "九个版本的你。" },
  landing_title_em: { en: "One verdict.", pt: "Um veredito.", es: "Un veredicto.", zh: "一个裁决。" },
  landing_sub: {
    en: "Bring one real decision. The Founder, the Monk, the Shadow, and six other versions of you will disagree, debate, and vote.",
    pt: "Traga uma decisão real. O Fundador, o Monge, a Sombra e seis outras versões suas irão discordar, debater e votar.",
    es: "Trae una decisión real. El Fundador, el Monje, la Sombra y otras seis versiones tuyas discutirán, debatirán y votarán.",
    zh: "带来一个真实的决定。创业者、僧人、阴影自我和其他六个版本的你将争论、辩论并投票。",
  },
  landing_trust: {
    en: "One question. Nine perspectives. One shareable verdict.",
    pt: "Uma pergunta. Nove perspectivas. Um veredito compartilhável.",
    es: "Una pregunta. Nueve perspectivas. Un veredicto compartible.",
    zh: "一个问题。九种视角。一份可分享的裁决。",
  },
  landing_secondary_cta: {
    en: "See a decision on trial",
    pt: "Ver uma decisão em julgamento",
    es: "Ver una decisión en juicio",
    zh: "查看审议中的决定",
  },
  landing_greeting_anon: {
    en: "Bring the question you've been avoiding.",
    pt: "Traga a pergunta que você vem evitando.",
    es: "Trae la pregunta que has estado evitando.",
    zh: "带来那个你一直在回避的问题。",
  },
  landing_how_title: { en: "How it works", pt: "Como funciona", es: "Cómo funciona", zh: "如何运作" },
  landing_how_ask_title: { en: "Ask", pt: "Pergunte", es: "Pregunta", zh: "提问" },
  landing_how_ask_body: { en: "Bring a real decision.", pt: "Traga uma decisão real.", es: "Trae una decisión real.", zh: "带来一个真实的决定。" },
  landing_how_disagree_title: { en: "Watch them disagree", pt: "Veja-os discordar", es: "Míralos discutir", zh: "看他们争论" },
  landing_how_disagree_body: { en: "Nine versions of you enter conflict.", pt: "Nove versões suas entram em conflito.", es: "Nueve versiones tuyas entran en conflicto.", zh: "你的九个版本陷入冲突。" },
  landing_how_verdict_title: { en: "Receive the verdict", pt: "Receba o veredito", es: "Recibe el veredicto", zh: "接收裁决" },
  landing_how_verdict_body: { en: "The Council votes. You decide.", pt: "O Conselho vota. Você decide.", es: "El Consejo vota. Tú decides.", zh: "议会投票。你来决定。" },
  landing_personas_title: { en: "The nine seats", pt: "Os nove assentos", es: "Los nueve asientos", zh: "九个席位" },
  landing_personas_sub: { en: "Each voice sees your decision differently.", pt: "Cada voz vê sua decisão de forma diferente.", es: "Cada voz ve tu decisión de forma distinta.", zh: "每个声音都以不同方式看待你的决定。" },
  landing_examples_title: { en: "Questions others brought", pt: "Perguntas que outros trouxeram", es: "Preguntas que otros trajeron", zh: "他人带来的问题" },
  landing_verdict_preview_title: { en: "What you receive", pt: "O que você recebe", es: "Lo que recibes", zh: "你将得到什么" },
  landing_verdict_tag: { en: "Shareable verdict card", pt: "Cartão de veredito compartilhável", es: "Tarjeta de veredicto compartible", zh: "可分享的裁决卡片" },
  landing_final_cta_title: { en: "The chamber is open.", pt: "A câmara está aberta.", es: "La cámara está abierta.", zh: "议事厅已开放。" },
  landing_sample_question: {
    en: "Should I choose stability or freedom?",
    pt: "Devo escolher estabilidade ou liberdade?",
    es: "¿Debo elegir estabilidad o libertad?",
    zh: "我应该选择稳定还是自由？",
  },
  landing_sample_tally: { en: "YES 5 · NO 1 · DEPENDS 3", pt: "SIM 5 · NÃO 1 · DEPENDE 3", es: "SÍ 5 · NO 1 · DEPENDE 3", zh: "赞成 5 · 反对 1 · 待定 3" },
  landing_sample_verdict: {
    en: "The Council leans yes — but not on impulse. Build the bridge first.",
    pt: "O Conselho inclina-se ao sim — mas não ao impulso. Primeiro, construa uma ponte.",
    es: "El Consejo se inclina al sí — pero no por impulso. Primero, construye un puente.",
    zh: "议会倾向赞成——但不是出于冲动。先搭建桥梁。",
  },
  landing_ex_q1: { en: "Should I quit my job or am I just exhausted?", pt: "Devo largar meu emprego ou estou apenas cansado?", es: "¿Debo dejar mi trabajo o solo estoy agotado?", zh: "我应该辞职还是只是累了？" },
  landing_ex_q2: { en: "Is this dream still mine or just an old idea?", pt: "Esse sonho ainda é meu ou só uma ideia antiga?", es: "¿Este sueño sigue siendo mío o solo una idea antigua?", zh: "这个梦想还是我的吗，还是只是旧想法？" },
  landing_ex_q3: { en: "Am I choosing love or fear of being alone?", pt: "Estou escolhendo amor ou medo de ficar sozinho?", es: "¿Estoy eligiendo amor o miedo a estar solo?", zh: "我选择的是爱还是害怕孤独？" },
  landing_ex_q4: { en: "Should I choose stability or freedom?", pt: "Devo escolher estabilidade ou liberdade?", es: "¿Debo elegir estabilidad o libertad?", zh: "我应该选择稳定还是自由？" },
  landing_ex_q5: { en: "What would my 80-year-old self think of this choice?", pt: "O que minha versão de 80 anos acharia dessa escolha?", es: "¿Qué pensaría mi yo de 80 años de esta elección?", zh: "80岁的我会如何看待这个选择？" },
  landing_ex_q6: { en: "Am I staying out of strategy or out of fear?", pt: "Estou ficando por estratégia ou por medo?", es: "¿Me quedo por estrategia o por miedo?", zh: "我留下是出于策略还是出于恐惧？" },
  landing_hover_founder: { en: "Build before you are ready.", pt: "Construa antes de estar pronto.", es: "Construye antes de estar listo.", zh: "还没准备好就开始。" },
  landing_hover_billionaire: { en: "Risk without a plan is vanity.", pt: "Risco sem plano é vaidade.", es: "El riesgo sin plan es vanidad.", zh: "没有计划的风险是虚荣。" },
  landing_hover_artist: { en: "Make it real before it is perfect.", pt: "Torne real antes de ser perfeito.", es: "Hazlo real antes de que sea perfecto.", zh: "完美之前先让它成真。" },
  landing_hover_athlete: { en: "Discipline decides.", pt: "Disciplina decide.", es: "La disciplina decide.", zh: "纪律决定一切。" },
  landing_hover_monk: { en: "Peace is also a strategy.", pt: "Paz também é estratégia.", es: "La paz también es estrategia.", zh: "平静也是一种策略。" },
  landing_hover_scientist: { en: "Test before you believe.", pt: "Teste antes de acreditar.", es: "Prueba antes de creer.", zh: "相信之前先验证。" },
  landing_hover_explorer: { en: "Life shrinks when nothing changes.", pt: "A vida encolhe quando nada muda.", es: "La vida se encoge cuando nada cambia.", zh: "一成不变，生命就会萎缩。" },
  landing_hover_romantic: { en: "The heart collects evidence too.", pt: "O coração também coleta evidências.", es: "El corazón también recopila evidencias.", zh: "心灵也在收集证据。" },
  landing_hover_shadow: { en: "You already know what you avoid.", pt: "Você já sabe o que evita.", es: "Ya sabes lo que evitas.", zh: "你早已知道你逃避什么。" },
  landing_philo_founder: { en: "Start small. But start.", pt: "Comece pequeno. Mas comece.", es: "Empieza pequeño. Pero empieza.", zh: "从小处开始。但要开始。" },
  landing_philo_billionaire: { en: "Risk without a plan is vanity.", pt: "Risco sem plano é vaidade.", es: "El riesgo sin plan es vanidad.", zh: "没有计划的风险是虚荣。" },
  landing_philo_artist: { en: "What isn't expressed rots.", pt: "O que não é expresso apodrece.", es: "Lo que no se expresa se pudre.", zh: "未表达的东西会腐烂。" },
  landing_philo_athlete: { en: "Discipline decides.", pt: "Disciplina decide.", es: "La disciplina decide.", zh: "纪律决定一切。" },
  landing_philo_monk: { en: "Not every urgency deserves obedience.", pt: "Nem toda urgência merece obediência.", es: "No toda urgencia merece obediencia.", zh: "并非每种紧迫都值得服从。" },
  landing_philo_scientist: { en: "Test before you believe.", pt: "Teste antes de acreditar.", es: "Prueba antes de creer.", zh: "相信之前先验证。" },
  landing_philo_explorer: { en: "Life shrinks when nothing changes.", pt: "A vida encolhe quando nada muda.", es: "La vida se encoge cuando nada cambia.", zh: "一成不变，生命就会萎缩。" },
  landing_philo_romantic: { en: "The heart collects evidence too.", pt: "O coração também coleta evidências.", es: "El corazón también recopila evidencias.", zh: "心灵也在收集证据。" },
  landing_philo_shadow: { en: "You call it prudence. I call it fear.", pt: "Você chama de prudência. Eu chamo de medo.", es: "Lo llamas prudencia. Yo lo llamo miedo.", zh: "你称之为谨慎。我称之为恐惧。" },
  enter_chamber: { en: "Enter the chamber", pt: "Entrar na câmara", es: "Entrar a la cámara", zh: "进入议事厅" },

  onb_progress_1: { en: "Rite of entry · I", pt: "Ritual de entrada · I", es: "Rito de entrada · I", zh: "入场仪式 · 一" },
  onb_progress_2: { en: "Rite of entry · II", pt: "Ritual de entrada · II", es: "Rito de entrada · II", zh: "入场仪式 · 二" },
  onb_progress_3: { en: "Rite of entry · III", pt: "Ritual de entrada · III", es: "Rito de entrada · III", zh: "入场仪式 · 三" },
  onb_name_q: { en: "What shall the Council call you?", pt: "Como o Conselho deve chamá-lo?", es: "¿Cómo debería llamarte el Consejo?", zh: "议会该怎么称呼你？" },
  onb_name_hint: { en: "A first name is enough. They already know the rest.", pt: "Um primeiro nome basta. Eles já sabem o resto.", es: "Basta con un nombre. Ya saben el resto.", zh: "一个名字就够了，其余的他们已经知道。" },
  onb_name_placeholder: { en: "Your name", pt: "Seu nome", es: "Tu nombre", zh: "你的名字" },
  onb_situation_q: { en: "Where do you stand right now?", pt: "Onde você está agora?", es: "¿Dónde te encuentras ahora?", zh: "你现在处于什么状态？" },
  onb_situation_hint: { en: "One honest line. They can smell a rehearsed answer.", pt: "Uma linha honesta. Eles percebem uma resposta ensaiada.", es: "Una línea honesta. Notan una respuesta ensayada.", zh: "写一句真实的话，他们能察觉出排练过的答案。" },
  onb_situation_placeholder: { en: "e.g. Product manager, 31, restless", pt: "ex: Gerente de produto, 31 anos, inquieto", es: "ej: Gerente de producto, 31 años, inquieto", zh: "例：产品经理，31岁，心神不定" },
  onb_values_q: { en: "What do you protect above all?", pt: "O que você protege acima de tudo?", es: "¿Qué proteges por encima de todo?", zh: "你最珍视什么？" },
  onb_values_hint: { en: "Choose up to three. The Council will remember.", pt: "Escolha até três. O Conselho vai lembrar.", es: "Elige hasta tres. El Consejo lo recordará.", zh: "最多选择三项，议会会记住。" },
  continue: { en: "Continue", pt: "Continuar", es: "Continuar", zh: "继续" },
  convene: { en: "Convene the Council", pt: "Convocar o Conselho", es: "Convocar al Consejo", zh: "召集议会" },

  value_freedom: { en: "Freedom", pt: "Liberdade", es: "Libertad", zh: "自由" },
  value_security: { en: "Security", pt: "Segurança", es: "Seguridad", zh: "安全" },
  value_meaning: { en: "Meaning", pt: "Significado", es: "Sentido", zh: "意义" },
  value_ambition: { en: "Ambition", pt: "Ambição", es: "Ambición", zh: "野心" },
  value_love: { en: "Love", pt: "Amor", es: "Amor", zh: "爱" },
  value_peace: { en: "Peace", pt: "Paz", es: "Paz", zh: "平静" },
  value_truth: { en: "Truth", pt: "Verdade", es: "Verdad", zh: "真理" },
  value_adventure: { en: "Adventure", pt: "Aventura", es: "Aventura", zh: "冒险" },

  chamber_label: { en: "The Chamber", pt: "A Câmara", es: "La Cámara", zh: "议事厅" },
  in_session_for: { en: name => `In session for ${name}`, pt: name => `Em sessão para ${name}`, es: name => `En sesión para ${name}`, zh: name => `正在为${name}议事` },
  verdict_reached: { en: "A verdict already reached", pt: "Um veredito já alcançado", es: "Un veredicto ya alcanzado", zh: "已有裁决" },
  chamber_title_idle: { en: "The chamber awaits", pt: "A câmara aguarda", es: "La cámara espera", zh: "议事厅等候中" },
  chamber_title_active: { en: "The Council is in session", pt: "O Conselho está em sessão", es: "El Consejo está en sesión", zh: "议会正在议事" },
  new_question: { en: "New question", pt: "Nova pergunta", es: "Nueva pregunta", zh: "新问题" },
  bring_question: { en: "Bring your question before the Council", pt: "Traga sua pergunta ao Conselho", es: "Trae tu pregunta al Consejo", zh: "向议会提出你的问题" },
  question_placeholder: { en: "Should I…", pt: "Devo…", es: "¿Debería…", zh: "我应该……" },
  share_link_unavailable: { en: "No shareable link is available for this verdict yet.", pt: "Ainda não há um link compartilhável para este veredito.", es: "Todavía no hay un enlace compartible para este veredicto.", zh: "此裁决暂无可分享的链接。" },
  matter_before_council: { en: "The matter before the Council", pt: "A questão diante do Conselho", es: "El asunto ante el Consejo", zh: "议会正在讨论的事项" },
  deliberating: { en: "deliberating", pt: "deliberando", es: "deliberando", zh: "商议中" },
  reflecting: { en: "reflecting", pt: "refletindo", es: "reflexionando", zh: "沉思中" },
  voting: { en: "voting", pt: "votando", es: "votando", zh: "投票中" },
  adjourned: { en: "adjourned", pt: "encerrado", es: "concluido", zh: "已结束" },
  the_nine_take_seats: { en: "The nine take their seats", pt: "Os nove tomam seus lugares", es: "Los nueve toman asiento", zh: "九人各就其位" },
  is_speaking: { en: name => `${name} is speaking`, pt: name => `${name} está falando`, es: name => `${name} está hablando`, zh: name => `${name}正在发言` },
  replying_to: { en: name => `Replying to ${name}`, pt: name => `Respondendo a ${name}`, es: name => `Respondiendo a ${name}`, zh: name => `回复 ${name}` },
  chamber_falls_quiet: { en: "The chamber falls quiet. Nine minds, weighing.", pt: "A câmara fica em silêncio. Nove mentes, ponderando.", es: "La cámara queda en silencio. Nueve mentes, sopesando.", zh: "议事厅陷入沉默，九个心灵在权衡。" },
  deliberation_closed: { en: "Deliberation closed", pt: "Deliberação encerrada", es: "Deliberación concluida", zh: "商议已结束" },
  council_votes: { en: "The Council votes", pt: "O Conselho vota", es: "El Consejo vota", zh: "议会投票" },
  vote_yes: { en: "Yes", pt: "Sim", es: "Sí", zh: "是" },
  vote_no: { en: "No", pt: "Não", es: "No", zh: "否" },
  vote_depends: { en: "It depends", pt: "Depende", es: "Depende", zh: "视情况而定" },
  yes: { en: "Yes", pt: "Sim", es: "Sí", zh: "赞成" },
  no: { en: "No", pt: "Não", es: "No", zh: "反对" },
  depends: { en: "Depends", pt: "Depende", es: "Depende", zh: "视情况" },
  in_another_life: { en: "In another life…", pt: "Em outra vida…", es: "En otra vida…", zh: "在另一种人生中……" },
  download_verdict: { en: "Download verdict card", pt: "Baixar cartão do veredito", es: "Descargar tarjeta del veredicto", zh: "下载裁决卡片" },
  copy_as_text: { en: "Copy as text", pt: "Copiar como texto", es: "Copiar como texto", zh: "复制为文本" },
  export_json: { en: "Export as JSON", pt: "Exportar como JSON", es: "Exportar como JSON", zh: "导出为 JSON" },
  export_json_done: { en: "Exported!", pt: "Exportado!", es: "¡Exportado!", zh: "已导出！" },
  bring_another: { en: "Bring another matter", pt: "Trazer outro assunto", es: "Traer otro asunto", zh: "提出新的问题" },
  chamber_stuck: { en: "The chamber doors are stuck — the Council could not be reached.", pt: "As portas da câmara emperraram — não foi possível contatar o Conselho.", es: "Las puertas de la cámara están atascadas — no se pudo contactar al Consejo.", zh: "议事厅的门卡住了——无法联系到议会。" },
  knock_again: { en: "Knock again", pt: "Bater novamente", es: "Llamar de nuevo", zh: "再次敲门" },
  something_interrupted: { en: "Something interrupted the session", pt: "Algo interrompeu a sessão", es: "Algo interrumpió la sesión", zh: "会话被中断" },
  council_needs_moment: { en: "The Council needs a moment to reconvene.", pt: "O Conselho precisa de um momento para se reunir novamente.", es: "El Consejo necesita un momento para reunirse de nuevo.", zh: "议会需要片刻重新集合。" },
  reload: { en: "Reload", pt: "Recarregar", es: "Recargar", zh: "重新加载" },

  your_presence: { en: "Your presence at the table", pt: "Sua presença à mesa", es: "Tu presencia en la mesa", zh: "你在议席中的形象" },
  change_picture: { en: "Change picture", pt: "Trocar foto", es: "Cambiar foto", zh: "更换头像" },
  name_label: { en: "Name", pt: "Nome", es: "Nombre", zh: "姓名" },
  where_you_stand: { en: "Where you stand right now", pt: "Onde você está agora", es: "Dónde te encuentras ahora", zh: "你现在的处境" },
  protect_up_to_three: { en: "What you protect above all — up to three", pt: "O que você protege acima de tudo — até três", es: "Qué proteges por encima de todo — hasta tres", zh: "你最珍视的——最多三项" },
  save: { en: "Save", pt: "Salvar", es: "Guardar", zh: "保存" },
  saving: { en: "Saving…", pt: "Salvando…", es: "Guardando…", zh: "保存中……" },
  close: { en: "Close", pt: "Fechar", es: "Cerrar", zh: "关闭" },
  sign_out: { en: "Sign out", pt: "Sair", es: "Cerrar sesión", zh: "退出登录" },
  only_image_files: { en: "Only image files.", pt: "Apenas arquivos de imagem.", es: "Solo archivos de imagen.", zh: "仅支持图片文件。" },
  could_not_read_image: { en: "Could not read that image.", pt: "Não foi possível ler essa imagem.", es: "No se pudo leer esa imagen.", zh: "无法读取该图片。" },
  could_not_save: { en: "Could not save. Try again.", pt: "Não foi possível salvar. Tente novamente.", es: "No se pudo guardar. Inténtalo de nuevo.", zh: "保存失败，请重试。" },

  dismiss: { en: "Dismiss", pt: "Dispensar", es: "Descartar", zh: "关闭" },

  rate_limited_msg: {
    en: "The Council is in high demand — too many matters this minute. Wait a moment and knock again.",
    pt: "O Conselho está em alta demanda — muitas questões neste minuto. Aguarde um momento e bata novamente.",
    es: "El Consejo tiene alta demanda — demasiados asuntos este minuto. Espera un momento y llama de nuevo.",
    zh: "议会当前需求量大——这一分钟事务过多。请稍候再敲门。",
  },
  rate_limited_retry_in: {
    en: n => `Retrying in ${n}s…`,
    pt: n => `Tentando novamente em ${n}s…`,
    es: n => `Reintentando en ${n}s…`,
    zh: n => `${n} 秒后重试…`,
  },
  rate_limited_sign_in: {
    en: "Sign in for a higher daily limit.",
    pt: "Entre para um limite diário maior.",
    es: "Inicia sesión para un límite diario mayor.",
    zh: "登录以获得更高的每日限额。",
  },

  listen: { en: name => `Listen: ${name}`, pt: name => `Ouvir: ${name}`, es: name => `Escuchar: ${name}`, zh: name => `收听：${name}` },
  listen_title: { en: "Listen", pt: "Ouvir", es: "Escuchar", zh: "收听" },
  stop: { en: "Stop", pt: "Parar", es: "Detener", zh: "停止" },
  share_native: { en: "Share", pt: "Compartilhar", es: "Compartir", zh: "分享" },
  share_native_title: { en: "The Council has ruled", pt: "O Conselho decidiu", es: "El Consejo ha decidido", zh: "议会已裁决" },
  share_yes: { en: "YES", pt: "SIM", es: "SÍ", zh: "赞成" },
  share_no: { en: "NO", pt: "NÃO", es: "NO", zh: "反对" },
  share_depends: { en: "DEPENDS", pt: "DEPENDE", es: "DEPENDE", zh: "待定" },
  share_tagline: {
    en: "— nine versions of me, one verdict",
    pt: "— nove versões de mim, um veredito",
    es: "— nueve versiones de mí, un veredicto",
    zh: "— 九个版本的我，一个裁决",
  },
  share_ruled: { en: "THE COUNCIL HAS RULED", pt: "O CONSELHO DECIDIU", es: "EL CONSEJO HA DECIDIDO", zh: "议会已裁决" },
  share_card_tagline: {
    en: "nine versions of me · one verdict",
    pt: "nove versões de mim · um veredito",
    es: "nueve versiones de mí · un veredicto",
    zh: "九个版本的我 · 一个裁决",
  },
  copy_link: { en: "Copy link", pt: "Copiar link", es: "Copiar enlace", zh: "复制链接" },
  link_copied: { en: "Copied!", pt: "Copiado!", es: "¡Copiado!", zh: "已复制！" },
  try_example: { en: "Or see the Council in action →", pt: "Experimente com uma decisão pronta →", es: "O ve al Consejo en acción →", zh: "或先看看议会如何运作 →" },
  only_x_disagreed: { en: name => `Only ${name} disagreed.`, pt: name => `Só ${name} discordou.`, es: name => `Solo ${name} discrepó.`, zh: name => `只有${name}持不同意见。` },
  every_agreed_go: { en: "Every Council member agreed. Go.", pt: "Todo o Conselho concordou. Vá em frente.", es: "Todo el Consejo estuvo de acuerdo. Adelante.", zh: "议会全体一致同意。去做吧。" },
  every_agreed_dont: { en: "Every Council member agreed. Don't.", pt: "Todo o Conselho concordou. Não faça.", es: "Todo el Consejo estuvo de acuerdo. No lo hagas.", zh: "议会全体一致同意。别做。" },
  could_not_agree: { en: "The Council could not agree.", pt: "O Conselho não chegou a um consenso.", es: "El Consejo no llegó a un acuerdo.", zh: "议会未能达成一致。" },
  leans_yes: { en: (y, n) => `The Council leans yes, ${y}–${n}.`, pt: (y, n) => `O Conselho inclina-se ao sim. ${y} vozes contra ${n}.`, es: (y, n) => `El Consejo se inclina por el sí, ${y}–${n}.`, zh: (y, n) => `议会倾向赞成，${y}比${n}。` },
  leans_no: { en: (n, y) => `The Council leans no, ${n}–${y}.`, pt: (n, y) => `O Conselho pede contenção. ${n} vozes contra ${y}.`, es: (n, y) => `El Consejo se inclina por el no, ${n}–${y}.`, zh: (n, y) => `议会倾向反对，${n}比${y}。` },
  split_middle: { en: "The Council is split down the middle.", pt: "O Conselho dividiu-se ao meio.", es: "El Consejo está completamente dividido.", zh: "议会意见完全分裂。" },

  footer_disclaimer: {
    en: "AI-generated perspectives — not professional, legal, medical or financial advice.",
    pt: "Perspectivas geradas por IA — não é aconselhamento profissional, jurídico, médico ou financeiro.",
    es: "Perspectivas generadas por IA — no es asesoramiento profesional, legal, médico o financiero.",
    zh: "AI生成的观点——不构成专业、法律、医疗或财务建议。",
  },

  council_eclipse: { en: "Council Eclipse", pt: "Eclipse do Conselho", es: "Eclipse del Consejo", zh: "议会之蚀" },
  eclipse_sub: {
    en: "For the first time, every possible version of you reached the same conclusion.",
    pt: "Pela primeira vez, todas as versões possíveis de você chegaram à mesma conclusão.",
    es: "Por primera vez, todas las versiones posibles de ti llegaron a la misma conclusión.",
    zh: "有史以来第一次，你所有可能的自我都得出了相同的结论。",
  },
  eclipse_headline: {
    en: v => `Every version of you says: ${v}.`,
    pt: v => `Toda versão de você diz: ${v}.`,
    es: v => `Toda versión de ti dice: ${v}.`,
    zh: v => `你所有的自我都说：${v}。`,
  },
  eclipse_rarity: {
    en: "This moment is exceptionally rare.",
    pt: "Este momento é excepcionalmente raro.",
    es: "Este momento es excepcionalmente raro.",
    zh: "这一刻极为罕见。",
  },
  memory_echo_label: { en: "A memory surfaces", pt: "Uma lembrança ressurge", es: "Un recuerdo aflora", zh: "一段记忆浮现" },
  chapter_question: { en: "I · The Question", pt: "I · A Questão", es: "I · La Pregunta", zh: "一 · 议题" },
  chapter_debate: { en: "II · The Debate", pt: "II · O Debate", es: "II · El Debate", zh: "二 · 辩论" },
  chapter_vote: { en: "III · The Vote", pt: "III · A Votação", es: "III · La Votación", zh: "三 · 投票" },
  chapter_verdict: { en: "IV · The Verdict", pt: "IV · O Veredito", es: "IV · El Veredicto", zh: "四 · 裁决" },
  chapter_realities: { en: "V · In Another Life", pt: "V · Em Outra Vida", es: "V · En Otra Vida", zh: "五 · 另一种人生" },
  chapter_share: { en: "VI · Share", pt: "VI · Compartilhar", es: "VI · Compartir", zh: "六 · 分享" },
  stage_responds: {
    en: name => `${name} speaks`,
    pt: name => `${name} responde`,
    es: name => `${name} habla`,
    zh: name => `${name}发言`,
  },
  copy_text_done: { en: "Copied!", pt: "Copiado!", es: "¡Copiado!", zh: "已复制！" },
  card_saved: { en: "Saved!", pt: "Salvo!", es: "¡Guardado!", zh: "已保存！" },
  share_group_share: { en: "Share", pt: "Compartilhar", es: "Compartir", zh: "分享" },
  share_group_save: { en: "Save", pt: "Salvar", es: "Guardar", zh: "保存" },
  share_group_continue: { en: "Continue", pt: "Continuar", es: "Continuar", zh: "继续" },
  read_more: { en: "Read more", pt: "Ler mais", es: "Leer más", zh: "展开" },
  read_less: { en: "Less", pt: "Menos", es: "Menos", zh: "收起" },
  your_journey: { en: "Your journey with the Council", pt: "Sua jornada com o Conselho", es: "Tu viaje con el Consejo", zh: "你与议会的旅程" },

  eclipse_react_founder: { en: "The Founder smiles with confidence.", pt: "O Fundador sorri com confiança.", es: "El Fundador sonríe con confianza.", zh: "创业者自信地微笑。" },
  eclipse_react_billionaire: { en: "The Billionaire closes the ledger, satisfied.", pt: "O Bilionário fecha o livro-caixa, satisfeito.", es: "El Multimillonario cierra el libro, satisfecho.", zh: "富豪合上账本，心满意足。" },
  eclipse_react_artist: { en: "The Artist admires the atmosphere.", pt: "O Artista admira a atmosfera.", es: "El Artista admira la atmósfera.", zh: "艺术家欣赏着这氛围。" },
  eclipse_react_athlete: { en: "The Athlete nods once, sharply.", pt: "O Atleta assente uma vez, firme.", es: "El Atleta asiente una vez, con firmeza.", zh: "运动员干脆地点了一次头。" },
  eclipse_react_monk: { en: "The Monk closes their eyes peacefully.", pt: "O Monge fecha os olhos em paz.", es: "El Monje cierra los ojos en paz.", zh: "僧人平静地闭上双眼。" },
  eclipse_react_scientist: { en: "The Scientist quietly nods.", pt: "O Cientista assente em silêncio.", es: "El Científico asiente en silencio.", zh: "科学家静静地点头。" },
  eclipse_react_explorer: { en: "The Explorer looks fascinated.", pt: "O Explorador observa, fascinado.", es: "El Explorador mira, fascinado.", zh: "探险家一脸着迷。" },
  eclipse_react_romantic: { en: "The Romantic holds a hand to their heart.", pt: "O Romântico leva a mão ao peito.", es: "El Romántico se lleva la mano al corazón.", zh: "浪漫者将手放在心口。" },
  eclipse_react_shadow: { en: "The Shadow gives a subtle smile.", pt: "A Sombra esboça um sorriso sutil.", es: "La Sombra esboza una sonrisa sutil.", zh: "阴影自我露出一丝微笑。" },
  past_questions: { en: "Questions you've brought before", pt: "Questões que você trouxe antes", es: "Preguntas que trajiste antes", zh: "你之前提出的问题" },

  // shared verdict page
  shared_gone_eyebrow: { en: "This verdict is gone", pt: "Este veredito desapareceu", es: "Este veredicto ha desaparecido", zh: "此裁决已消失" },
  shared_gone_title: { en: "The Council has already adjourned.", pt: "O Conselho já encerrou a sessão.", es: "El Consejo ya levantó la sesión.", zh: "议会已经散会。" },
  shared_gone_sub: { en: "Shared verdicts are ephemeral — they don't linger.", pt: "Os vereditos compartilhados são efêmeros — eles não persistem.", es: "Los veredictos compartidos son efímeros — no perduran.", zh: "共享的裁决是短暂的——它们不会久留。" },
  shared_gone_cta: { en: "Consult The Council about your own decision", pt: "Consulte o Conselho sobre sua própria decisão", es: "Consulta al Consejo sobre tu propia decisión", zh: "就你自己的决定咨询议会" },
  shared_loading: { en: "Recovering the record", pt: "Recuperando o registro", es: "Recuperando el registro", zh: "正在恢复记录" },
  shared_conversion_text: { en: "What would your nine voices say?", pt: "O que suas nove vozes diriam?", es: "¿Qué dirían tus nueve voces?", zh: "你的九个声音会说什么？" },
  shared_conversion_cta: { en: "⚖️ Bring your own matter before The Council", pt: "⚖️ Traga sua própria questão ao Conselho", es: "⚖️ Lleva tu propio asunto ante el Consejo", zh: "⚖️ 将你自己的问题带到议会" },

  // navigation / general
  back: { en: "← Back", pt: "← Voltar", es: "← Volver", zh: "← 返回" },

  // login errors
  login_error_unconfigured: { en: "Sign-in is temporarily unavailable.", pt: "O login está temporariamente indisponível.", es: "El inicio de sesión no está disponible temporalmente.", zh: "登录暂时不可用。" },
  login_error_network: { en: "Could not reach the server. Check your connection.", pt: "Não foi possível conectar ao servidor. Verifique sua conexão.", es: "No se pudo conectar al servidor. Comprueba tu conexión.", zh: "无法连接到服务器，请检查网络连接。" },
  login_error_generic: { en: "Sign-in failed. Please try again.", pt: "O login falhou. Por favor, tente novamente.", es: "El inicio de sesión falló. Inténtalo de nuevo.", zh: "登录失败，请重试。" },

  // profile dashboard
  profile_nav_profile:       { en: "My Profile",     pt: "Meu Perfil",    es: "Mi Perfil",       zh: "我的档案" },
  profile_nav_notifications: { en: "Notifications",  pt: "Notificações",  es: "Notificaciones",  zh: "通知" },
  profile_nav_privacy:       { en: "Privacy",        pt: "Privacidade",   es: "Privacidad",      zh: "隐私" },
  profile_nav_security:      { en: "Security",       pt: "Segurança",     es: "Seguridad",       zh: "安全" },
  profile_nav_preferences:   { en: "Preferences",    pt: "Preferências",  es: "Preferencias",    zh: "偏好" },
  profile_nav_subscription:  { en: "Subscription",   pt: "Assinatura",    es: "Suscripción",     zh: "订阅" },
  profile_nav_history:       { en: "History",        pt: "Histórico",     es: "Historial",       zh: "历史" },
  coming_soon:               { en: "Soon",           pt: "Em breve",      es: "Pronto",          zh: "即将推出" },
  profile_completeness:      { en: "Profile complete", pt: "Perfil completo", es: "Perfil completo", zh: "档案完成度" },
  profile_check_photo:       { en: "Profile photo",  pt: "Foto de perfil", es: "Foto de perfil", zh: "个人头像" },
  profile_check_name:        { en: "Name",           pt: "Nome",          es: "Nombre",          zh: "姓名" },
  profile_check_about:       { en: "About you",      pt: "Sobre você",    es: "Sobre ti",        zh: "关于你" },
  profile_check_values:      { en: "Values",         pt: "Valores",       es: "Valores",         zh: "价值观" },
  save_changes:              { en: "Save changes",   pt: "Salvar alterações", es: "Guardar cambios", zh: "保存更改" },
  changes_saved:             { en: "Changes saved",  pt: "Alterações salvas", es: "Cambios guardados", zh: "更改已保存" },

  // footer
  developed_by: { en: "Developed by", pt: "Desenvolvido por", es: "Desarrollado por", zh: "开发者" },
  buy_me_coffee: { en: "☕ Buy me a coffee", pt: "☕ Me pague um café", es: "☕ Cómprame un café", zh: "☕ 请我喝咖啡" },
  footer_privacy: { en: "Privacy", pt: "Privacidade", es: "Privacidad", zh: "隐私" },
  footer_terms: { en: "Terms", pt: "Termos", es: "Términos", zh: "条款" },
  footer_cookie_settings: { en: "Cookie Settings", pt: "Configurações de Cookies", es: "Ajustes de Cookies", zh: "Cookie设置" },

  // consent banner & cookie settings
  consent_text: {
    en: "The Council uses cookies to remember your preferences and understand how people use the product. We don't sell your data.",
    pt: "O Conselho usa cookies para lembrar suas preferências e entender como as pessoas usam o produto. Não vendemos seus dados.",
    es: "El Consejo usa cookies para recordar tus preferencias y entender cómo usan el producto. No vendemos tus datos.",
    zh: "议会使用Cookie来记住您的偏好并了解人们如何使用该产品。我们不出售您的数据。",
  },
  consent_manage: { en: "Manage", pt: "Gerenciar", es: "Gestionar", zh: "管理" },
  consent_necessary_only: { en: "Necessary only", pt: "Somente necessários", es: "Solo necesarios", zh: "仅必要" },
  consent_accept_all: { en: "Accept all", pt: "Aceitar todos", es: "Aceptar todos", zh: "全部接受" },
  cookie_settings_heading: { en: "Manage your preferences", pt: "Gerenciar suas preferências", es: "Gestionar tus preferencias", zh: "管理您的偏好" },
  consent_necessary_label: { en: "Necessary", pt: "Necessários", es: "Necesarios", zh: "必要" },
  consent_necessary_desc: { en: "Session memory, language preference. Always on.", pt: "Memória de sessão, preferência de idioma. Sempre ativo.", es: "Memoria de sesión, preferencia de idioma. Siempre activo.", zh: "会话记忆、语言偏好，始终启用。" },
  consent_always_enabled: { en: "Always enabled", pt: "Sempre ativo", es: "Siempre activo", zh: "始终启用" },
  consent_analytics_label: { en: "Analytics", pt: "Análises", es: "Análisis", zh: "数据分析" },
  consent_analytics_desc: { en: "Helps us understand how the product is used. Never tied to your identity.", pt: "Nos ajuda a entender como o produto é usado. Nunca vinculado à sua identidade.", es: "Nos ayuda a entender cómo se usa el producto. Nunca vinculado a tu identidad.", zh: "帮助我们了解产品的使用情况，从不与您的身份关联。" },
  consent_toggle_analytics: { en: "Toggle analytics", pt: "Alternar análises", es: "Alternar análisis", zh: "切换数据分析" },
  consent_advertising_label: { en: "Advertising", pt: "Publicidade", es: "Publicidad", zh: "广告" },
  consent_advertising_desc: { en: "Allows discreet ads that help keep The Council free.", pt: "Permite anúncios discretos que ajudam a manter o Conselho gratuito.", es: "Permite anuncios discretos que ayudan a mantener The Council gratis.", zh: "允许显示有助于保持议会免费的低调广告。" },
  consent_toggle_advertising: { en: "Toggle advertising", pt: "Alternar publicidade", es: "Alternar publicidad", zh: "切换广告" },
  cancel: { en: "Cancel", pt: "Cancelar", es: "Cancelar", zh: "取消" },
  save_preferences: { en: "Save preferences", pt: "Salvar preferências", es: "Guardar preferencias", zh: "保存偏好" },

  // accessibility / theme
  theme_switch_to_light: { en: "Switch to light mode", pt: "Mudar para modo claro", es: "Cambiar a modo claro", zh: "切换到浅色模式" },
  theme_switch_to_dark: { en: "Switch to dark mode", pt: "Mudar para modo escuro", es: "Cambiar a modo oscuro", zh: "切换到深色模式" },
  profile_settings: { en: "Profile settings", pt: "Configurações do perfil", es: "Configuración del perfil", zh: "个人资料设置" },
  loading: { en: "Loading", pt: "Carregando", es: "Cargando", zh: "加载中" },

  // 404
  not_found_eyebrow: { en: "Lost", pt: "Perdido", es: "Perdido", zh: "迷失" },
  not_found_title: { en: "This chamber is empty.", pt: "Esta câmara está vazia.", es: "Esta cámara está vacía.", zh: "此议室为空。" },
  not_found_sub: { en: "The path you took leads nowhere the Council has been.", pt: "O caminho que você tomou não leva a lugar algum onde o Conselho já esteve.", es: "El camino que tomaste no lleva a ningún lugar donde el Consejo haya estado.", zh: "你所走的路，议会从未涉足。" },
  not_found_cta: { en: "Return to the Council", pt: "Voltar ao Conselho", es: "Volver al Consejo", zh: "返回议会" },

  // landing personalization
  landing_greeting_named: {
    en: (name) => `${name}, bring the question you've been avoiding.`,
    pt: (name) => `${name}, traga a pergunta que você vem evitando.`,
    es: (name) => `${name}, trae la pregunta que has estado evitando.`,
    zh: (name) => `${name}，带来那个你一直在回避的问题。`,
  },
  enter_chamber_cta: {
    en: "Consult my Council",
    pt: "Consultar meu Conselho",
    es: "Consultar mi Consejo",
    zh: "咨询我的议会",
  },
  enter_chamber_sub: {
    en: "You'll ask a question. They'll disagree, debate, and vote.",
    pt: "Você fará uma pergunta. Eles irão discordar, debater e votar.",
    es: "Harás una pregunta. Ellos discutirán, debatirán y votarán.",
    zh: "你会提出一个问题。他们会争论、辩论并投票。",
  },
  auth_or: {
    en: "or continue with",
    pt: "ou entre com",
    es: "o entra con",
    zh: "或通过",
  },
  before_council_speaks: {
    en: "Before the Council speaks…",
    pt: "Antes do Conselho falar…",
    es: "Antes de que hable el Consejo…",
    zh: "议会开口之前……",
  },

  // extended onboarding
  onb_progress_4: { en: "Rite of entry · IV", pt: "Ritual de entrada · IV", es: "Rito de entrada · IV", zh: "入场仪式 · 四" },
  onb_progress_5: { en: "Rite of entry · V", pt: "Ritual de entrada · V", es: "Rito de entrada · V", zh: "入场仪式 · 五" },
  onb_name_google_intro: {
    en: "We found these names. Which should the Council use?",
    pt: "Encontramos estes nomes. Qual o Conselho deve usar?",
    es: "Encontramos estos nombres. ¿Cuál debería usar el Consejo?",
    zh: "我们找到了这些名字，议会该用哪个？",
  },
  onb_name_anon_intro: {
    en: "What shall the Council call you?",
    pt: "Como o Conselho deve te chamar?",
    es: "¿Cómo debería llamarte el Consejo?",
    zh: "议会该怎么称呼你？",
  },
  onb_name_custom_placeholder: {
    en: "Other name…",
    pt: "Outro nome…",
    es: "Otro nombre…",
    zh: "其他名字……",
  },
  onb_name_prefer_not: {
    en: "Prefer not to say",
    pt: "Prefiro não dizer",
    es: "Prefiero no decir",
    zh: "不想说",
  },
  onb_decision_q: {
    en: "What decision do you want to bring before the Council?",
    pt: "Qual decisão você quer levar ao Conselho?",
    es: "¿Qué decisión quieres llevar al Consejo?",
    zh: "你想把什么决定带到议会？",
  },
  onb_decision_hint: {
    en: "The more real the decision, the more interesting the debate.",
    pt: "Quanto mais verdadeira for a decisão, mais interessante será o debate.",
    es: "Cuanto más real sea la decisión, más interesante será el debate.",
    zh: "决定越真实，辩论就越精彩。",
  },
  onb_decision_placeholder: {
    en: "e.g. Should I quit my job and start something of my own?",
    pt: "ex: Devo largar meu emprego e começar algo próprio?",
    es: "ej: ¿Debería dejar mi trabajo y empezar algo propio?",
    zh: "例：我应该辞职去创业吗？",
  },
  onb_weight_q: {
    en: "How much is this decision weighing on you?",
    pt: "O quanto essa decisão está pesando para você?",
    es: "¿Cuánto te está pesando esta decisión?",
    zh: "这个决定对你来说有多重？",
  },
  onb_weight_hint: {
    en: "This helps the Council calibrate the tone of the debate.",
    pt: "Isso ajuda o Conselho a calibrar o tom do debate.",
    es: "Esto ayuda al Consejo a calibrar el tono del debate.",
    zh: "这有助于议会校准辩论的基调。",
  },
  onb_weight_light: { en: "Light", pt: "Leve", es: "Leve", zh: "轻微" },
  onb_weight_moderate: { en: "Moderate", pt: "Moderada", es: "Moderada", zh: "适中" },
  onb_weight_heavy: { en: "Heavy", pt: "Grande", es: "Grande", zh: "沉重" },
  onb_weight_sleepless: { en: "Keeping me up at night", pt: "Está tirando meu sono", es: "Me está quitando el sueño", zh: "让我彻夜难眠" },
  onb_category_q: {
    en: "What kind of decision is this?",
    pt: "Que tipo de decisão é essa?",
    es: "¿Qué tipo de decisión es esta?",
    zh: "这是什么类型的决定？",
  },
  onb_cat_career: { en: "Career", pt: "Carreira", es: "Carrera", zh: "事业" },
  onb_cat_love: { en: "Love", pt: "Amor", es: "Amor", zh: "爱情" },
  onb_cat_money: { en: "Money", pt: "Dinheiro", es: "Dinero", zh: "金钱" },
  onb_cat_family: { en: "Family", pt: "Família", es: "Familia", zh: "家庭" },
  onb_cat_life_change: { en: "Life change", pt: "Mudança de vida", es: "Cambio de vida", zh: "人生转变" },
  onb_cat_creativity: { en: "Creativity", pt: "Criatividade", es: "Creatividad", zh: "创造力" },
  onb_cat_emotional: { en: "Emotional health", pt: "Saúde emocional", es: "Salud emocional", zh: "情感健康" },
  onb_cat_other: { en: "Other", pt: "Outro", es: "Otro", zh: "其他" },
  onb_fear_q: {
    en: "What's holding you back from deciding?",
    pt: "O que mais te impede de decidir?",
    es: "¿Qué te impide decidir?",
    zh: "是什么阻止你做出决定？",
  },
  onb_fear_hint: {
    en: "The Council needs to know where the knot is.",
    pt: "O Conselho precisa saber onde está o nó.",
    es: "El Consejo necesita saber dónde está el nudo.",
    zh: "议会需要知道症结所在。",
  },
  onb_fear_security: { en: "Losing security", pt: "Perder segurança", es: "Perder seguridad", zh: "失去安全感" },
  onb_fear_regret: { en: "Regretting it", pt: "Se arrepender", es: "Arrepentirse", zh: "事后后悔" },
  onb_fear_hurt: { en: "Hurting someone", pt: "Machucar alguém", es: "Hacer daño a alguien", zh: "伤害别人" },
  onb_fear_fail: { en: "Failing", pt: "Falhar", es: "Fracasar", zh: "失败" },
  onb_fear_judged: { en: "Being judged", pt: "Ser julgado", es: "Ser juzgado", zh: "被评判" },
  onb_fear_start: { en: "Not knowing where to begin", pt: "Não saber por onde começar", es: "No saber por dónde empezar", zh: "不知从何开始" },
  onb_fear_unknown: { en: "I'm not sure exactly", pt: "Não sei exatamente", es: "No sé exactamente", zh: "我不确定" },

  // notifications panel
  notif_heading:       { en: "Notifications",    pt: "Notificações",    es: "Notificaciones",    zh: "通知" },
  notif_digest:        { en: "Weekly digest",    pt: "Resumo semanal",  es: "Resumen semanal",   zh: "每周摘要" },
  notif_digest_desc:   { en: "A prompt to bring a new matter before the Council each week", pt: "Um convite para trazer um novo assunto ao Conselho a cada semana", es: "Un recordatorio para traer un nuevo asunto al Consejo cada semana", zh: "每周提示你向议会提出新问题" },
  notif_lifemode:      { en: "Life Mode check-ins",     pt: "Check-ins do Life Mode",      es: "Check-ins del Modo Vida",      zh: "生活模式签到" },
  notif_lifemode_desc: { en: "Proactive reflections on your ongoing decisions", pt: "Reflexões proativas sobre decisões em andamento", es: "Reflexiones proactivas sobre decisiones en curso", zh: "对持续决策的主动反思" },
  notif_features:      { en: "New features",    pt: "Novidades do Conselho",  es: "Novedades del Consejo",  zh: "新功能" },
  notif_features_desc: { en: "Be the first to know when new Council capabilities arrive", pt: "Seja o primeiro a saber quando novas capacidades chegarem ao Conselho", es: "Sé el primero en saber cuándo llegan nuevas capacidades al Consejo", zh: "第一时间了解议会的新功能" },
  notif_saved:         { en: "Preferences saved",  pt: "Preferências salvas", es: "Preferencias guardadas", zh: "偏好已保存" },

  // privacy panel
  privacy_heading:          { en: "Your data",         pt: "Seus dados",        es: "Tus datos",          zh: "你的数据" },
  privacy_on_device:        { en: "On this device",    pt: "Neste dispositivo", es: "En este dispositivo", zh: "在此设备上" },
  privacy_on_device_items:  { en: "Language, theme, display name, debate history (last 10)", pt: "Idioma, tema, nome exibido, histórico de debates (últimos 10)", es: "Idioma, tema, nombre visible, historial de debates (últimos 10)", zh: "语言、主题、显示名称、辩论记录（最近10条）" },
  privacy_in_cloud:         { en: "In the cloud (signed-in accounts)", pt: "Na nuvem (contas conectadas)", es: "En la nube (cuentas conectadas)", zh: "在云端（已登录账户）" },
  privacy_in_cloud_items:   { en: "Display name, situation, values, profile picture", pt: "Nome exibido, situação, valores, foto de perfil", es: "Nombre visible, situación, valores, foto de perfil", zh: "显示名称、情况、价值观、头像" },
  privacy_clear_local:      { en: "Clear local data",  pt: "Limpar dados locais",  es: "Borrar datos locales",  zh: "清除本地数据" },
  privacy_cleared:          { en: "Local data cleared", pt: "Dados locais apagados", es: "Datos locales borrados", zh: "本地数据已清除" },
  privacy_read_policy:      { en: "Read the Privacy Policy", pt: "Ler a Política de Privacidade", es: "Leer la Política de Privacidad", zh: "阅读隐私政策" },
  privacy_deletion_contact: { en: "To request full deletion of your data, contact:", pt: "Para solicitar exclusão completa dos seus dados, contate:", es: "Para solicitar la eliminación completa de tus datos, contacta:", zh: "如需完全删除你的数据，请联系：" },

  // security panel
  security_heading:           { en: "Security",        pt: "Segurança",         es: "Seguridad",          zh: "安全" },
  security_active_session:    { en: "Active session",  pt: "Sessão ativa",      es: "Sesión activa",      zh: "活跃会话" },
  security_signed_in_as:      { en: name => `Signed in as ${name}`, pt: name => `Conectado como ${name}`, es: name => `Conectado como ${name}`, zh: name => `已以 ${name} 登录` },
  security_this_device:       { en: "This device",     pt: "Este dispositivo",  es: "Este dispositivo",   zh: "此设备" },
  security_deletion_heading:  { en: "Account deletion", pt: "Exclusão de conta", es: "Eliminación de cuenta", zh: "账户删除" },
  security_deletion_desc:     { en: "To delete your Council profile and all server data, email:", pt: "Para excluir seu perfil do Conselho e todos os dados do servidor, envie e-mail para:", es: "Para eliminar tu perfil del Consejo y todos los datos del servidor, envía un correo a:", zh: "如需删除你的议会档案及服务器上的所有数据，请发送邮件至：" },

  // preferences panel
  pref_heading:        { en: "Preferences", pt: "Preferências",  es: "Preferencias",  zh: "偏好设置" },
  pref_appearance:     { en: "Appearance",  pt: "Aparência",     es: "Apariencia",    zh: "外观" },
  pref_dark:           { en: "Dark",        pt: "Escuro",        es: "Oscuro",        zh: "深色" },
  pref_light:          { en: "Light",       pt: "Claro",         es: "Claro",         zh: "浅色" },
  pref_language_label: { en: "Language",    pt: "Idioma",        es: "Idioma",        zh: "语言" },

  // subscription panel
  sub_heading:        { en: "Your plan",     pt: "Seu plano",     es: "Tu plan",        zh: "你的计划" },
  sub_current_plan:   { en: "Free",          pt: "Gratuito",      es: "Gratuito",       zh: "免费版" },
  sub_included:       { en: "What's included", pt: "O que está incluído", es: "Qué incluye", zh: "包含内容" },
  sub_free_1:         { en: "Unlimited Council debates",    pt: "Debates ilimitados no Conselho", es: "Debates ilimitados en el Consejo", zh: "无限次议会辩论" },
  sub_free_2:         { en: "9 distinct AI personas",       pt: "9 personas de IA distintas",     es: "9 personas de IA distintas",      zh: "9个独特的AI角色" },
  sub_free_3:         { en: "Shareable verdict cards",      pt: "Cartões de veredito compartilháveis", es: "Tarjetas de veredicto compartibles", zh: "可分享的裁决卡片" },
  sub_free_4:         { en: "Debate history (last 10)",     pt: "Histórico de debates (últimos 10)", es: "Historial de debates (últimos 10)", zh: "辩论记录（最近10条）" },
  sub_premium_label:  { en: "Premium — coming soon",        pt: "Premium — em breve",              es: "Premium — próximamente",           zh: "高级版——即将推出" },
  sub_premium_1:      { en: "Unlimited debate history",     pt: "Histórico ilimitado de debates",  es: "Historial de debates ilimitado",   zh: "无限辩论记录" },
  sub_premium_2:      { en: "Life Mode — proactive Council check-ins", pt: "Life Mode — check-ins proativos do Conselho", es: "Modo Vida — check-ins proactivos del Consejo", zh: "生活模式——主动议会签到" },
  sub_premium_3:      { en: "Custom personas",              pt: "Personas personalizadas",         es: "Personas personalizadas",          zh: "自定义角色" },
  sub_premium_4:      { en: "Email verdicts to yourself",   pt: "Enviar vereditos por e-mail",     es: "Enviarte veredictos por correo",   zh: "将裁决发送到邮箱" },
  sub_notify_me:      { en: "Notify me when Premium launches", pt: "Avise-me quando o Premium for lançado", es: "Avísame cuando se lance Premium", zh: "Premium上线时通知我" },
  sub_on_waitlist:    { en: "You're on the list",           pt: "Você está na lista",              es: "Estás en la lista",                zh: "你已加入等候名单" },
  sub_email_placeholder: { en: "your@email.com", pt: "seu@email.com", es: "tu@email.com", zh: "你的@邮箱.com" },
  sub_email_join:     { en: "Join waitlist",     pt: "Entrar na lista",  es: "Unirme a la lista",  zh: "加入等候名单" },
  sub_email_sending:  { en: "Joining…",          pt: "Entrando…",        es: "Uniéndome…",         zh: "加入中…" },
  sub_email_error:    { en: "Something went wrong. Try again.", pt: "Algo deu errado. Tente novamente.", es: "Algo falló. Inténtalo de nuevo.", zh: "出现了问题，请重试。" },
  sub_email_invalid:  { en: "Enter a valid email.", pt: "Insira um e-mail válido.", es: "Ingresa un correo válido.", zh: "请输入有效邮箱。" },
  sub_teaser_label:   { en: "Premium — coming soon", pt: "Premium — em breve", es: "Premium — próximamente", zh: "高级版——即将推出" },
  sub_teaser_sub:     { en: "Be first to know when these features arrive.", pt: "Seja o primeiro a saber quando essas funcionalidades chegarem.", es: "Sé el primero en saber cuándo llegan estas funciones.", zh: "第一时间了解这些功能上线。" },

  // history panel
  hist_heading:       { en: "Debate history",  pt: "Histórico de debates", es: "Historial de debates", zh: "辩论记录" },
  hist_empty:         { en: "No debates yet. Bring your first question before the Council.", pt: "Nenhum debate ainda. Traga sua primeira pergunta ao Conselho.", es: "Aún no hay debates. Lleva tu primera pregunta al Consejo.", zh: "暂无辩论记录。将你的第一个问题带到议会吧。" },
  hist_clear:         { en: "Clear history",   pt: "Limpar histórico",     es: "Borrar historial",     zh: "清除历史记录" },
  hist_cleared:       { en: "History cleared", pt: "Histórico apagado",    es: "Historial borrado",    zh: "历史记录已清除" },
  hist_revisit:       { en: "Revisit",         pt: "Revisitar",            es: "Revisitar",            zh: "重新辩论" },
  hist_view:          { en: "View verdict",    pt: "Ver veredito",         es: "Ver veredicto",        zh: "查看裁决" },

  // premium active state
  sub_premium_active:   { en: "Beta Access",          pt: "Acesso Beta",            es: "Acceso Beta",            zh: "Beta访问" },
  sub_leave_waitlist:   { en: "Leave waitlist",        pt: "Sair da lista",          es: "Salir de la lista",      zh: "退出等候名单" },

  // life mode (local check-in)
  sub_lifemode_heading: { en: "Life Mode",             pt: "Life Mode",              es: "Modo Vida",              zh: "生活模式" },
  sub_lifemode_desc:    { en: "The Council checks in proactively — a daily reflection based on your last debate.", pt: "O Conselho faz check-ins proativos — uma reflexão diária baseada no seu último debate.", es: "El Consejo hace check-ins proactivos — una reflexión diaria basada en tu último debate.", zh: "议会主动签到——基于你上次辩论的每日反思。" },
  sub_lifemode_enable:  { en: "Enable daily check-ins", pt: "Ativar check-ins diários", es: "Activar check-ins diarios", zh: "启用每日签到" },
  sub_lifemode_active:  { en: "Daily check-ins are active", pt: "Check-ins diários ativos", es: "Check-ins diarios activos", zh: "每日签到已激活" },
  lifemode_teaser:      { en: "The Council remembers something.", pt: "O Conselho se lembra de algo.", es: "El Consejo recuerda algo.", zh: "议会想起了一些事。" },
  lifemode_monk:        { en: q => `You asked: "${q}". Has something quietly shifted since then?`, pt: q => `Você perguntou: "${q}". Algo mudou silenciosamente desde então?`, es: q => `Preguntaste: "${q}". ¿Ha cambiado algo suavemente desde entonces?`, zh: q => `你曾问："${q}"。此后有什么悄然改变吗？` },
  lifemode_shadow:      { en: q => `"${q}" — you already know what changed. Are you ready to admit it?`, pt: q => `"${q}" — você já sabe o que mudou. Está pronto para admitir?`, es: q => `"${q}" — ya sabes lo que cambió. ¿Estás listo para admitirlo?`, zh: q => `"${q}"——你已经知道什么变了。你准备好承认了吗？` },
  lifemode_romantic:    { en: q => `The Council remembers: "${q}". Who else was carrying that weight with you?`, pt: q => `O Conselho se lembra: "${q}". Quem mais carregava esse peso com você?`, es: q => `El Consejo recuerda: "${q}". ¿Quién más llevaba ese peso contigo?`, zh: q => `议会记得："${q}"。还有谁在和你一起承担那份重量？` },
  lifemode_explorer:    { en: q => `"${q}" — where did that path actually lead?`, pt: q => `"${q}" — para onde esse caminho realmente foi?`, es: q => `"${q}" — ¿adónde llevó realmente ese camino?`, zh: q => `"${q}"——那条路实际上通向了哪里？` },
  lifemode_founder:     { en: q => `You asked: "${q}". Every day you wait is a day someone else ships first.`, pt: q => `Você perguntou: "${q}". Cada dia que você espera é um dia que outra pessoa sai na frente.`, es: q => `Preguntaste: "${q}". Cada día que esperas es un día que alguien más se adelanta.`, zh: q => `你曾问："${q}"。你每多等一天，就有人先你一步。` },
  lifemode_billionaire: { en: q => `"${q}" — has the timeline moved, or just your tolerance for waiting?`, pt: q => `"${q}" — o prazo mudou, ou só a sua paciência para esperar?`, es: q => `"${q}" — ¿cambió el plazo, o solo tu paciencia para esperar?`, zh: q => `"${q}"——是时间表变了，还是你的耐心变了？` },
  lifemode_artist:      { en: q => `You once asked: "${q}"... does it still feel the same, or has the light shifted?`, pt: q => `Você perguntou: "${q}"... ainda parece igual, ou a luz mudou?`, es: q => `Preguntaste: "${q}"... ¿todavía se siente igual, o la luz ha cambiado?`, zh: q => `你曾问："${q}"……感觉还一样吗，还是光线已经变了？` },
  lifemode_athlete:     { en: q => `"${q}" — did you train for it today, or just think about it again?`, pt: q => `"${q}" — você treinou para isso hoje, ou só pensou nisso de novo?`, es: q => `"${q}" — ¿entrenaste para eso hoy, o solo lo pensaste de nuevo?`, zh: q => `"${q}"——你今天为它训练了吗，还是又只是想了想？` },
  lifemode_scientist:   { en: q => `You asked: "${q}". Any new evidence since then, or still the same hypothesis?`, pt: q => `Você perguntou: "${q}". Alguma evidência nova desde então, ou ainda a mesma hipótese?`, es: q => `Preguntaste: "${q}". ¿Alguna evidencia nueva desde entonces, o sigue siendo la misma hipótesis?`, zh: q => `你曾问："${q}"。此后有新证据吗，还是仍是同一个假设？` },

  // custom personas
  sub_persona_heading:  { en: "Your Council",          pt: "Seu Conselho",           es: "Tu Consejo",             zh: "你的议会" },
  sub_persona_desc:     { en: "Choose which voices sit at your table. Minimum 3.", pt: "Escolha quais vozes se sentam à sua mesa. Mínimo 3.", es: "Elige qué voces se sientan en tu mesa. Mínimo 3.", zh: "选择哪些声音坐在你的桌旁。至少3个。" },
  sub_persona_all:      { en: "Restore all 9",         pt: "Restaurar todos os 9",   es: "Restaurar los 9",        zh: "恢复全部9个" },
  sub_persona_saved:    { en: "Council saved",         pt: "Conselho salvo",         es: "Consejo guardado",       zh: "议会已保存" },

  // email verdicts
  sub_email_heading:    { en: "Email Verdicts",        pt: "Vereditos por E-mail",   es: "Veredictos por Correo",  zh: "邮件裁决" },
  sub_email_desc:       { en: "After a debate, send the full verdict to any email address.", pt: "Após um debate, envie o veredito completo para qualquer e-mail.", es: "Después de un debate, envía el veredicto completo a cualquier correo.", zh: "辩论结束后，将完整裁决发送到任意邮箱。" },
  email_verdict_btn:    { en: "Email this verdict",   pt: "Enviar por e-mail",      es: "Enviar por correo",      zh: "邮件发送裁决" },
  email_verdict_sent:   { en: "Opening email…",       pt: "Abrindo e-mail…",        es: "Abriendo correo…",       zh: "正在打开邮件…" },
  email_verdict_subject: { en: q => `The Council on: ${q}`, pt: q => `O Conselho sobre: ${q}`, es: q => `El Consejo sobre: ${q}`, zh: q => `议会关于：${q}` },
};

export function t(lang, key, ...args) {
  const entry = S[key];
  if (!entry) return key;
  const val = entry[lang] ?? entry.en;
  return typeof val === "function" ? val(...args) : val;
}

const PERSONA_NAMES = {
  founder:     { en: "The Founder",     pt: "O Fundador",   es: "El Fundador",   zh: "创业者" },
  billionaire: { en: "The Billionaire", pt: "O Bilionário", es: "El Multimillonario", zh: "富豪" },
  artist:      { en: "The Artist",      pt: "O Artista",    es: "El Artista",    zh: "艺术家" },
  athlete:     { en: "The Athlete",     pt: "O Atleta",     es: "El Atleta",     zh: "运动员" },
  monk:        { en: "The Monk",        pt: "O Monge",      es: "El Monje",      zh: "僧人" },
  scientist:   { en: "The Scientist",   pt: "O Cientista",  es: "El Científico", zh: "科学家" },
  explorer:    { en: "The Explorer",    pt: "O Explorador", es: "El Explorador", zh: "探险家" },
  romantic:    { en: "The Romantic",    pt: "O Romântico",  es: "El Romántico",  zh: "浪漫者" },
  shadow:      { en: "The Shadow",      pt: "A Sombra",     es: "La Sombra",     zh: "阴影自我" },
};

const PERSONA_TAGS = {
  founder:     { en: "the self who bet everything",     pt: "o eu que apostou tudo",         es: "el yo que lo apostó todo",       zh: "押上一切的自己" },
  billionaire: { en: "the self who compounded quietly",  pt: "o eu que multiplicou em silêncio", es: "el yo que multiplicó en silencio", zh: "静静积累财富的自己" },
  artist:      { en: "the self who chose beauty",        pt: "o eu que escolheu a beleza",     es: "el yo que eligió la belleza",    zh: "选择了美的自己" },
  athlete:     { en: "the self who never missed a rep",  pt: "o eu que nunca falhou um treino", es: "el yo que nunca falló una repetición", zh: "从不缺席训练的自己" },
  monk:        { en: "the self who let go",              pt: "o eu que deixou ir",             es: "el yo que dejó ir",              zh: "学会放下的自己" },
  scientist:   { en: "the self who demanded proof",      pt: "o eu que exigiu provas",         es: "el yo que exigió pruebas",       zh: "要求证据的自己" },
  explorer:    { en: "the self who kept moving",         pt: "o eu que continuou em frente",   es: "el yo que siguió avanzando",     zh: "不断前行的自己" },
  romantic:    { en: "the self who chose love",          pt: "o eu que escolheu o amor",       es: "el yo que eligió el amor",       zh: "选择了爱的自己" },
  shadow:      { en: "the self you don't introduce",     pt: "o eu que você não apresenta",    es: "el yo que no presentas",         zh: "你不愿介绍的自己" },
};

export function personaName(lang, id) {
  return PERSONA_NAMES[id]?.[lang] || PERSONA_NAMES[id]?.en || id;
}

export function personaShortName(lang, id) {
  return personaName(lang, id).replace(/^(The|O|A|El|La)\s+/, "");
}

export function personaTag(lang, id) {
  return PERSONA_TAGS[id]?.[lang] || PERSONA_TAGS[id]?.en || "";
}

const PERSONA_LINES = {
  founder:     { en: "Speed is a moat.",                      pt: "Velocidade é um fosso.",                         es: "La velocidad es un foso.",                  zh: "速度就是护城河。" },
  billionaire: { en: "Risk is what remains after you think.", pt: "Risco é o que sobra depois de pensar.",          es: "El riesgo es lo que queda después de pensar.", zh: "风险是思考之后残留的东西。" },
  artist:      { en: "A life is a canvas, not a ledger.",     pt: "Uma vida é uma tela, não um balanço.",           es: "Una vida es un lienzo, no un libro de cuentas.", zh: "生命是画布，不是账本。" },
  athlete:     { en: "Discipline decides.",                   pt: "A disciplina decide.",                           es: "La disciplina decide.",                     zh: "纪律决定一切。" },
  monk:        { en: "What are you actually seeking?",        pt: "O que você está realmente buscando?",            es: "¿Qué es lo que realmente buscas?",          zh: "你真正在寻求什么？" },
  scientist:   { en: "Show me the base rates.",               pt: "Me mostre as taxas base.",                       es: "Muéstrame las tasas base.",                 zh: "给我看基础概率。" },
  explorer:    { en: "Regret weighs more than failure.",      pt: "O arrependimento pesa mais que o fracasso.",     es: "El arrepentimiento pesa más que el fracaso.", zh: "遗憾比失败更沉重。" },
  romantic:    { en: "Who holds your hand through this?",     pt: "Quem segura sua mão nessa jornada?",             es: "¿Quién te sostiene la mano en esto?",       zh: "谁会在这一路上握着你的手？" },
  shadow:      { en: "You already know. You're just afraid.", pt: "Você já sabe. Só está com medo.",                es: "Ya sabes. Solo tienes miedo.",              zh: "你早已知道。只是害怕而已。" },
};

export function personaLine(lang, id) {
  return PERSONA_LINES[id]?.[lang] || PERSONA_LINES[id]?.en || "";
}

export const QUICK_QUESTIONS_I18N = {
  en: [
    "Should I quit my job and start something of my own?",
    "Should I end this relationship?",
    "Should I move to another city or country?",
    "Should I go back to school?",
    "Should I have children?",
    "Should I take the safer path or the riskier one?",
  ],
  pt: [
    "Devo largar meu emprego e começar algo próprio?",
    "Devo terminar este relacionamento?",
    "Devo me mudar para outra cidade ou país?",
    "Devo voltar a estudar?",
    "Devo ter filhos?",
    "Devo seguir o caminho mais seguro ou o mais arriscado?",
  ],
  es: [
    "¿Debería dejar mi trabajo y empezar algo propio?",
    "¿Debería terminar esta relación?",
    "¿Debería mudarme a otra ciudad o país?",
    "¿Debería volver a estudiar?",
    "¿Debería tener hijos?",
    "¿Debería tomar el camino más seguro o el más arriesgado?",
  ],
  zh: [
    "我应该辞职去创业吗？",
    "我应该结束这段感情吗？",
    "我应该搬到另一个城市或国家吗？",
    "我应该回去读书吗？",
    "我应该要孩子吗？",
    "我应该走更安全的路还是更冒险的路？",
  ],
};

export const RICH_QUESTIONS_I18N = {
  en: [
    // career
    "Should I quit my job or am I just exhausted?",
    "Should I take the safe offer or bet on something bigger?",
    "Am I growing or just surviving at work?",
    "Should I start something of my own even without a guarantee?",
    "Am I staying out of strategy or out of fear?",
    // love
    "Should I keep trying or accept that it's over?",
    "Does this person actually fit me, or just my loneliness?",
    "Am I choosing love or fear of being alone?",
    "Should I say what I feel or let it die in silence?",
    "Does this relationship expand me or shrink me?",
    // life
    "Should I move abroad or am I just running from my routine?",
    "Which decision have I been avoiding for too long?",
    "What would my 80-year-old self think of this choice?",
    "Am I living my life or just keeping everything running?",
    "Which part of me is asking for change?",
    // money
    "Should I choose stability or freedom?",
    "Is this risk courage or impulsiveness?",
    "Am I playing small because I'm afraid to lose?",
    "Should I invest in myself now or wait for more security?",
    "How much of my caution is just fear in disguise?",
    // creativity
    "Should I publish my project even if it's not perfect?",
    "Am I waiting for the right moment or avoiding judgment?",
    "Is this dream still mine or just an old idea?",
    "Should I show my work before I feel ready?",
    "What would I create if no one could laugh at me?",
  ],
  pt: [
    // carreira
    "Devo largar meu emprego ou estou apenas cansado?",
    "Devo aceitar uma proposta segura ou apostar em algo maior?",
    "Estou crescendo ou apenas sobrevivendo no meu trabalho?",
    "Devo começar algo próprio mesmo sem garantia?",
    "Estou ficando por estratégia ou por medo?",
    // amor
    "Devo continuar tentando ou aceitar que acabou?",
    "Essa pessoa combina comigo ou só com a minha carência?",
    "Estou escolhendo amor ou medo de ficar sozinho?",
    "Devo dizer o que sinto ou deixar isso morrer em silêncio?",
    "Esse relacionamento me expande ou me diminui?",
    // vida
    "Devo me mudar para outro país ou estou fugindo da minha rotina?",
    "Qual decisão eu estou evitando há tempo demais?",
    "O que minha versão de 80 anos acharia dessa escolha?",
    "Estou vivendo minha vida ou apenas mantendo tudo funcionando?",
    "Que parte de mim está pedindo mudança?",
    // dinheiro
    "Devo escolher estabilidade ou liberdade?",
    "Esse risco é coragem ou impulsividade?",
    "Estou jogando pequeno por medo de perder?",
    "Devo investir em mim agora ou esperar mais segurança?",
    "Quanto da minha prudência é apenas medo bem vestido?",
    // criatividade
    "Devo publicar meu projeto mesmo sem estar perfeito?",
    "Estou esperando o momento certo ou evitando julgamento?",
    "Esse sonho ainda é meu ou só uma ideia antiga?",
    "Devo mostrar meu trabalho antes de me sentir pronto?",
    "O que eu criaria se ninguém pudesse rir de mim?",
  ],
  es: [
    // carrera
    "¿Debería dejar mi trabajo y empezar algo propio?",
    "¿Debería aceptar el ascenso aunque signifique perder mi libertad?",
    "¿Debería cambiar de carrera completamente a los 35?",
    "¿Debería pedir un aumento o buscar otro lugar?",
    "¿Debería quedarme en la empresa o volverme freelancer?",
    // amor
    "¿Debería terminar esta relación?",
    "¿Debería decirle a esta persona lo que realmente siento?",
    "¿Debería darle otra oportunidad?",
    "¿Debería vivir juntos aunque tenga miedo?",
    "¿Debería elegir mi carrera o esta persona?",
    // vida
    "¿Debería mudarme a otra ciudad o país?",
    "¿Debería tener hijos?",
    "¿Debería volver a estudiar?",
    "¿Debería alejarme de alguien que me sigue haciendo daño?",
    "¿Debería perdonar lo que pasó o protegerme?",
    // dinero
    "¿Debería asumir el riesgo financiero o ser más conservador?",
    "¿Debería invertir todo lo que tengo en esta idea?",
    "¿Debería vender ahora o esperar el momento correcto?",
    "¿Debería prestarle dinero a alguien que quiero?",
    // creatividad
    "¿Debería publicar lo que he estado ocultando?",
    "¿Debería dejar el trabajo estable para hacer lo que realmente amo?",
    "¿Debería mostrarle mi trabajo al mundo, aunque no esté listo?",
  ],
  zh: [
    // 事业
    "我应该辞职去创业吗？",
    "即使意味着失去自由，我也应该接受晋升吗？",
    "35岁时，我应该彻底转行吗？",
    "我应该要求加薪还是另谋高就？",
    "我应该继续在企业工作还是成为自由职业者？",
    // 爱情
    "我应该结束这段感情吗？",
    "我应该告诉这个人我真实的感受吗？",
    "我应该再给一次机会吗？",
    "即使心存恐惧，我也应该和对方同居吗？",
    "我应该选择事业还是这个人？",
    // 人生
    "我应该搬到另一个城市或国家吗？",
    "我应该要孩子吗？",
    "我应该回去读书吗？",
    "我应该断绝与一个不断伤害我的人的联系吗？",
    "我应该原谅过去发生的事，还是保护自己？",
    // 金钱
    "我应该冒财务风险还是保守行事？",
    "我应该把所有积蓄都投入这个想法吗？",
    "我应该现在卖出还是等待合适时机？",
    "我应该借钱给我爱的人吗？",
    // 创造力
    "我应该发表那些一直藏着的作品吗？",
    "我应该辞去稳定工作去追求我真正热爱的事吗？",
    "即使还没准备好，我也应该把作品分享给世界吗？",
  ],
};

export const LANDING_EXAMPLE_KEYS = [
  "landing_ex_q1", "landing_ex_q2", "landing_ex_q3",
  "landing_ex_q4", "landing_ex_q5", "landing_ex_q6",
];
