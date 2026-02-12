import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DocsPage from "@/app/docs/page";

describe("DocsPage", () => {
  it("renders the documentation heading", () => {
    render(<DocsPage />);
    expect(
      screen.getByText(/Wire Bitcoin-native paywalls in minutes/i)
    ).toBeInTheDocument();
  });

  it("renders SDK quickstart steps", () => {
    render(<DocsPage />);
    expect(screen.getByText("Install")).toBeInTheDocument();
    expect(screen.getByText("Configure")).toBeInTheDocument();
    expect(screen.getByText("Launch")).toBeInTheDocument();
  });

  it("renders the security checklist", () => {
    render(<DocsPage />);
    expect(
      screen.getByText(/Hiro Wallet connected & signature verified/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Analytics processor Edge Function deployed/)
    ).toBeInTheDocument();
  });

  it("renders asset selector buttons", () => {
    render(<DocsPage />);
    expect(screen.getByRole("button", { name: "sBTC" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "STX" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "USDCx" })).toBeInTheDocument();
  });

  it("switches asset rail on click", () => {
    render(<DocsPage />);
    fireEvent.click(screen.getByRole("button", { name: "STX" }));
    expect(screen.getByText("STX Rail")).toBeInTheDocument();
    expect(screen.getByText("Programmable yield")).toBeInTheDocument();
  });

  it("renders the end-to-end flow cards", () => {
    render(<DocsPage />);
    expect(screen.getByText("Signal")).toBeInTheDocument();
    expect(screen.getByText("Contract")).toBeInTheDocument();
    expect(screen.getByText("Access")).toBeInTheDocument();
  });

  it("copies code snippet on button click", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<DocsPage />);
    const copyBtn = screen.getByLabelText("Copy snippet");
    fireEvent.click(copyBtn);

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("PaywallButton")
    );
  });

  it("renders CTA buttons", () => {
    render(<DocsPage />);
    expect(screen.getByText("Launch Dashboard")).toBeInTheDocument();
    expect(screen.getByText("View GitHub Examples")).toBeInTheDocument();
  });
});
