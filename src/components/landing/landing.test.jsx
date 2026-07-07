/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

vi.mock("../../lib/analytics.js", () => ({
  Events: { landingCta: vi.fn() },
}));

vi.mock("./LandingHero3D.jsx", () => ({
  default: () => <div data-testid="hero-3d">3d</div>,
}));

import { Landing } from "./LandingPage.jsx";

describe("Landing page", () => {
  it("renders headline and primary CTA", () => {
    render(
      <Landing language="en" onEnter={vi.fn()} history={[]} onRevisit={vi.fn()} />
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toMatch(/Nine versions of you/i);
    expect(screen.getAllByRole("button", { name: /Consult my Council/i }).length).toBeGreaterThan(0);
  });

  it("uses CSS fallback when WebGL unavailable", () => {
    render(<Landing language="en" onEnter={vi.fn()} history={[]} onRevisit={vi.fn()} />);
    expect(document.querySelector(".landing-orbit-fallback")).toBeTruthy();
  });

  it("calls onEnter with example question", () => {
    const onEnter = vi.fn();
    render(<Landing language="pt" onEnter={onEnter} history={[]} onRevisit={vi.fn()} />);
    const chip = screen.getByRole("button", { name: /Devo largar meu emprego/i });
    fireEvent.click(chip);
    expect(onEnter).toHaveBeenCalledWith(expect.stringContaining("emprego"));
  });

  it("shows personalized greeting when displayName set", () => {
    render(
      <Landing language="en" onEnter={vi.fn()} history={[]} onRevisit={vi.fn()} displayName="Cesar" />
    );
    expect(screen.getByText(/Cesar, bring the question/i)).toBeTruthy();
  });

  it("renders sample verdict section", () => {
    render(<Landing language="en" onEnter={vi.fn()} history={[]} onRevisit={vi.fn()} />);
    expect(document.getElementById("sample-verdict")).toBeTruthy();
  });
});
