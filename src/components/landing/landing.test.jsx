/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

vi.mock("../../lib/analytics.js", () => ({
  Events: { landingCta: vi.fn() },
}));

import { Landing } from "./LandingPage.jsx";

afterEach(cleanup);

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

  it("a typed hero question goes straight to the chamber", () => {
    const onEnter = vi.fn();
    render(<Landing language="en" onEnter={onEnter} history={[]} onRevisit={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/what are you trying to decide/i), { target: { value: "  Should I move?  " } });
    fireEvent.click(screen.getAllByRole("button", { name: /Consult my Council/i })[0]);
    expect(onEnter).toHaveBeenCalledWith("Should I move?");
  });

  it("an empty hero field keeps the guided onboarding", () => {
    const onEnter = vi.fn();
    render(<Landing language="en" onEnter={onEnter} history={[]} onRevisit={vi.fn()} />);
    fireEvent.click(screen.getAllByRole("button", { name: /Consult my Council/i })[0]);
    expect(onEnter).toHaveBeenCalledWith();
  });

  it("Enter in the hero field submits the question", () => {
    const onEnter = vi.fn();
    render(<Landing language="pt" onEnter={onEnter} history={[]} onRevisit={vi.fn()} />);
    const field = screen.getByLabelText(/o que você está tentando decidir/i);
    fireEvent.change(field, { target: { value: "Devo mudar?" } });
    fireEvent.keyDown(field, { key: "Enter" });
    expect(onEnter).toHaveBeenCalledWith("Devo mudar?");
  });
});
