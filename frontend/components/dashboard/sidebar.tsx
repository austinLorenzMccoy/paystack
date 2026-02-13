"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  Key,
  Bell,
  Settings,
  X,
} from "lucide-react";

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const mainNavItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: FileText, label: "Content", href: "/dashboard/content" },
  { icon: Wallet, label: "Payments", href: "/dashboard/payments" },
];

const settingsNavItems = [
  { icon: User, label: "Profile", href: "/dashboard/settings/profile" },
  { icon: Key, label: "API Keys", href: "/dashboard/settings/api-keys" },
  { icon: Bell, label: "Notifications", href: "/dashboard/settings/notifications" },
];

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/dashboard/settings")) {
      setSettingsOpen(true);
    }
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen flex-col border-r-2 border-border bg-charcoal transition-all duration-300
          lg:relative lg:z-0
          ${collapsed ? "w-20" : "w-[280px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        aria-label="Dashboard sidebar"
        id="main-sidebar"
      >
        {/* Logo area */}
        <div className="flex h-16 items-center justify-between border-b-2 border-border px-4">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2 font-mono text-lg font-extrabold uppercase tracking-widest text-bitcoin-orange">
              <Image src="/x402pay-logo.svg" alt="x402Pay logo" width={28} height={28} className="h-7 w-7" />
              x402Pay
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="mx-auto">
              <Image src="/x402pay-logo.svg" alt="x402Pay logo" width={28} height={28} className="h-7 w-7" />
            </Link>
          )}
          <button
            type="button"
            className="text-foreground lg:hidden"
            onClick={onMobileClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={`
                group flex items-center gap-4 px-4 py-3 font-mono text-sm uppercase transition-all
                ${isActive(item.href)
                  ? "border-l-4 border-bitcoin-orange bg-concrete text-bitcoin-orange"
                  : "border-l-4 border-transparent text-foreground hover:bg-concrete hover:pl-5"
                }
              `}
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}

          {/* Settings collapsible */}
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`
                flex w-full items-center gap-4 px-4 py-3 font-mono text-sm uppercase text-foreground transition-all
                border-l-4 border-transparent hover:bg-concrete
              `}
              aria-expanded={settingsOpen}
            >
              <Settings size={20} className="shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">Settings</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${settingsOpen ? "rotate-180" : ""}`}
                  />
                </>
              )}
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                settingsOpen && !collapsed ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {settingsNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  className={`
                    flex items-center gap-4 py-2.5 pl-12 pr-4 font-mono text-xs uppercase transition-all
                    ${isActive(item.href)
                      ? "text-bitcoin-orange"
                      : "text-fog hover:text-foreground"
                    }
                  `}
                >
                  <item.icon size={16} className="shrink-0" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden items-center justify-center border-t-2 border-border p-4 text-foreground transition-colors hover:bg-concrete lg:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          aria-controls="main-sidebar"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </aside>
    </>
  );
}
