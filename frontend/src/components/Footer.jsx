import { Camera, X , MessageCircle } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Column 1 - Brand */}
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              FoodSquad
            </h2>
            <p className="mt-4 text-slate-600 text-sm leading-relaxed">
              Redefining how groups eat together. Real-time ordering,
              seamless splitting.
            </p>
          </div>

          {/* Column 2 - Platform */}
          <div>
            <h3 className="text-slate-900 font-semibold mb-4">
              Platform
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              {[
                "Browse Restaurants",
                "How it Works",
                "Create a Group",
                "Popular Items",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="hover:text-orange-500 transition-colors duration-200 block py-1"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Support */}
          <div>
            <h3 className="text-slate-900 font-semibold mb-4">
              Support
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              {[
                "Help Center",
                "Safety & Hygiene",
                "Terms of Service",
                "Privacy Policy",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="hover:text-orange-500 transition-colors duration-200 block py-1"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Social */}
          <div>
            <h3 className="text-slate-900 font-semibold mb-4">
              Follow the Feast
            </h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-2 rounded-lg bg-white shadow-sm border border-slate-200 hover:text-orange-500 transition"
              >
                <Camera size={18} />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-white shadow-sm border border-slate-200 hover:text-orange-500 transition"
              >
                <X size={18} />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-white shadow-sm border border-slate-200 hover:text-orange-500 transition"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-600">
          
          <p>
            © {new Date().getFullYear()} FoodSquad. Built with ❤️ for Foodies.
          </p>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-orange-500 transition">
              Privacy Policy
            </a>
            <button
              onClick={scrollToTop}
              className="hover:text-orange-500 transition"
            >
              Back to Top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}