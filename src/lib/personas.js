export const PERSONAS = [
  { id: "founder",     name: "The Founder",     tag: "the self who bet everything",     color: "#7C8CFF", line: "Speed is a moat." },
  { id: "billionaire", name: "The Billionaire", tag: "the self who compounded quietly", color: "#D9B25F", line: "Risk is what remains after you think." },
  { id: "artist",      name: "The Artist",      tag: "the self who chose beauty",       color: "#C86FE0", line: "A life is a canvas, not a ledger." },
  { id: "athlete",     name: "The Athlete",     tag: "the self who never missed a rep", color: "#FF8A3C", line: "Discipline decides." },
  { id: "monk",        name: "The Monk",        tag: "the self who let go",             color: "#A8C6A0", line: "What are you actually seeking?" },
  { id: "scientist",   name: "The Scientist",   tag: "the self who demanded proof",     color: "#6FD6E8", line: "Show me the base rates." },
  { id: "explorer",    name: "The Explorer",    tag: "the self who kept moving",        color: "#45C486", line: "Regret weighs more than failure." },
  { id: "romantic",    name: "The Romantic",    tag: "the self who chose love",         color: "#F4A7C3", line: "Who holds your hand through this?" },
  { id: "shadow",      name: "The Shadow",      tag: "the self you don't introduce",    color: "#C13A4E", line: "You already know. You're just afraid." },
];

export const byId = Object.fromEntries(PERSONAS.map(p => [p.id, p]));

export const MOOD_COLORS = { tense: "#C13A4E", warm: "#F4A7C3", hopeful: "#45C486", somber: "#5C7A93", electric: "#7C8CFF" };

// timing de reveal por persona — reforca identidade pelo ritmo, nao so pelo texto
export const INTENSITY = { founder: ".26s", athlete: ".26s", shadow: ".3s", billionaire: ".55s", scientist: ".45s", artist: ".7s", monk: ".75s", romantic: ".6s", explorer: ".4s" };
export const PACE = { founder: 0.72, athlete: 0.72, shadow: 0.8, billionaire: 1.15, scientist: 1, artist: 1.35, monk: 1.4, romantic: 1.15, explorer: 0.95 };
