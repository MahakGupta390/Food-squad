import { useState, useEffect } from 'react';
import logo from '../assets/Cutlery.png';
import { useAuth0 } from "@auth0/auth0-react";

function Navbar() {
  // 1. Add 'isAuthenticated', 'user', and 'logout' to your hook
  const { loginWithRedirect, isAuthenticated, user, logout } = useAuth0();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/70 backdrop-blur-md border-b border-slate-200'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img src={logo} alt="Feastly Logo" className="h-18 w-20" />
            <h1 className="ml-2 text-xl font-bold text-slate-500">
              FoodSquad
            </h1>
          </a>

          {/* 2. Logic to switch between Sign In and User Profile */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Shows your Google name */}
                <span className="text-sm font-bold text-slate-600">
                  {user?.given_name || user?.name}
                </span>
                {/* Shows your Google Profile Picture */}
                <img 
                  src={user?.picture} 
                  alt="profile" 
                  className="h-8 w-8 rounded-full border border-slate-200 shadow-sm"
                />
                <button 
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                  className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => loginWithRedirect()} 
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;