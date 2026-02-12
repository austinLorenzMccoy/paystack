import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "@/components/landing/header";

vi.mock("@/components/wallet-connect-button", () => ({
  WalletConnectButton: ({ variant }: { variant: string }) => (
    <button data-testid="wallet-btn" data-variant={variant}>
      Connect Wallet
    </button>
  ),
}));

describe("Header", () => {
  it("renders the PayStack logo link", () => {
    render(<Header />);
    expect(screen.getByText("PAYSTACK")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<Header />);
    expect(screen.getByText("Docs")).toBeInTheDocument();
    expect(screen.getByText("Pricing")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });

  it("renders the status strip", () => {
    render(<Header />);
    expect(screen.getByText(/Realtime x402 Feed: Online/)).toBeInTheDocument();
  });

  it("renders wallet connect button when not connected", () => {
    render(<Header />);
    expect(screen.getByTestId("wallet-btn")).toBeInTheDocument();
  });

  it("toggles mobile menu on button click", () => {
    render(<Header />);
    const toggleBtn = screen.getByLabelText("Toggle menu");
    fireEvent.click(toggleBtn);
    const mobileNav = screen.getByLabelText("Mobile navigation");
    expect(mobileNav).toBeInTheDocument();
  });
});
