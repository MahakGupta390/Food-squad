import { useState } from "react";
import { ShoppingCart, Users, Calculator } from "lucide-react";
 
const features = [
  {
    id: "cart",
    icon: ShoppingCart,
    title: "Real-time Collaboration",
    description:
      "Watch your cart update live as friends add their favorite dishes. No more duplicate orders or missing items.",
    badge: null,
    extra: "live", // renders the pulsing Live dot
  },
  {
    id: "ordering",
    icon: Users,
    title: "Solo or Social",
    description:
      "Switch between a private meal or a group feast with one toggle. Perfect for office lunches or a quiet night in.",
    badge: null,
    extra: null,
  },
  {
    id: "split",
    icon: Calculator,
    title: "Perfectly Divided",
    description:
      "Automatically splits the total, tax, and tips based on exactly what each person ordered.",
    badge: "Most Loved",
    extra: null,
  },
];
 
function LiveDot() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-600 text-[10px] font-semibold tracking-wide uppercase select-none">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500" />
      </span>
      Live
    </span>
  );
}
 
function FeatureCard({ feature }) {
  const [hovered, setHovered] = useState(false);
  const Icon = feature.icon;
 
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        group relative flex flex-col bg-white rounded-2xl border border-slate-100 p-7
        transition-all duration-300 ease-out cursor-default
        ${hovered ? "scale-105 shadow-[0_8px_40px_-8px_rgba(148,163,184,0.35)]" : "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_16px_-4px_rgba(148,163,184,0.18)]"}
      `}
    >
      {/* Most Loved badge */}
      {feature.badge && (
        <span className="absolute -top-3 left-6 inline-flex items-center px-3 py-1 rounded-full bg-orange-500 text-white text-[11px] font-bold tracking-wide shadow-sm">
          {feature.badge}
        </span>
      )}
 
      {/* Icon area */}
      <div className="flex items-start justify-between mb-6">
        <div
          className={`
            flex items-center justify-center w-12 h-12 rounded-xl
            transition-colors duration-300
            ${hovered ? "bg-orange-50" : "bg-slate-50"}
          `}
        >
          <Icon
            className={`w-5 h-5 transition-colors duration-300 ${hovered ? "text-orange-500" : "text-slate-400"}`}
            strokeWidth={1.75}
          />
        </div>
 
        {/* Live dot for cart feature */}
        {feature.extra === "live" && <LiveDot />}
      </div>
 
      {/* Text */}
      <h3 className="text-base font-bold text-slate-800 mb-2 leading-snug">
        {feature.title}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed flex-1">
        {feature.description}
      </p>
 
    
    </div>
  );
}
 
export default function Features() {
  return (
    <section className="w-full bg-slate-50 py-20 px-6 sm:px-10 lg:px-16">
      <div className="max-w-5xl mx-auto">
 
        {/* Section header */}
        <div className="mb-12 md:mb-16 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-orange-500 mb-3">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 leading-tight">
            Everything your group needs,{" "}
            <span className="text-slate-400 font-normal">nothing it doesn't.</span>
          </h2>
        </div>
 
        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
 
      </div>
    </section>
  );
}