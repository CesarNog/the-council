/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { GoogleSignIn } from "./auth-ui.jsx";

describe("GoogleSignIn", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", "test-client-id.apps.googleusercontent.com");
    window.google = {
      accounts: { id: { initialize: vi.fn(), renderButton: vi.fn() } },
    };
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    delete window.google;
  });

  it("calls google.accounts.id.initialize exactly once, even when the caller re-renders with a new onCredential reference", () => {
    const first = vi.fn();
    const { rerender } = render(<GoogleSignIn onCredential={first} />);
    expect(window.google.accounts.id.initialize).toHaveBeenCalledTimes(1);

    // Simulate the real-world cause: a parent that redefines the callback
    // (e.g. App.jsx's handleCredential) on every render, not memoized.
    const second = vi.fn();
    rerender(<GoogleSignIn onCredential={second} />);
    rerender(<GoogleSignIn onCredential={() => {}} />);

    expect(window.google.accounts.id.initialize).toHaveBeenCalledTimes(1);
  });

  it("routes the credential to the latest onCredential even though initialize only ran once", () => {
    const first = vi.fn();
    const { rerender } = render(<GoogleSignIn onCredential={first} />);

    const second = vi.fn();
    rerender(<GoogleSignIn onCredential={second} />);

    const { callback } = window.google.accounts.id.initialize.mock.calls[0][0];
    callback({ credential: "the-jwt" });

    expect(second).toHaveBeenCalledWith("the-jwt");
    expect(first).not.toHaveBeenCalled();
  });
});
