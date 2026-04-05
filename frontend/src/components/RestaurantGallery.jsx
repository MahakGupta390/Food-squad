import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PizzaHut from "../assets/pizza-hut.jpeg";
import BarbequeNation from "../assets/Barbeque.webp";
import WowMomo from "../assets/MOMO.jpg";
import Biryani from "../assets/Biryani.jpeg";
import CafeCoffeeDay from "../assets/Coffee.webp";
import Burger from "../assets/Burger-king.webp";
import McD from "../assets/McD.webp";
import Haldiram from "../assets/Haldiram.webp";
import Subway from "../assets/Subway.webp";

// Map restaurant names to images
const restaurantImages = {
  "Barbeque Nation": BarbequeNation,
  "Cafe Coffee Day": CafeCoffeeDay,
  "Wow! Momo": WowMomo,
  "Biryani Blues": Biryani,
  "Pizza Hut": PizzaHut,
  "Burger King": Burger,
  "McDonald's": McD,
  "Haldiram's": Haldiram,
  "Subway": Subway,
};

// ── Shimmer Skeleton Card ──
const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-sm">
    <div className="relative h-52 bg-slate-200 overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
    <div className="p-5 space-y-3">
      <div className="relative h-5 w-3/4 rounded-full bg-slate-200 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
      <div className="flex gap-2">
        {[60, 44, 52].map((w, i) => (
          <div key={i} className="relative h-4 rounded-full bg-slate-200" style={{ width: `${w}px` }} />
        ))}
      </div>
      <div className="flex justify-between pt-2 border-t border-slate-100">
        {[48, 48, 56].map((w, i) => (
          <div key={i} className="relative h-4 rounded-full bg-slate-200" style={{ width: `${w}px` }} />
        ))}
      </div>
    </div>
  </div>
);

// ── Restaurant Card ──
const RestaurantCard = ({ restaurant }) => {
    const navigate = useNavigate();
  const {_id, name, city, country, cuisines = [], deliveryTime, deliveryPrice } = restaurant;
  const imgSrc = restaurantImages[name];

  return (
    <div 
      // 👈 Add the onClick event here
      onClick={() => navigate(`/restaurant/${_id}`)} 
      className="group rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-md transition-all duration-300 ease-out cursor-pointer hover:-translate-y-2 hover:shadow-xl hover:border-orange-100"
    >
    <div className="group rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-md transition-all duration-300 ease-out cursor-pointer hover:-translate-y-2 hover:shadow-xl hover:border-orange-100">
      <div className="relative h-52 overflow-hidden bg-slate-100">
        <img
          src={imgSrc}
          alt={name}
          className="h-full w-full object-contain bg-slate-100 transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 backdrop-blur-sm shadow-sm">
          <svg className="h-3.5 w-3.5 text-orange-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          {city}
        </span>
      </div>
      <div className="p-5">
        <h3 className="mb-2 text-lg font-bold leading-tight text-slate-900 group-hover:text-orange-500 transition-colors duration-200">
          {name}
        </h3>
        <p className="mb-4 text-sm text-slate-500 leading-relaxed">{cuisines.join(" · ")}</p>
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-600">
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-orange-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="font-medium">{deliveryTime} min</span>
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-orange-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
            <span className="font-medium">₹{deliveryPrice} delivery</span>
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-orange-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
            <span className="font-medium">{country}</span>
          </span>
        </div>
      </div>
    </div>
    </div>
  );
};

// ── Main Gallery Component ──
const RestaurantGallery = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/restaurants");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        console.log("✅ Backend response:", data); // <-- Log backend data
        setRestaurants(data.data);
      } catch (err) {
        console.error("❌ Failed to fetch restaurants:", err);
        setError(err.message);
        setRestaurants([]); // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  return (
    <section className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-slate-50 px-4 py-12 sm:px-8 lg:px-16">
      <div className="mb-10 text-center">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-orange-500">Discover &amp; Order</p>
        <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">Our Restaurants</h1>
        <p className="mt-3 text-slate-500">Fresh flavours delivered straight to your door.</p>
      </div>

      {error && (
        <div className="mb-8 rounded-xl border border-orange-200 bg-orange-50 px-5 py-3 text-sm text-orange-700">
          <strong>Note:</strong> Could not reach the API — showing demo data.
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : restaurants.map((r, idx) => (
              <RestaurantCard key={r._id || idx} restaurant={r} />
            ))}
      </div>

      {!loading && restaurants.length === 0 && (
        <div className="mt-20 flex flex-col items-center gap-3 text-slate-400">
          <svg className="h-16 w-16 opacity-40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5A.75.75 0 0114.25 13H18a.75.75 0 01.75.75V21M3 21V8.25A2.25 2.25 0 015.25 6H10.5M21 21H3" />
          </svg>
          <p className="text-lg font-medium">No restaurants found</p>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
      `}</style>
    </section>
  );
};

export default RestaurantGallery;