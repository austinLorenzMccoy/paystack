import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Stats } from "@/components/landing/stats";
import { RealtimePanel } from "@/components/landing/realtime-panel";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <RealtimePanel />
        <Stats />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
