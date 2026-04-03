import { useState, useRef, useEffect } from "react";
import {
  Search,
  Clock,
  TrendingUp,
  ChevronDown,
  MapPin,
  X,
  SlidersHorizontal,
} from "lucide-react";

const CITIES = [
  "All Cities",
  "Mumbai",
  "Delhi",
  "Jaipur",
  "Agra",
  "Pune",
];

const CUISINES = [
  "All Cuisines",
  "North Indian",
  "South Indian",
  "Chinese",
  "Italian",
  "Continental",
  "Mughlai",
  "Thai",
  "Japanese",
  "Mexican",
  "Biryani",
];

const FILTER_PILLS = [
  { id: "under30", label: "Under 30 mins", icon: Clock },
  { id: "priceLow", label: "Price: Low to High", icon: TrendingUp },
];

export default function SearchFilterHeader() {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-100/80 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 space-y-3">

          {/* 🔥 Title + Badge */}
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">
              Search & Filters
            </h2>
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-semibold">
              Coming Soon 🚀
            </span>
          </div>

          {/* ── Row 1: Search Bar ── */}
          <div className="flex items-center gap-2">

            {/* Search */}
            <div
              className={`flex-1 flex items-center gap-3 bg-white rounded-full px-4 py-2.5 shadow-md border ${
                isFocused
                  ? "border-orange-500 ring-2 ring-orange-100"
                  : "border-slate-200"
              } opacity-60 cursor-not-allowed`}
            >
              <Search size={18} className="text-slate-400" />

              <input
                type="text"
                disabled
                placeholder="Search restaurants (Coming Soon...)"
                className="flex-1 bg-transparent text-slate-400 text-sm outline-none cursor-not-allowed"
              />
            </div>

            {/* City */}
            <button
              disabled
              className="opacity-60 cursor-not-allowed flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border text-sm bg-white"
            >
              <MapPin size={14} className="text-orange-500" />
              City
              <ChevronDown size={13} />
            </button>
          </div>

          {/* ── Row 2: Filters ── */}
          <div className="flex items-center gap-2 opacity-60 cursor-not-allowed">

            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 min-w-max">

                {/* Filter Pills */}
                {FILTER_PILLS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    disabled
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold bg-white text-slate-400"
                  >
                    <Icon size={13} className="text-slate-400" />
                    {label}
                  </button>
                ))}

                {/* Cuisine */}
                <button
                  disabled
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold bg-white text-slate-400"
                >
                  <SlidersHorizontal size={13} />
                  Cuisine
                  <ChevronDown size={11} />
                </button>

              </div>
            </div>
          </div>

          {/* 🔥 Helper Text */}
          <p className="text-xs text-slate-400">
            Advanced search & filters will be available soon.
          </p>

        </div>
      </div>

      {/* Styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </header>
  );
}