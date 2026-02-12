import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import DashboardOverview from "@/app/dashboard/page";

describe("DashboardOverview", () => {
  it("renders placeholder stats when no user is logged in", async () => {
    render(<DashboardOverview />);
    await waitFor(() => {
      expect(screen.getByText("$32,400")).toBeInTheDocument();
    });
  });

  it("renders the Creator Overview heading", async () => {
    render(<DashboardOverview />);
    await waitFor(() => {
      expect(screen.getByText("Creator Overview")).toBeInTheDocument();
    });
  });

  it("renders the live AI agents ticker", async () => {
    render(<DashboardOverview />);
    await waitFor(() => {
      expect(screen.getByText("Live AI Agents")).toBeInTheDocument();
    });
  });

  it("renders the time range selector", async () => {
    render(<DashboardOverview />);
    await waitFor(() => {
      expect(screen.getByText("Last 30 Days")).toBeInTheDocument();
    });
  });

  it("renders the SDK callout section", async () => {
    render(<DashboardOverview />);
    await waitFor(() => {
      expect(screen.getByText("Drop-in Integration")).toBeInTheDocument();
    });
  });

  it("renders the x402 Sats Flow section", async () => {
    render(<DashboardOverview />);
    await waitFor(() => {
      expect(screen.getByText(/Signal → Contract → Access/)).toBeInTheDocument();
    });
  });

  it("renders placeholder top content", async () => {
    render(<DashboardOverview />);
    await waitFor(() => {
      expect(screen.getByText("x402 Premium Feed")).toBeInTheDocument();
    });
  });

  it("renders placeholder recent payments", async () => {
    render(<DashboardOverview />);
    await waitFor(() => {
      expect(screen.getByText("SP2...9J18")).toBeInTheDocument();
    });
  });
});
