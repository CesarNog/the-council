/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { LanguageSelector } from "./language-selector.jsx";

afterEach(cleanup);

describe("LanguageSelector", () => {
  it("marks the active language with aria-pressed, not just a visual class", () => {
    const { getByRole } = render(<LanguageSelector language="pt" onChange={vi.fn()} />);
    expect(getByRole("button", { name: "Português" })).toHaveAttribute("aria-pressed", "true");
    expect(getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "false");
  });

  it("moves aria-pressed to the newly selected language when the prop changes", () => {
    const { getByRole, rerender } = render(<LanguageSelector language="en" onChange={vi.fn()} />);
    expect(getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "true");

    rerender(<LanguageSelector language="es" onChange={vi.fn()} />);
    expect(getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "false");
    expect(getByRole("button", { name: "Español" })).toHaveAttribute("aria-pressed", "true");
  });
});
