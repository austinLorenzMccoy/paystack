import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Sidebar } from "@/components/dashboard/sidebar";

describe("Sidebar", () => {
  const onMobileClose = vi.fn();

  it("renders the x402Pay logo", () => {
    render(<Sidebar mobileOpen={false} onMobileClose={onMobileClose} />);
    expect(screen.getByText("x402Pay")).toBeInTheDocument();
  });

  it("renders main navigation items", () => {
    render(<Sidebar mobileOpen={false} onMobileClose={onMobileClose} />);
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Payments")).toBeInTheDocument();
  });

  it("renders the Settings toggle", () => {
    render(<Sidebar mobileOpen={false} onMobileClose={onMobileClose} />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("expands settings on click", () => {
    render(<Sidebar mobileOpen={false} onMobileClose={onMobileClose} />);
    fireEvent.click(screen.getByText("Settings"));
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("API Keys")).toBeInTheDocument();
    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });

  it("renders collapse toggle button", () => {
    render(<Sidebar mobileOpen={false} onMobileClose={onMobileClose} />);
    expect(screen.getByLabelText("Collapse sidebar")).toBeInTheDocument();
  });

  it("renders close button for mobile", () => {
    render(<Sidebar mobileOpen={true} onMobileClose={onMobileClose} />);
    expect(screen.getByLabelText("Close sidebar")).toBeInTheDocument();
  });

  it("calls onMobileClose when close button is clicked", () => {
    render(<Sidebar mobileOpen={true} onMobileClose={onMobileClose} />);
    fireEvent.click(screen.getByLabelText("Close sidebar"));
    expect(onMobileClose).toHaveBeenCalled();
  });
});
