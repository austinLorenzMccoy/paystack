import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HowItWorks } from "@/components/landing/how-it-works";

describe("HowItWorks", () => {
  it("renders the section heading", () => {
    render(<HowItWorks />);
    expect(screen.getByText("Get Started in 3 Steps")).toBeInTheDocument();
  });

  it("renders all three steps", () => {
    render(<HowItWorks />);
    expect(screen.getByText("Install SDK")).toBeInTheDocument();
    expect(screen.getByText("Configure Payments")).toBeInTheDocument();
    expect(screen.getByText("Start Earning")).toBeInTheDocument();
  });

  it("renders step numbers", () => {
    render(<HowItWorks />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
  });

  it("renders code snippets for each step", () => {
    render(<HowItWorks />);
    expect(screen.getByText("$ npm install @paystack/sdk")).toBeInTheDocument();
    expect(screen.getByText("app.use(paystackMiddleware())")).toBeInTheDocument();
    expect(screen.getByText("// Revenue flows to your wallet")).toBeInTheDocument();
  });
});
