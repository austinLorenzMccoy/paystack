import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Stats } from "@/components/landing/stats";

describe("Stats", () => {
  it("renders all stat values", () => {
    render(<Stats />);
    expect(screen.getByText("$10K+")).toBeInTheDocument();
    expect(screen.getByText("50+")).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("renders all stat labels", () => {
    render(<Stats />);
    expect(screen.getByText("Revenue Processed")).toBeInTheDocument();
    expect(screen.getByText("Active Creators")).toBeInTheDocument();
    expect(screen.getByText("AI Agent Payments")).toBeInTheDocument();
    expect(screen.getByText("Uptime")).toBeInTheDocument();
  });
});
