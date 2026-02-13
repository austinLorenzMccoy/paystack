import Image from "next/image";
import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Docs", href: "/docs" },
    { label: "Pricing", href: "/pricing" },
  ],
  Community: [
    { label: "Twitter", href: "https://twitter.com" },
    { label: "GitHub", href: "https://github.com" },
    { label: "Discord", href: "https://discord.com" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t-2 border-border bg-charcoal px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2 font-mono text-xl font-extrabold uppercase tracking-widest text-bitcoin-orange">
              <Image src="/x402pay-logo.svg" alt="x402Pay logo" width={28} height={28} className="h-7 w-7" />
              x402Pay
            </div>
            <p className="text-sm leading-relaxed text-fog">
              Bitcoin Creator Monetization SDK. Built on Stacks.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 font-mono text-sm font-bold uppercase tracking-wider text-foreground">
                {title}
              </h3>
              <nav aria-label={`${title} links`}>
                <ul className="flex flex-col gap-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-fog transition-colors hover:text-bitcoin-orange"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t-2 border-border pt-8">
          <p className="font-mono text-xs text-slate-custom">
            &copy; 2026 x402Pay. Built on Stacks. MIT License.
          </p>
        </div>
      </div>
    </footer>
  );
}
