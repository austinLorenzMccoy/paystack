import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

vi.mock("@/components/wallet-connect-button", () => ({
  WalletConnectButton: ({ variant }: { variant: string }) => (
    <button data-testid="wallet-btn" data-variant={variant}>
      Connect
    </button>
  ),
}));

describe("DashboardHeader", () => {
  const onMenuClick = vi.fn();

  it("renders the menu button", () => {
    render(<DashboardHeader onMenuClick={onMenuClick} />);
    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
  });

  it("calls onMenuClick when menu button is clicked", () => {
    render(<DashboardHeader onMenuClick={onMenuClick} />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });

  it("renders the Home breadcrumb link", () => {
    render(<DashboardHeader onMenuClick={onMenuClick} />);
    const homeLinks = screen.getAllByText("Home");
    expect(homeLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the Testnet badge", () => {
    render(<DashboardHeader onMenuClick={onMenuClick} />);
    expect(screen.getByText("Testnet")).toBeInTheDocument();
  });

  it("renders the wallet connect button", () => {
    render(<DashboardHeader onMenuClick={onMenuClick} />);
    expect(screen.getAllByTestId("wallet-btn").length).toBeGreaterThan(0);
  });
});
