import Link from "next/link";

export function CTA() {
  return (
    <section className="bg-bitcoin-orange px-6 py-24 text-center">
      <h2 className="mb-6 font-mono text-3xl font-extrabold uppercase tracking-wider text-background md:text-4xl">
        Ready to Monetize Your Content?
      </h2>
      <p className="mx-auto mb-10 max-w-lg text-lg text-background/80">
        Join creators already earning with Bitcoin-native payments. Get started
        in minutes.
      </p>
      <Link
        href="/dashboard"
        className="inline-block border-3 border-background bg-background px-10 py-4 font-mono text-sm font-bold uppercase tracking-wider text-bitcoin-orange transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_rgba(0,0,0,0.3)]"
      >
        Launch Dashboard
      </Link>
      <div className="mt-6">
        <Link
          href="/docs"
          className="font-mono text-sm text-background/70 underline underline-offset-4 transition-colors hover:text-background"
        >
          or explore our documentation first
        </Link>
      </div>
    </section>
  );
}
