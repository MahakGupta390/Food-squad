import React from "react";
import heroImg from "../assets/Pizza-sharing-pana.png";
import { useNavigate } from "react-router-dom";

function Hero() {
   const navigate = useNavigate();

  const handleClick = () => {
    navigate("/explore"); // Navigate to Explore page
  };

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center bg-white">

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/60 via-white to-rose-50/40 pointer-events-none"></div>

      {/* Decorative rings */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-orange-100 opacity-60"></div>
      <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full border border-rose-100 opacity-40"></div>

      {/* Glow */}
      <div className="hidden sm:block absolute top-1/2 -translate-y-1/2 left-0 md:left-16 w-[680px] h-[420px] blur-3xl bg-[radial-gradient(ellipse_at_center,_rgba(251,146,60,0.18),_rgba(244,63,94,0.10),_transparent_75%)]"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-24 sm:py-32">

        {/* Heading */}
        <h2 className="text-center md:text-left text-5xl sm:text-6xl lg:text-8xl font-black leading-[1.05] tracking-tight max-w-3xl bg-gradient-to-r from-orange-500 via-orange-400 to-rose-500 bg-clip-text text-transparent">
          Eat Together,<br />Pay Fair.
        </h2>

        {/* Subheading */}
        <p className="text-center md:text-left mt-6 sm:mt-8 text-lg sm:text-xl text-slate-500 max-w-xl md:max-w-lg mx-auto md:mx-0 leading-relaxed">
          The first platform designed to make group food ordering simple and organized-from choosing meals to splitting the bill effortlessly.
        </p>

        {/* CTA */}
        <div className="mt-10 sm:mt-12 flex justify-center md:justify-start">
          <button onClick={handleClick} className="px-8 py-3.5 rounded-full font-semibold text-white text-sm tracking-wide shadow-lg shadow-orange-200
                             bg-gradient-to-r from-orange-500 to-rose-500
                             hover:from-orange-600 hover:to-rose-600
                             transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
            Let’s Get Started →
          </button>
        </div>

      </div>

      {/* Food icons */}
      {/* <div className="hidden lg:flex absolute right-16 xl:right-24 top-1/2 -translate-y-1/2 flex-col gap-5 opacity-80 pointer-events-none">
        <div className="text-5xl">🍕</div>
        <div className="text-4xl ml-8">🍜</div>
        <div className="text-5xl ml-2">🥗</div>
        <div className="text-4xl ml-10">🧆</div>
        <div className="text-3xl ml-4">🍣</div>
      </div> */}
      <div className="hidden lg:flex absolute right-16 xl:right-24 top-1/2 -translate-y-1/2 z-10">
  <img
    src={heroImg}
    alt="Friends eating together"
    className="w-[420px] drop-shadow-xl"
  />
</div>
      {/* <img src="/assets/Pizza sharing-pana.png" className="w-[420px]" /> */}

    </section>
  );
}

export default Hero;