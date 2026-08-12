/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Onboarding } from "./components.jsx";

afterEach(cleanup);

function fillQuickSteps() {
  // step 0: name (no googleNames -> free text)
  fireEvent.change(screen.getByPlaceholderText(/your name/i), { target: { value: "Alex" } });
  fireEvent.click(screen.getByRole("button", { name: /continue/i }));
  // step 1: question
  fireEvent.change(screen.getByPlaceholderText(/quit my job/i), { target: { value: "Should I move abroad?" } });
  fireEvent.click(screen.getByRole("button", { name: /continue/i }));
  // step 2: emotional weight (any option advances)
  fireEvent.click(screen.getByRole("button", { name: /^moderate$/i }));
  // step 3: category
  fireEvent.click(screen.getByRole("button", { name: /^career$/i }));
  // step 4: main fear
  fireEvent.click(screen.getByRole("button", { name: /regretting it/i }));
}

describe("Onboarding — Quick vs Deep Council", () => {
  it("Quick Council finishes immediately with no deep fields on the payload", () => {
    const onDone = vi.fn();
    render(<Onboarding onDone={onDone} language="en" />);
    fillQuickSteps();
    fireEvent.click(screen.getByRole("button", { name: /continue/i })); // -> depth choice screen
    fireEvent.click(screen.getByRole("button", { name: /quick council/i }));

    expect(onDone).toHaveBeenCalledTimes(1);
    const payload = onDone.mock.calls[0][0];
    expect(payload.question).toBe("Should I move abroad?");
    expect(payload.options).toBeUndefined();
    expect(payload.successPicture).toBeUndefined();
  });

  it("Deep Council walks through all three extra screens and includes them in the payload", () => {
    const onDone = vi.fn();
    render(<Onboarding onDone={onDone} language="en" />);
    fillQuickSteps();
    fireEvent.click(screen.getByRole("button", { name: /continue/i })); // -> depth choice screen
    fireEvent.click(screen.getByRole("button", { name: /deep council/i }));

    // Deep I: options + constraints
    expect(screen.getByText(/what exactly are you choosing between/i)).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText(/first path/i), { target: { value: "Stay" } });
    fireEvent.change(screen.getByPlaceholderText(/second path/i), { target: { value: "Move to Lisbon" } });
    fireEvent.click(screen.getByRole("button", { name: /^continue$/i }));

    // Deep II: deadline / reversible / cost of waiting
    expect(screen.getByText(/is there a deadline/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /this month/i }));
    fireEvent.click(screen.getByRole("button", { name: /with difficulty/i }));
    fireEvent.click(screen.getByRole("button", { name: /^medium$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^continue$/i }));

    // Deep III: success picture / known / unknown
    expect(screen.getByText(/what does success look like a year from now/i)).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText(/paint the picture/i), { target: { value: "Settled and fluent in Portuguese." } });
    fireEvent.click(screen.getByRole("button", { name: /convene the council/i }));

    expect(onDone).toHaveBeenCalledTimes(1);
    const payload = onDone.mock.calls[0][0];
    expect(payload.options).toEqual(["Stay", "Move to Lisbon"]);
    expect(payload.deadline).toBe("this_month");
    expect(payload.reversible).toBe("hard");
    expect(payload.costOfWaiting).toBe("medium");
    expect(payload.successPicture).toBe("Settled and fluent in Portuguese.");
  });

  it("Skip to Quick Council mid-Deep-flow finishes without the remaining fields", () => {
    const onDone = vi.fn();
    render(<Onboarding onDone={onDone} language="en" />);
    fillQuickSteps();
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("button", { name: /deep council/i }));

    fireEvent.change(screen.getByPlaceholderText(/first path/i), { target: { value: "Stay" } });
    fireEvent.click(screen.getByRole("button", { name: /skip to quick council/i }));

    expect(onDone).toHaveBeenCalledTimes(1);
    const payload = onDone.mock.calls[0][0];
    // options were captured before skipping, but the later screens were never reached
    expect(payload.options).toEqual(["Stay"]);
    expect(payload.deadline).toBe("");
    expect(payload.known).toBe("");
  });
});
