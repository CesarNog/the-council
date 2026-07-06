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
    en: "The founder you never became. The monk you almost were. The shadow you keep quiet. Bring them one real decision — and listen to them argue about your life.",
    pt: "O fundador que você nunca se tornou. O monge que você quase foi. A sombra que você mantém em silêncio. Traga a eles uma decisão real — e ouça-os discutir sobre sua vida.",
    es: "El fundador que nunca llegaste a ser. El monje que casi fuiste. La sombra que mantienes en silencio. Tráeles una decisión real — y escúchalos discutir sobre tu vida.",
    zh: "你从未成为的创业者。你几乎成为的僧人。你不愿提起的阴影自我。带给他们一个真实的决定——听听他们如何为你的人生争论。",
  },
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
  new_question: { en: "New question", pt: "Nova pergunta", es: "Nueva pregunta", zh: "新问题" },
  bring_question: { en: "Bring your question before the Council", pt: "Traga sua pergunta ao Conselho", es: "Trae tu pregunta al Consejo", zh: "向议会提出你的问题" },
  question_placeholder: { en: "Should I…", pt: "Devo…", es: "¿Debería…", zh: "我应该……" },
  offline_banner: { en: "Offline demo · sample debate, not about your question", pt: "Demo offline · debate de exemplo, não sobre sua pergunta", es: "Demo sin conexión · debate de ejemplo, no sobre tu pregunta", zh: "离线演示 · 示例辩论，与你的问题无关" },
  matter_before_council: { en: "The matter before the Council", pt: "A questão diante do Conselho", es: "El asunto ante el Consejo", zh: "议会正在讨论的事项" },
  deliberating: { en: "deliberating", pt: "deliberando", es: "deliberando", zh: "商议中" },
  reflecting: { en: "reflecting", pt: "refletindo", es: "reflexionando", zh: "沉思中" },
  voting: { en: "voting", pt: "votando", es: "votando", zh: "投票中" },
  adjourned: { en: "adjourned", pt: "encerrado", es: "concluido", zh: "已结束" },
  the_nine_take_seats: { en: "The nine take their seats", pt: "Os nove tomam seus lugares", es: "Los nueve toman asiento", zh: "九人各就其位" },
  is_speaking: { en: name => `${name} is speaking`, pt: name => `${name} está falando`, es: name => `${name} está hablando`, zh: name => `${name}正在发言` },
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

  // footer
  developed_by: { en: "Developed by", pt: "Desenvolvido por", es: "Desarrollado por", zh: "开发者" },
  buy_me_coffee: { en: "☕ Buy me a coffee", pt: "☕ Me pague um café", es: "☕ Cómprame un café", zh: "☕ 请我喝咖啡" },
  footer_privacy: { en: "Privacy", pt: "Privacidade", es: "Privacidad", zh: "隐私" },
  footer_terms: { en: "Terms", pt: "Termos", es: "Términos", zh: "条款" },
  footer_cookie_settings: { en: "Cookie Settings", pt: "Configurações de Cookies", es: "Ajustes de Cookies", zh: "Cookie设置" },

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
