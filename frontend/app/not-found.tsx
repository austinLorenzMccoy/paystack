"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div
        className="font-mono text-[8rem] font-extrabold leading-none text-bitcoin-orange sm:text-[10rem]"
        style={{ animation: "glitch 0.5s infinite" }}
        aria-label="404 error"
      >
        404
      </div>

      <h1 className="mt-6 font-mono text-2xl font-extrabold uppercase text-foreground sm:text-3xl">
        Page Not Found
      </h1>

      <p className="mt-4 text-fog">
        {"This page doesn't exist on the blockchain."}
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/"
          className="border-3 border-background bg-bitcoin-orange px-8 py-4 font-mono text-sm font-bold uppercase tracking-wider text-background transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_#000]"
        >
          Back to Home
        </Link>
        <Link
          href="/dashboard"
          className="border-2 border-stacks-purple px-8 py-4 font-mono text-sm font-bold uppercase tracking-wider text-foreground transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_#5546FF]"
        >
          Dashboard
        </Link>
      </div>

      <p className="mt-8 font-mono text-sm text-slate-custom">
        Redirecting in{" "}
        <span className="text-bitcoin-orange">{countdown}</span>
        {" seconds..."}
      </p>
    </div>
  );
}
