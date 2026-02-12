import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RealtimePanel } from "@/components/landing/realtime-panel";

describe("RealtimePanel", () => {
  it("renders the ticker strip", () => {
    render(<RealtimePanel />);
    expect(screen.getByText(/Realtime feed engaged/)).toBeInTheDocument();
  });

  it("renders the live stream heading", () => {
    render(<RealtimePanel />);
    expect(screen.getByText("AI x Human Traffic")).toBeInTheDocument();
  });

  it("renders stream entries", () => {
    render(<RealtimePanel />);
    expect(screen.getByText("AI Agent")).toBeInTheDocument();
    expect(screen.getByText("Creator")).toBeInTheDocument();
    expect(screen.getByText("Settlement")).toBeInTheDocument();
  });

  it("renders agent telemetry card", () => {
    render(<RealtimePanel />);
    expect(screen.getByText("Agent Telemetry")).toBeInTheDocument();
    expect(screen.getByText("24 agents")).toBeInTheDocument();
  });

  it("renders status rows in telemetry", () => {
    render(<RealtimePanel />);
    expect(screen.getByText("Stacks Wallet")).toBeInTheDocument();
    expect(screen.getByText("Clarity Contract")).toBeInTheDocument();
    expect(screen.getByText("Analytics Feed")).toBeInTheDocument();
  });

  it("renders the View Supabase Channel button", () => {
    render(<RealtimePanel />);
    expect(screen.getByText("View Supabase Channel")).toBeInTheDocument();
  });
});
