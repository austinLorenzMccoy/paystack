import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Features } from "@/components/landing/features";

describe("Features", () => {
  it("renders the section heading", () => {
    render(<Features />);
    expect(screen.getByText("Why x402Pay Wins")).toBeInTheDocument();
  });

  it("renders all three feature cards", () => {
    render(<Features />);
    expect(screen.getByText("Bitcoin Native")).toBeInTheDocument();
    expect(screen.getByText("Clarity Contracts")).toBeInTheDocument();
    expect(screen.getByText("AI Agents")).toBeInTheDocument();
  });

  it("renders feature descriptions", () => {
    render(<Features />);
    expect(screen.getByText(/Accept sBTC, STX, and USDCx/)).toBeInTheDocument();
    expect(screen.getByText(/Programmable revenue splits/)).toBeInTheDocument();
    expect(screen.getByText(/agentic economy/)).toBeInTheDocument();
  });

  it("renders Learn More links for each feature", () => {
    render(<Features />);
    const links = screen.getAllByText("Learn More");
    expect(links).toHaveLength(3);
  });
});
