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
};

export function t(lang, key, ...args) {
  const entry = S[key];
  if (!entry) return key;
  const val = entry[lang] ?? entry.en;
  return typeof val === "function" ? val(...args) : val;
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
