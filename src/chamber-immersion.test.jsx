/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

vi.mock("./lib/api.js", () => ({ summonCouncil: vi.fn() }));

import { Chamber } from "./components.jsx";
import { localDayKey } from "./lib/chamber-fx.js";

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

const preloaded = {
  question: "Should I?",
  debate: {
    id: "x", mood: "somber",
    turns: [{ p: "founder", t: "Go." }],
    votes: [{ p: "founder", v: "yes", r: "r" }],
    verdict: "V", quote: "Q",
  },
};

describe("daily greeting", () => {
  it("greets on the first idle entry of the day and records it", () => {
    render(<Chamber language="en" profile={{}} />);
    expect(screen.getByText("You're back.")).toBeInTheDocument();
    expect(localStorage.getItem("council:last_greet")).toBe(localDayKey());
  });

  it("does not greet twice on the same day", () => {
    localStorage.setItem("council:last_greet", localDayKey());
    render(<Chamber language="en" profile={{}} />);
    expect(screen.queryByText("You're back.")).not.toBeInTheDocument();
  });

  it("never greets over a shared/preview debate, and leaves the flag unconsumed", () => {
    render(<Chamber language="en" profile={{}} preloaded={preloaded} />);
    expect(screen.queryByText("You're back.")).not.toBeInTheDocument();
    expect(localStorage.getItem("council:last_greet")).toBeNull();
  });

  it("dismisses on click", () => {
    render(<Chamber language="pt" profile={{}} />);
    fireEvent.click(screen.getByText("Você voltou.").closest("button"));
    expect(screen.queryByText("Você voltou.")).not.toBeInTheDocument();
  });
});

describe("chamber atmosphere", () => {
  it("is neutral while idle and follows the debate mood once a debate is shown", () => {
    const { container, unmount } = render(<Chamber language="en" profile={{}} />);
    expect(container.ownerDocument.querySelector(".chamber-atmo").dataset.mood).toBe("neutral");
    unmount();
    render(<Chamber language="en" profile={{}} preloaded={preloaded} />);
    expect(document.querySelector(".chamber-atmo").dataset.mood).toBe("somber");
  });
});
