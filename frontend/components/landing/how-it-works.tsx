export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Install SDK",
      code: "$ npm install @paystack/sdk",
    },
    {
      number: "02",
      title: "Configure Payments",
      code: 'app.use(paystackMiddleware())',
    },
    {
      number: "03",
      title: "Start Earning",
      code: "// Revenue flows to your wallet",
    },
  ];

  return (
    <section className="px-6 py-24 lg:px-8">
      <h2 className="mb-16 text-center font-mono text-3xl font-extrabold uppercase tracking-wider text-foreground md:text-4xl">
        Get Started in 3 Steps
      </h2>

      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-0">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative flex items-stretch"
            >
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div
                  className="absolute left-8 top-full h-8 w-0.5 bg-border md:left-1/2"
                  aria-hidden="true"
                />
              )}

              <div
                className="flex w-full flex-col items-start gap-6 border-2 border-border bg-charcoal p-6 md:flex-row md:items-center"
                style={{
                  marginLeft: `${index * 4}%`,
                  animation: `fade-in-up 0.6s ease-out ${index * 0.2}s backwards`,
                }}
              >
                {/* Step Number */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-bitcoin-orange font-mono text-2xl font-extrabold text-bitcoin-orange">
                  {step.number}
                </div>

                <div className="flex-1">
                  <h3 className="mb-2 font-mono text-lg font-bold uppercase text-foreground">
                    {step.title}
                  </h3>
                  <div className="border-2 border-border bg-concrete px-4 py-3 font-mono text-sm text-success-green">
                    {step.code}
                  </div>
                </div>
              </div>

              {/* Spacer for stagger */}
              {index < steps.length - 1 && <div className="h-8" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
