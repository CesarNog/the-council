/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

vi.mock("../../lib/analytics.js", () => ({
  Events: { landingCta: vi.fn() },
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

  it("renders the 2D council ring", () => {
    render(<Landing language="en" onEnter={vi.fn()} history={[]} onRevisit={vi.fn()} />);
    expect(document.querySelector(".landing-orbit-fallback")).toBeTruthy();
  });

  it("calls onEnter with example question", () => {
    const onEnter = vi.fn();
    render(<Landing language="pt" onEnter={onEnter} history={[]} onRevisit={vi.fn()} />);
    const chips = screen.getAllByRole("button", { name: /Devo largar meu emprego/i });
    fireEvent.click(chips[0]);
    expect(onEnter).toHaveBeenCalledWith(expect.stringContaining("emprego"));
  });

  it("uses first name only in greeting", () => {
    render(
      <Landing language="en" onEnter={vi.fn()} history={[]} onRevisit={vi.fn()} displayName="César Augusto Nogueira" />
    );
    expect(screen.getByText(/César, bring the question/i)).toBeTruthy();
    expect(screen.queryByText(/Augusto/i)).toBeNull();
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
