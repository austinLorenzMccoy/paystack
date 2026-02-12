import { Bitcoin, FileCode, Bot, ArrowRight } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Bitcoin,
    title: "Bitcoin Native",
    description:
      "Accept sBTC, STX, and USDCx with Bitcoin's security guarantees. First-class support for Bitcoin L2 payments.",
    color: "text-bitcoin-orange",
    link: "/docs",
  },
  {
    icon: FileCode,
    title: "Clarity Contracts",
    description:
      "Programmable revenue splits via smart contracts. Set royalties, collaborator shares, and stacking rewards.",
    color: "text-stacks-purple",
    link: "/docs",
  },
  {
    icon: Bot,
    title: "AI Agents",
    description:
      "Tap into the agentic economy. Built-in support for autonomous AI agent payments and discovery.",
    color: "text-success-green",
    link: "/docs",
  },
];

export function Features() {
  return (
    <section className="bg-charcoal px-6 py-24 lg:px-8">
      <h2 className="mb-16 text-center font-mono text-3xl font-extrabold uppercase tracking-wider text-foreground md:text-4xl">
        Why PayStack Wins
      </h2>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group relative border-2 border-border bg-concrete p-8 transition-all hover:-translate-y-1 hover:border-bitcoin-orange"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-bitcoin-orange" aria-hidden="true" />
            <feature.icon className={`mb-6 h-10 w-10 ${feature.color}`} strokeWidth={1.5} />
            <h3 className="mb-3 font-mono text-xl font-bold uppercase text-foreground">
              {feature.title}
            </h3>
            <p className="mb-6 leading-relaxed text-fog">
              {feature.description}
            </p>
            <Link
              href={feature.link}
              className="inline-flex items-center gap-2 font-mono text-sm uppercase text-bitcoin-orange transition-all group-hover:gap-3"
            >
              Learn More <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
