/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

vi.mock("./lib/auth.js", () => ({
  updateProfile: vi.fn(),
  resizeImageToDataUrl: vi.fn(),
}));
vi.mock("./lib/waitlist.js", () => ({ joinWaitlist: vi.fn() }));

import { ProfileSettings } from "./auth-ui.jsx";
import { updateProfile } from "./lib/auth.js";

const baseUser = { name: "Cesar", situation: "Deciding on a move", values: ["Freedom"], customPicture: null };

beforeEach(() => {
  localStorage.clear();
  updateProfile.mockReset();
});

afterEach(cleanup);

describe("ProfileSettings — profile tab save", () => {
  it("saves the edited situation and shows a confirmation without closing", async () => {
    const updated = { ...baseUser, situation: "Deciding on a move abroad" };
    updateProfile.mockResolvedValue(updated);
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <ProfileSettings user={baseUser} language="en" onSave={onSave} onClose={onClose} onSignOut={vi.fn()} />
    );

    const textarea = screen.getByLabelText(/Where you stand right now/i);
    fireEvent.change(textarea, { target: { value: "Deciding on a move abroad" } });
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    await waitFor(() => expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ situation: "Deciding on a move abroad" })
    ));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(updated));

    // The saved-toast is rendered by ProfileSettings itself and must be visible —
    // this only happens if the caller keeps the panel mounted after onSave fires.
    expect(await screen.findByText(/Changes saved/i)).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows an error and does not call onSave when the request fails", async () => {
    updateProfile.mockRejectedValue(new Error("network"));
    const onSave = vi.fn();

    render(
      <ProfileSettings user={baseUser} language="en" onSave={onSave} onClose={vi.fn()} onSignOut={vi.fn()} />
    );
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("toggles a value chip up to the 3-value limit", () => {
    render(
      <ProfileSettings user={{ ...baseUser, values: [] }} language="en" onSave={vi.fn()} onClose={vi.fn()} onSignOut={vi.fn()} />
    );
    const freedom = screen.getByRole("button", { name: "Freedom" });
    fireEvent.click(freedom);
    expect(freedom).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(freedom);
    expect(freedom).toHaveAttribute("aria-pressed", "false");
  });
});

describe("ProfileSettings — notifications tab", () => {
  it("persists a toggle to localStorage and confirms", () => {
    render(
      <ProfileSettings user={baseUser} language="en" onSave={vi.fn()} onClose={vi.fn()} onSignOut={vi.fn()} />
    );
    fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
    const [digestToggle] = screen.getAllByRole("button", { name: "○" });
    fireEvent.click(digestToggle);

    expect(JSON.parse(localStorage.getItem("council:notif"))).toEqual({ digest: true });
    expect(screen.getByRole("status")).toBeTruthy();
  });
});

describe("ProfileSettings — history tab", () => {
  it("shows a View verdict link for entries with a saved debate id, and Revisit for all entries", () => {
    localStorage.setItem("council:history", JSON.stringify([
      { id: "abc123", question: "Should I move?", headline: "Leans yes.", timestamp: Date.now() },
      { id: null, question: "Old entry with no id", headline: null, timestamp: Date.now() },
    ]));
    const onViewHistory = vi.fn();
    const onRevisit = vi.fn();

    render(
      <ProfileSettings
        user={baseUser} language="en" onSave={vi.fn()} onClose={vi.fn()} onSignOut={vi.fn()}
        onViewHistory={onViewHistory} onRevisit={onRevisit}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /history/i }));

    expect(screen.getAllByRole("button", { name: "Revisit" })).toHaveLength(2);
    const viewButtons = screen.getAllByRole("button", { name: "View verdict" });
    expect(viewButtons).toHaveLength(1); // only the entry with an id

    fireEvent.click(viewButtons[0]);
    expect(onViewHistory).toHaveBeenCalledWith("abc123");
  });
});

describe("ProfileSettings — preferences tab", () => {
  it("calls onThemeToggle and onLanguageChange without touching save state", () => {
    const onThemeToggle = vi.fn();
    const onLanguageChange = vi.fn();
    render(
      <ProfileSettings
        user={baseUser} language="en" theme="dark"
        onSave={vi.fn()} onClose={vi.fn()} onSignOut={vi.fn()}
        onThemeToggle={onThemeToggle} onLanguageChange={onLanguageChange}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /preferences/i }));
    fireEvent.click(screen.getByRole("button", { name: "Light" }));
    expect(onThemeToggle).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Português" }));
    expect(onLanguageChange).toHaveBeenCalledWith("pt");
  });
});
