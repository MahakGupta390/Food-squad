import { Utensils, UserPlus, Receipt } from "lucide-react";
 
const steps = [
  {
    id: 1,
    icon: Utensils,
    title: "Choose Your Food",
    subtext: "Browse local favorites and build your personal basket.",
  },
  {
    id: 2,
    icon: UserPlus,
    title: "Order Solo or Invite Friends",
    subtext: "Share a unique link to turn your meal into a social event.",
  },
  {
    id: 3,
    icon: Receipt,
    title: "Automatic Bill Split",
    subtext:
      "No more math. We calculate everyone's share plus tax and fees instantly.",
  },
];
 
function StepCard({ step, index, total }) {
  const Icon = step.icon;
  const isLast = index === total;
 
  return (
    <>
      {/* ── MOBILE: vertical timeline item ── */}
      <div className="flex gap-4 md:hidden">
        {/* Left column: connector line + dot */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-rose-500 bg-rose-50 shrink-0 z-10">
            <span className="text-sm font-bold text-orange-600">{step.id}</span>
          </div>
            <div
              className={`w-px mt-1 mb-0 ${
  isLast ? "h-6 opacity-40" : "h-12"
}`}
              style={{
                borderLeft: "2px dashed #ffedd5",
                minHeight: "3rem",
              }}
            />
        </div>
 
        {/* Right column: card */}
        <div
          className={`flex-1 border border-slate-100 rounded-2xl p-5 bg-white
            transition-all duration-300 ease-out
            hover:-translate-y-1 hover:shadow-xl hover:border-orange-100
            ${!isLast ? "mb-4" : ""}`}
        >
          {/* Lottie placeholder */}
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
            {/* Insert Lottie Animation Here */}
            <Icon className="w-5 h-5 text-orange-500" strokeWidth={1.75} />
          </div>
 
          <h3 className="font-bold text-slate-800 text-base leading-snug mb-1">
            {step.title}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">{step.subtext}</p>
        </div>
      </div>
 
      {/* ── DESKTOP: horizontal step card (no connector, handled by parent) ── */}
      <div
        className="hidden md:flex flex-col border border-slate-100 rounded-2xl p-6 bg-white
          transition-all duration-300 ease-out cursor-default
          hover:-translate-y-2 hover:shadow-xl hover:border-rose-100 flex-1"
      >
        {/* Step number badge */}
        <div className="flex items-center gap-3 mb-5">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white text-xs font-bold shrink-0">
            {step.id}
          </span>
          <div className="h-px flex-1 border-t border-slate-100" />
        </div>
 
        {/* Lottie placeholder */}
        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-5 self-start">
          {/* Insert Lottie Animation Here */}
          <Icon className="w-6 h-6 text-orange-500" strokeWidth={1.75} />
        </div>
 
        <h3 className="font-bold text-slate-800 text-lg leading-snug mb-2">
          {step.title}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed">{step.subtext}</p>
      </div>
    </>
  );
}
 
export default function HowItWorks() {
  return (
    <section className="w-full bg-white py-20 px-6 sm:px-10 lg:px-16">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="mb-12 md:mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-orange-500 mb-3">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 leading-tight max-w-md">
            Group ordering,{" "}
            <span className="text-slate-400 font-normal">made simple.</span>
          </h2>
        </div>
 
        {/* ── MOBILE layout: vertical timeline ── */}
        <div className="md:hidden">
          {steps.map((step, i) => (
            <StepCard key={step.id} step={step} index={i} total={steps.length} />
          ))}
        </div>
 
        {/* ── DESKTOP layout: horizontal 3-step ── */}
        <div className="hidden md:block">
          {/* Progress connector row */}
          <div className="flex items-center mb-6 px-4">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center flex-1">
                {/* Dot */}
                <div className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
                {/* Dashed line to next step */}
                {/* {i < steps.length - 1 && (
                  <div
                    className="flex-1 mx-3"
                    style={{
                      borderTop: "2px dashed #e11d48",
                    }}
                  />
                )}
              </div>
            ))} */}
            <div
  className="flex-1 mx-3"
  style={{
    borderTop: "2px dashed #e11d48",
  }}
/>
</div>))}
          </div>
 
          {/* Cards row */}
          <div className="flex gap-5">
            {steps.map((step, i) => (
              <StepCard key={step.id} step={step} index={i} total={steps.length} />
            ))}
          </div>
        </div>
 
      </div>
    </section>
  );
}