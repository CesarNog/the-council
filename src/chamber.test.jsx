/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";

vi.mock("./lib/api.js", () => ({ summonCouncil: vi.fn() }));

import { Chamber } from "./components.jsx";
import { summonCouncil } from "./lib/api.js";

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe("Chamber — stale in-flight request after a confirmed reset", () => {
  it("a debate that resolves after the seeker confirmed discarding it never reappears", async () => {
    let resolveRequest;
    summonCouncil.mockReturnValue(new Promise(r => { resolveRequest = r; }));
    render(<Chamber language="en" profile={{}} />);

    fireEvent.change(screen.getByPlaceholderText(/should i…/i), { target: { value: "Should I move abroad?" } });
    fireEvent.click(screen.getByRole("button", { name: /convene the council/i }));
    await screen.findAllByText(/new question/i);

    // Confirm the discard (two taps) while the request is still pending —
    // this is the exact race the reset-confirm feature exists to protect
    // against, just triggered from the other side: the network response
    // arriving late instead of a stray click. Both "new question" controls
    // (regular + compact-header variants) render at once in jsdom since
    // there's no real CSS breakpoint switching between them here.
    fireEvent.click(screen.getAllByRole("button", { name: /new question/i })[0]);
    fireEvent.click((await screen.findAllByRole("button", { name: /tap again to discard/i }))[0]);
    await screen.findByPlaceholderText(/should i…/i);

    await act(async () => {
      resolveRequest({ turns: [{ p: "founder", t: "Ship it." }], votes: [{ p: "founder", v: "yes" }], verdict: "Go for it." });
    });

    expect(screen.queryByText(/go for it\./i)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText(/should i…/i)).toBeInTheDocument();
  });
});
