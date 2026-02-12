import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CTA } from "@/components/landing/cta";

describe("CTA", () => {
  it("renders the heading", () => {
    render(<CTA />);
    expect(
      screen.getByText("Ready to Monetize Your Content?")
    ).toBeInTheDocument();
  });

  it("renders the subtext", () => {
    render(<CTA />);
    expect(
      screen.getByText(/Join creators already earning/i)
    ).toBeInTheDocument();
  });

  it("renders the Launch Dashboard button", () => {
    render(<CTA />);
    expect(screen.getByText("Launch Dashboard")).toBeInTheDocument();
  });

  it("renders the docs link", () => {
    render(<CTA />);
    expect(
      screen.getByText(/explore our documentation first/i)
    ).toBeInTheDocument();
  });
});
