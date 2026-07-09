/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { downloadShareCard } from "./share.js";

// jsdom doesn't implement canvas 2D rendering — stub just enough of the
// CanvasRenderingContext2D surface for downloadShareCard to run, and record
// every fillText call so we can assert on the localized chrome text.
function stubCanvas() {
  const fillTextCalls = [];
  const ctx = {
    fillStyle: "", font: "", textAlign: "", letterSpacing: "",
    strokeStyle: "", lineWidth: 0,
    fillRect: vi.fn(), strokeRect: vi.fn(),
    beginPath: vi.fn(), arc: vi.fn(), stroke: vi.fn(), fill: vi.fn(),
    moveTo: vi.fn(), lineTo: vi.fn(),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    measureText: vi.fn((text) => ({ width: text.length * 10 })),
    fillText: vi.fn((text) => { fillTextCalls.push(text); }),
  };
  const canvas = { width: 0, height: 0, getContext: () => ctx, toDataURL: () => "data:image/png;base64," };
  return { canvas, fillTextCalls };
}

function withStubbedDom() {
  const { canvas, fillTextCalls } = stubCanvas();
  const anchor = { click: vi.fn(), download: "", href: "" };
  const originalCreateElement = document.createElement.bind(document);
  vi.spyOn(document, "createElement").mockImplementation((tag) => {
    if (tag === "canvas") return canvas;
    if (tag === "a") return anchor;
    return originalCreateElement(tag);
  });
  return { fillTextCalls, anchor };
}

const debate = {
  id: "abc123",
  votes: ["founder", "billionaire", "artist", "athlete", "monk", "scientist", "explorer", "romantic"]
    .map((p, i) => ({ p, v: i < 6 ? "yes" : "no" })),
  verdict: "Verdict text.",
  quote: "A quotable line.",
};

describe("downloadShareCard", () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it("renders English chrome text by default", () => {
    const { fillTextCalls } = withStubbedDom();
    downloadShareCard("Should I move?", debate, "en");
    const joined = fillTextCalls.join(" | ");
    expect(joined).toContain("THE COUNCIL HAS RULED");
    expect(joined).toContain("YES 6");
    expect(joined).toContain("NO 2");
    expect(joined).toContain("nine versions of me");
  });

  it("renders Portuguese chrome text, not the English hardcoded strings", () => {
    const { fillTextCalls } = withStubbedDom();
    downloadShareCard("Devo me mudar?", debate, "pt");
    const joined = fillTextCalls.join(" | ");
    expect(joined).toContain("O CONSELHO DECIDIU");
    expect(joined).toContain("SIM 6");
    expect(joined).toContain("NÃO 2");
    expect(joined).toContain("nove versões de mim");
    expect(joined).not.toContain("THE COUNCIL HAS RULED");
    expect(joined).not.toContain("nine versions of me");
  });

  it("renders Spanish chrome text", () => {
    const { fillTextCalls } = withStubbedDom();
    downloadShareCard("¿Debo moverme?", debate, "es");
    const joined = fillTextCalls.join(" | ");
    expect(joined).toContain("EL CONSEJO HA DECIDIDO");
    expect(joined).toContain("SÍ 6");
    expect(joined).toContain("nueve versiones de mí");
  });

  it("renders Chinese chrome text", () => {
    const { fillTextCalls } = withStubbedDom();
    downloadShareCard("我该搬家吗？", debate, "zh");
    const joined = fillTextCalls.join(" | ");
    expect(joined).toContain("议会已裁决");
    expect(joined).toContain("赞成 6");
    expect(joined).toContain("九个版本的我");
  });

  it("triggers a PNG download via an anchor click", () => {
    const { anchor } = withStubbedDom();
    downloadShareCard("Should I move?", debate, "en");
    expect(anchor.click).toHaveBeenCalledTimes(1);
    expect(anchor.download).toBe("council-verdict.png");
    expect(anchor.href).toContain("data:image/png");
  });
});
