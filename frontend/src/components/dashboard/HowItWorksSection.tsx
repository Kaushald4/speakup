import { HOW_IT_WORKS_COPY, HOW_IT_WORKS_STEPS } from "@/constants/dashboard";

export function HowItWorksSection() {
  return (
    <section id="how" className="border-y border-hairline bg-canvas-soft/60">
      <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-6 sm:py-24">
        <div className="max-w-2xl">
          <p className="eyebrow">{HOW_IT_WORKS_COPY.eyebrow}</p>
          <h2 className="display-lg mt-3 text-ink">{HOW_IT_WORKS_COPY.heading}</h2>
        </div>
        <div className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <div key={step.title} className="border-t border-hairline-strong pt-6">
              <span className="font-display text-[30px] font-light leading-none text-muted-soft">
                0{index + 1}
              </span>
              <h3 className="mt-4 text-[20px] font-medium leading-snug text-ink">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{step.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
