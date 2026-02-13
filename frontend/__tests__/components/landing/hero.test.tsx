import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Hero } from "@/components/landing/hero";

describe("Hero", () => {
  it("renders the main headline", () => {
    render(<Hero />);
    expect(screen.getByText("One Line of Code.")).toBeInTheDocument();
    expect(screen.getByText("Bitcoin-Native Payments.")).toBeInTheDocument();
    expect(screen.getByText("Creator-First Monetization.")).toBeInTheDocument();
  });

  it("renders the tagline", () => {
    render(<Hero />);
    expect(
      screen.getByText(/first Bitcoin-native SDK for content monetization/i)
    ).toBeInTheDocument();
  });

  it("renders CTA buttons", () => {
    render(<Hero />);
    expect(screen.getByText("Launch Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Read SDK Docs")).toBeInTheDocument();
  });

  it("renders the code snippet block", () => {
    render(<Hero />);
    expect(screen.getByText(/npm install @x402pay\/sdk/)).toBeInTheDocument();
  });

  it("renders the AI Agent Indicator card", () => {
    render(<Hero />);
    expect(screen.getByText("AI Agent Indicator")).toBeInTheDocument();
    expect(screen.getByText("22%")).toBeInTheDocument();
  });

  it("copies code to clipboard on button click", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<Hero />);
    const copyBtn = screen.getByLabelText("Copy code");
    fireEvent.click(copyBtn);

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("PaywallButton"));
  });
});
