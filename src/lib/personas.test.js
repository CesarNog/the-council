import { describe, it, expect } from "vitest";
import { PERSONAS, byId, MOOD_COLORS, INTENSITY, PACE } from "./personas.js";

describe("personas", () => {
  it("tem exatamente 9 personas", () => {
    expect(PERSONAS).toHaveLength(9);
  });

  it("ids sao unicos", () => {
    const ids = PERSONAS.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("byId cobre todas as personas", () => {
    PERSONAS.forEach(p => expect(byId[p.id]).toBe(p));
  });

  it("INTENSITY e PACE cobrem todas as personas — regressao se alguem adicionar persona sem atualizar os 3 mapas", () => {
    PERSONAS.forEach(p => {
      expect(INTENSITY[p.id], `INTENSITY falta ${p.id}`).toBeDefined();
      expect(PACE[p.id], `PACE falta ${p.id}`).toBeDefined();
    });
  });

  it("MOOD_COLORS cobre o enum usado no prompt (tense|warm|hopeful|somber|electric)", () => {
    ["tense", "warm", "hopeful", "somber", "electric"].forEach(m => {
      expect(MOOD_COLORS[m]).toBeDefined();
    });
  });

  it("cores sao hex validos", () => {
    PERSONAS.forEach(p => expect(p.color).toMatch(/^#[0-9A-Fa-f]{6}$/));
  });
});
