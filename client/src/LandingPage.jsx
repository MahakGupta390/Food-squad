import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  Store,
  UserPlus,
  Receipt,
  Zap,
  Users,
  Scale,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  Plus,
  Minus,
  Sparkles,
  ShieldCheck,
  UtensilsCrossed,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  Menu as MenuBarsIcon,
  X as CloseXIcon
} from 'lucide-react';
import './landing.css';
import { getUser } from './api.js';

/* ── Custom Brand Logo Glyph: Crossed Fork & Knife with Squad Dot on Gradient Tile ── */
const CrossedUtensilsGlyph = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Squad plate dot centered in top notch */}
    <circle cx="12" cy="4.4" r="1.3" fill="#FFFFFF" />

    <g stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round">
      {/* Knife: top-right to bottom-left */}
      <line x1="12" y1="13" x2="6.2" y2="19.4" strokeWidth="2.1" />
      <path d="M12 13 L16.8 7.8 C18 6.5 19.2 7.4 18.2 8.7 L13.6 13.8 Z" fill="#FFFFFF" strokeWidth="0.5" />

      {/* Fork: top-left to bottom-right */}
      <line x1="12" y1="13" x2="17.8" y2="19.4" strokeWidth="2.1" />
      <line x1="12" y1="13" x2="9.5" y2="10.2" strokeWidth="2.1" />
      {/* Fork 3 tines */}
      <line x1="6.5" y1="6.6" x2="8.5" y2="8.8" strokeWidth="1.6" />
      <line x1="8.0" y1="5.2" x2="9.8" y2="7.3" strokeWidth="1.6" />
      <line x1="9.5" y1="3.8" x2="11.3" y2="5.9" strokeWidth="1.6" />
      {/* Fork base bridge */}
      <line x1="7.4" y1="8" x2="10.7" y2="5.1" strokeWidth="1.6" />
    </g>
  </svg>
);

/* ── Format Currency in INR with tabular nums ── */
const formatINR = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');

/* ── Partner Restaurants for Marquee ── */
const PARTNER_RESTAURANTS = [
  {
    name: 'Barbeque Nation',
    specialty: 'Tandoor & Starters',
    logo: '/restaurants/bbq-nation.svg',
    accent: '#C53030'
  },
  {
    name: "Haldiram's Express",
    specialty: 'Street Chaat & Sweets',
    logo: '/restaurants/haldirams.svg',
    accent: '#FF6F00'
  },
  {
    name: 'Biryani Blues',
    specialty: 'Handi Dum Biryani',
    logo: '/restaurants/biryani-blues.svg',
    accent: '#1A365D'
  },
  {
    name: 'Pizza Hut',
    specialty: 'Pan Pizzas & Melts',
    logo: '/restaurants/pizza-hut.svg',
    accent: '#EE2726'
  },
  {
    name: 'Subway',
    specialty: 'Artisan Subs & Bowls',
    logo: '/restaurants/subway.svg',
    accent: '#028940'
  },
  {
    name: 'Burma Burma',
    specialty: 'Pan-Asian & Teas',
    logo: '/restaurants/burma-burma.svg',
    accent: '#115E59'
  }
];

/* ── Squad Members for Demos ── */
const SQUAD_MEMBERS = [
  { id: 'M', name: 'Mahak', color: '#E8520E', bg: '#FDF0EA' },
  { id: 'A', name: 'Aman', color: '#2563EB', bg: '#EFF6FF' },
  { id: 'R', name: 'Riya', color: '#2D8B55', bg: '#EBF7EE' },
  { id: 'K', name: 'Kabir', color: '#D4A017', bg: '#FEF9E7' },
  { id: 'S', name: 'Sneha', color: '#D63B6F', bg: '#FDF2F7' },
];

/* ── Default Live Cart Items ── */
const INITIAL_DEMO_CART = [
  { id: 'item-1', name: 'Paneer Tikka', price: 330, veg: true, eaters: ['M', 'R', 'K'] },
  { id: 'item-2', name: 'Chicken Seekh Kebab', price: 380, veg: false, eaters: ['A', 'S'] },
  { id: 'item-3', name: 'Dal Makhani', price: 300, veg: true, eaters: ['M', 'A', 'R', 'K', 'S'] },
  { id: 'item-4', name: 'Butter Naan ×5', price: 250, veg: true, eaters: ['M', 'A', 'R', 'K', 'S'] },
  { id: 'item-5', name: 'Gulab Jamun ×2', price: 240, veg: true, eaters: ['M', 'S'] },
];

/* ══════════════════════════════════════════
   SCROLL REVEAL OBSERVER HOOK
   ══════════════════════════════════════════ */
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      el.classList.add('visible');
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ══════════════════════════════════════════
   MAIN LANDING COMPONENT
   ══════════════════════════════════════════ */
export default function LandingPage({ onEnterApp }) {
  const currentUser = getUser();
  const [landingRoomCode, setLandingRoomCode] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = useCallback((id) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="landing-page">
      {/* ── NAVBAR ── */}
      <nav className={`lp-navbar ${scrolled ? 'scrolled' : ''}`} id="lp-top">
        <div className="lp-nav-inner">
          <a
            className="lp-nav-brand"
            href="#lp-top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="lp-nav-logo">
              <CrossedUtensilsGlyph />
            </div>
            <span className="lp-nav-brand-name">
              Food<span className="lp-brand-accent">Squad</span>
            </span>
          </a>

          <ul className="lp-nav-links">
            <li>
              <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>
                How it works
              </a>
            </li>
            <li>
              <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>
                Features
              </a>
            </li>
            <li>
              <a href="#use-cases" onClick={(e) => { e.preventDefault(); scrollToSection('use-cases'); }}>
                Use cases
              </a>
            </li>
          </ul>

          <div className="lp-nav-actions">
            {currentUser ? (
              <button className="lp-btn-primary" onClick={() => onEnterApp('dashboard')}>
                <span>{currentUser.name} (Dashboard)</span>
                <ArrowRight size={15} strokeWidth={2} />
              </button>
            ) : (
              <button className="lp-btn-primary" onClick={() => onEnterApp('signin')}>
                <span>Sign In</span>
                <ArrowRight size={15} strokeWidth={2} />
              </button>
            )}
            <button
              className="lp-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <CloseXIcon size={20} strokeWidth={2} /> : <MenuBarsIcon size={20} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="lp-mobile-drawer-backdrop"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="lp-mobile-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lp-drawer-header">
              <div className="lp-nav-brand">
                <div className="lp-nav-logo">
                  <CrossedUtensilsGlyph />
                </div>
                <span className="lp-nav-brand-name">
                  Food<span className="lp-brand-accent">Squad</span>
                </span>
              </div>
              <button
                className="lp-drawer-close"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <CloseXIcon size={20} strokeWidth={2} />
              </button>
            </div>
            <nav className="lp-drawer-nav">
              <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>
                How it works
              </a>
              <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>
                Features
              </a>
              <a href="#use-cases" onClick={(e) => { e.preventDefault(); scrollToSection('use-cases'); }}>
                Use cases
              </a>
            </nav>
            <div className="lp-drawer-actions">
              <button
                className="lp-btn-primary"
                style={{ width: '100%' }}
                onClick={() => onEnterApp(currentUser ? 'dashboard' : 'signin')}
              >
                <span>{currentUser ? `${currentUser.name} (Dashboard)` : 'Sign In'}</span>
                <ArrowRight size={15} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-hero-content">
            <h1 className="lp-animate-hero-title">
              <span className="lp-hero-word">Eat </span>
              <span className="lp-hero-word">Together, </span>
              <br />
              <span className="lp-hero-word lp-gradient-text">Pay Fair.</span>
            </h1>

            <p className="lp-hero-subtitle lp-animate-hero-sub">
              Pick a restaurant with your squad, everyone adds their cravings, and the bill splits itself — down to the last naan.
            </p>

            <div className="lp-hero-ctas lp-animate-hero-ctas" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <button className="lp-btn-hero" onClick={() => onEnterApp(currentUser ? 'restaurants' : 'start')}>
                  <span>{currentUser ? 'Start a squad' : 'Launch FoodSquad'}</span>
                  <ArrowRight size={18} strokeWidth={2.2} className="lp-btn-arrow" />
                </button>
              </div>

              {/* Quick Join Room Input on Landing Page */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (landingRoomCode.trim()) onEnterApp('join', landingRoomCode.trim());
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  padding: '5px 8px 5px 14px',
                  borderRadius: '999px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                  maxWidth: 380,
                  width: '100%',
                  border: '1px solid #E5E7EB'
                }}
              >
                <Users size={16} color="#D9480F" />
                <input
                  type="text"
                  placeholder="Have an invite code? (e.g. BBQ-4821)"
                  value={landingRoomCode}
                  onChange={(e) => setLandingRoomCode(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    flex: 1,
                    color: '#12161A'
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-sm btn-primary"
                  style={{ borderRadius: '999px', padding: '4px 14px', fontSize: '0.78rem' }}
                  disabled={!landingRoomCode.trim()}
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          <div className="lp-hero-visual lp-animate-hero-img">
            <div className="lp-hero-img-wrap">
              <img
                src="/hero-flatlay.jpg"
                alt="Friends sharing a sunlit table feast with pizza, paneer tikka, and drinks at golden hour"
                loading="eager"
              />
            </div>

            {/* Overlapping Floating UI Chips */}
            <div className="lp-hero-chip lp-chip-1 lp-animate-chip-1" aria-hidden="true">
              <div className="lp-chip-avatar">A</div>
              <div className="lp-chip-info">
                <span className="lp-chip-sub">Just added</span>
                <span className="lp-chip-main">Paneer Tikka · ₹330</span>
              </div>
            </div>

            <div className="lp-hero-chip lp-chip-2 lp-animate-chip-2" aria-hidden="true">
              <div className="lp-chip-avatar chip-avatar-riya">R</div>
              <div className="lp-chip-info">
                <span className="lp-chip-sub">Riya's share</span>
                <span className="lp-chip-amount">₹220</span>
              </div>
            </div>

            <div className="lp-hero-chip lp-chip-3 lp-animate-chip-3" aria-hidden="true">
              <span className="lp-live-pulse-dot" />
              <span className="lp-chip-live-text">Live Squad Room</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. RESTAURANT STRIP ── */}
      <RestaurantStrip />

      {/* ── 2. THREE STEPS (Dynamic connector, mini visuals, offset heights) ── */}
      <HowItWorks />

      {/* ── 4. LIVE PRODUCT PREVIEW (Interactive, real-time math, window frame) ── */}
      <LivePreview />

      {/* ── 3. FEATURES (Bento layout, mini demos) ── */}
      <FeaturesBentoSection />

      {/* ── USE CASES ── */}
      <UseCases />

      {/* ── FINAL CTA BAND ── */}
      <section className="lp-cta-band">
        <div className="lp-cta-band-inner">
          <span className="lp-cta-pill">Zero Spreadsheets · Zero Friction</span>
          <h2>Ready to feast together?</h2>
          <p>Start a squad order in under 30 seconds. Share a room link and let everyone add their cravings.</p>
          <button className="lp-btn-cta-white" onClick={onEnterApp}>
            Launch FoodSquad <ArrowRight size={18} strokeWidth={2.2} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}

/* ══════════════════════════════════════════
   5. RESTAURANT STRIP
   Uniform circular thumbnails, grayscale to color, verified partner label
   ══════════════════════════════════════════ */
function RestaurantStrip() {
  const doubled = [...PARTNER_RESTAURANTS, ...PARTNER_RESTAURANTS];

  return (
    <section className="lp-restaurant-strip" id="restaurant-strip">
      <div className="lp-strip-header">
        <span className="lp-strip-badge">Direct Menu Integration</span>
        <h3 className="lp-strip-title">Partner restaurants available now</h3>
      </div>

      <div className="lp-marquee-container">
        <div className="lp-marquee-track">
          {doubled.map((r, i) => (
            <div className="lp-restaurant-pill" key={`${r.name}-${i}`}>
              <div className="lp-restaurant-thumb-wrap">
                <img
                  src={r.logo}
                  alt={r.name}
                  className="lp-restaurant-thumb"
                  loading="lazy"
                />
              </div>
              <div className="lp-restaurant-pill-details">
                <span className="lp-restaurant-pill-name">{r.name}</span>
                <span className="lp-restaurant-pill-spec">{r.specialty}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   2. THREE STEPS SECTION
   Aligned cards, quiet header icons, interactive mini visuals, unified canonical data
   ══════════════════════════════════════════ */
function HowItWorks() {
  const sectionRef = useRef(null);
  const [activeStep, setActiveStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [step2Copied, setStep2Copied] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;

      // Calculate progress through this section (0 to 1)
      const start = windowH * 0.8;
      const end = -rect.height * 0.4;
      const total = start - end;
      const current = start - rect.top;
      const ratio = Math.min(Math.max(current / total, 0), 1);
      setProgress(ratio);

      if (ratio > 0.65) {
        setActiveStep(3);
      } else if (ratio > 0.28) {
        setActiveStep(2);
      } else {
        setActiveStep(1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animate copy state when Step 2 activates
  useEffect(() => {
    if (activeStep >= 2) {
      const timer = setTimeout(() => setStep2Copied(true), 450);
      return () => clearTimeout(timer);
    } else {
      setStep2Copied(false);
    }
  }, [activeStep]);

  return (
    <section className="lp-how-it-works" id="how-it-works" ref={sectionRef}>
      <div className="lp-section-container">
        <div className="lp-section-header">
          <span className="lp-pill-eyebrow">The Simple Flow</span>
          <h2>
            Three steps to a <span className="lp-gradient-text">perfect split</span>
          </h2>
          <p>No spreadsheets, no awkward calculations, no "who had the extra naan" debates.</p>
        </div>

        {/* Dynamic Connector Bar */}
        <div className="lp-steps-connector-bar">
          <div
            className="lp-connector-fill"
            style={{ width: `${Math.max(12, progress * 100)}%` }}
          />
        </div>

        <div className="lp-steps-grid">
          {/* STEP 1: Choose a spot */}
          <article className={`lp-step-card ${activeStep >= 1 ? 'step-active' : ''}`}>
            <div className="lp-step-card-top">
              <span className={`lp-step-badge ${activeStep >= 1 ? 'badge-filled' : ''}`}>01</span>
              <div className="lp-icon-tile-quiet">
                <Store size={18} strokeWidth={1.75} />
              </div>
            </div>

            <div className="lp-step-body">
              <h3>Choose a spot</h3>
              <p>Browse partner menus with verified prices and live dish availability.</p>
            </div>

            {/* Mini visual: Restaurant cards with Barbeque Nation selected */}
            <div className="lp-step-mini-visual step-visual-restaurants">
              <div className="lp-mini-chip chip-selected">
                <img src="/restaurants/bbq-nation.svg" alt="Barbeque Nation" className="lp-mini-chip-img" />
                <span className="lp-mini-chip-text">Barbeque Nation</span>
                <span className="lp-mini-tag tag-selected">Tandoor</span>
                <span className="lp-chip-check">
                  <Check size={11} strokeWidth={2.8} />
                </span>
              </div>
              <div className="lp-mini-chip">
                <img src="/restaurants/pizza-hut.svg" alt="Pizza Hut" className="lp-mini-chip-img" />
                <span className="lp-mini-chip-text">Pizza Hut</span>
                <span className="lp-mini-tag">Pan Pizzas</span>
              </div>
              <div className="lp-mini-chip">
                <img src="/restaurants/subway.svg" alt="Subway" className="lp-mini-chip-img" />
                <span className="lp-mini-chip-text">Subway</span>
                <span className="lp-mini-tag">Fresh Subs</span>
              </div>
            </div>
          </article>

          {/* STEP 2: Invite squad */}
          <article className={`lp-step-card ${activeStep >= 2 ? 'step-active' : ''}`}>
            <div className="lp-step-card-top">
              <span className={`lp-step-badge ${activeStep >= 2 ? 'badge-filled' : ''}`}>02</span>
              <div className="lp-icon-tile-quiet">
                <UserPlus size={18} strokeWidth={1.75} />
              </div>
            </div>

            <div className="lp-step-body">
              <h3>Invite your squad</h3>
              <p>Share a single link. Friends join instantly to add cravings in real time.</p>
            </div>

            {/* Mini visual: Avatars + Link with Animated Copied tag */}
            <div className="lp-step-mini-visual step-visual-squad">
              <div className="lp-avatar-stack">
                {SQUAD_MEMBERS.map((m, idx) => (
                  <div
                    key={m.id}
                    className="lp-avatar-circle"
                    style={{
                      backgroundColor: m.bg,
                      color: m.color,
                      borderColor: '#FFFFFF',
                      zIndex: 6 - idx
                    }}
                    title={m.name}
                  >
                    {m.id}
                  </div>
                ))}
                <div className="lp-avatar-circle lp-av-more" title="More friends can join">
                  +2
                </div>
              </div>
              <div className="lp-copy-pill">
                <span className="lp-copy-url">foodsquad.app/room/bbq-4821</span>
                <span className={`lp-copied-tag ${step2Copied ? 'copied-active' : ''}`}>
                  {step2Copied ? (
                    <>
                      <Check size={11} strokeWidth={2.6} /> Copied
                    </>
                  ) : (
                    'Copy link'
                  )}
                </span>
              </div>
            </div>
          </article>

          {/* STEP 3: Split and settle */}
          <article className={`lp-step-card ${activeStep >= 3 ? 'step-active' : ''}`}>
            <div className="lp-step-card-top">
              <span className={`lp-step-badge ${activeStep >= 3 ? 'badge-filled' : ''}`}>03</span>
              <div className="lp-icon-tile-quiet">
                <Receipt size={18} strokeWidth={1.75} />
              </div>
            </div>

            <div className="lp-step-body">
              <h3>Split and settle</h3>
              <p>The invoice automatically calculates each friend's share down to the rupee.</p>
            </div>

            {/* Mini visual: Proportional split bar matching canonical ₹1,500 dataset */}
            <div className="lp-step-mini-visual step-visual-split">
              {/* Legend with colored dots, names, and amounts */}
              <div className="lp-split-bar-legend">
                <span className="lp-split-legend-item">
                  <span className="lp-leg-dot" style={{ backgroundColor: '#E8520E' }} />
                  Mahak ₹340
                </span>
                <span className="lp-split-legend-item">
                  <span className="lp-leg-dot" style={{ backgroundColor: '#2563EB' }} />
                  Aman ₹300
                </span>
                <span className="lp-split-legend-item">
                  <span className="lp-leg-dot" style={{ backgroundColor: '#2D8B55' }} />
                  Riya ₹220
                </span>
                <span className="lp-split-legend-item">
                  <span className="lp-leg-dot" style={{ backgroundColor: '#D4A017' }} />
                  Kabir ₹220
                </span>
                <span className="lp-split-legend-item">
                  <span className="lp-leg-dot" style={{ backgroundColor: '#D63B6F' }} />
                  Sneha ₹420
                </span>
              </div>

              {/* Proportional Segmented Bar */}
              <div className="lp-mini-split-bar">
                <div style={{ width: '22.7%', backgroundColor: '#E8520E' }} title="Mahak: ₹340 (22.7%)" />
                <div style={{ width: '20.0%', backgroundColor: '#2563EB' }} title="Aman: ₹300 (20.0%)" />
                <div style={{ width: '14.7%', backgroundColor: '#2D8B55' }} title="Riya: ₹220 (14.7%)" />
                <div style={{ width: '14.7%', backgroundColor: '#D4A017' }} title="Kabir: ₹220 (14.7%)" />
                <div style={{ width: '27.9%', backgroundColor: '#D63B6F' }} title="Sneha: ₹420 (28.0%)" />
              </div>

              {/* Exact Total and Verification Tag */}
              <div className="lp-mini-split-footer">
                <span>Total Invoice: <strong>₹1,500</strong></span>
                <span className="lp-split-verified">5 shares balanced ✓</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   4. LIVE CART AND SPLIT SECTION
   Interactive, window frame, live pulsing dot, exact math, flashing updates
   ══════════════════════════════════════════ */
function LivePreview() {
  const [cart, setCart] = useState(INITIAL_DEMO_CART);
  const [flashRowId, setFlashRowId] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Exact math: Compute per-member split
  const { memberTotals, totalCartAmount } = useMemo(() => {
    const totals = { M: 0, A: 0, R: 0, K: 0, S: 0 };
    let grandTotal = 0;

    cart.forEach((item) => {
      grandTotal += item.price;
      const count = item.eaters.length;
      if (count > 0) {
        const perPerson = item.price / count;
        item.eaters.forEach((memberId) => {
          if (totals[memberId] !== undefined) {
            totals[memberId] += perPerson;
          }
        });
      }
    });

    return {
      memberTotals: totals,
      totalCartAmount: grandTotal
    };
  }, [cart]);

  // Toggle member participation on a cart item
  const handleToggleEater = (itemId, memberId) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const exists = item.eaters.includes(memberId);
        // Ensure at least one eater remains
        if (exists && item.eaters.length === 1) return item;
        const newEaters = exists
          ? item.eaters.filter((id) => id !== memberId)
          : [...item.eaters, memberId];
        return { ...item, eaters: newEaters };
      })
    );

    // Flash the row to signal real-time recalculation
    setFlashRowId(itemId);
    setTimeout(() => setFlashRowId(null), 600);
  };

  const handleCopy = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <section className="lp-live-preview" id="live-preview">
      <div className="lp-section-container">
        <div className="lp-section-header">
          <span className="lp-pill-eyebrow">Interactive Simulation</span>
          <h2>
            See the <span className="lp-gradient-text">live split</span> in action
          </h2>
          <p>
            Tap any friend's avatar below to see the split recalculate in real time down to the rupee.
          </p>
        </div>

        {/* Product Window Mockup with subtle perspective */}
        <div className="lp-product-window">
          {/* Window Chrome / Bar */}
          <div className="lp-window-bar">
            <div className="lp-window-controls">
              <span className="lp-dot-red" />
              <span className="lp-dot-yellow" />
              <span className="lp-dot-green" />
            </div>

            <div className="lp-window-url-box" onClick={handleCopy} title="Click to copy link">
              <span className="lp-url-prefix">https://</span>
              <span className="lp-url-path">foodsquad.app/room/bbq-4821</span>
              <span className="lp-url-copy-badge">
                {copiedLink ? <Check size={11} strokeWidth={2.5} /> : <Copy size={11} strokeWidth={2} />}
                {copiedLink ? 'Copied' : 'Share'}
              </span>
            </div>

            <div className="lp-window-status">
              <span className="lp-live-pulse-dot" />
              <span className="lp-window-live-label">5 Squad Members Online</span>
            </div>
          </div>

          {/* Window Content: 2-Column Split Interface */}
          <div className="lp-window-content">
            {/* Left: Group Cart */}
            <div className="lp-window-cart">
              <div className="lp-window-col-header">
                <div className="lp-cart-title-wrap">
                  <div className="lp-icon-tile-sm lp-icon-peach">
                    <UtensilsCrossed size={16} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h4>Shared Squad Cart</h4>
                    <span className="lp-col-subtitle">Barbeque Nation · Order #BBQ-4821</span>
                  </div>
                </div>
                <span className="lp-item-count-badge">{cart.length} items</span>
              </div>

              <div className="lp-interactive-tip">
                <span>💡 Tap any initial to toggle who is sharing an item</span>
              </div>

              <div className="lp-cart-items-list">
                {cart.map((item) => {
                  const isFlashing = flashRowId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`lp-cart-item-row ${isFlashing ? 'row-warm-flash' : ''}`}
                    >
                      <div className="lp-cart-item-left">
                        <span className={`lp-veg-indicator ${item.veg ? 'veg' : 'non-veg'}`} />
                        <div>
                          <span className="lp-item-name">{item.name}</span>
                          <span className="lp-per-eater-note">
                            ({item.eaters.length} sharing · ~{formatINR(item.price / item.eaters.length)} ea)
                          </span>
                        </div>
                      </div>

                      <div className="lp-cart-item-right">
                        {/* Member avatar toggles */}
                        <div className="lp-eater-toggles">
                          {SQUAD_MEMBERS.map((m) => {
                            const isIncluded = item.eaters.includes(m.id);
                            return (
                              <button
                                key={m.id}
                                className={`lp-eater-btn ${isIncluded ? 'active' : 'inactive'}`}
                                style={{
                                  backgroundColor: isIncluded ? m.color : '#F3ECE3',
                                  color: isIncluded ? '#FFFFFF' : '#8B7B6E'
                                }}
                                onClick={() => handleToggleEater(item.id, m.id)}
                                title={`${m.name}: ${isIncluded ? 'Included in this item' : 'Not sharing'}`}
                                aria-label={`Toggle ${m.name} for ${item.name}`}
                              >
                                {m.id}
                              </button>
                            );
                          })}
                        </div>

                        {/* Price with tabular numerals */}
                        <span className="lp-item-price tabular-nums">
                          {formatINR(item.price)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Real-time Split Breakdown */}
            <div className="lp-window-split">
              <div className="lp-window-col-header">
                <div className="lp-cart-title-wrap">
                  <div className="lp-icon-tile-sm lp-icon-green">
                    <Scale size={16} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h4>Dynamic Settlement</h4>
                    <span className="lp-col-subtitle">Auto-balanced down to the ₹1</span>
                  </div>
                </div>
                <span className="lp-settle-badge">Real-time</span>
              </div>

              <div className="lp-split-members-list">
                {SQUAD_MEMBERS.map((m) => {
                  const share = memberTotals[m.id] || 0;
                  const pct = totalCartAmount > 0 ? Math.round((share / totalCartAmount) * 100) : 0;
                  return (
                    <div className="lp-split-member-row" key={m.id}>
                      <div className="lp-split-member-info">
                        <div
                          className="lp-split-avatar"
                          style={{ backgroundColor: m.bg, color: m.color }}
                        >
                          {m.id}
                        </div>
                        <div>
                          <span className="lp-split-name">{m.name}</span>
                          <div className="lp-split-bar-track">
                            <div
                              className="lp-split-bar-fill"
                              style={{ width: `${pct}%`, backgroundColor: m.color }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="lp-split-member-amount">
                        <span className="lp-split-amount tabular-nums">
                          {formatINR(share)}
                        </span>
                        <span className="lp-split-pct tabular-nums">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Verified Invoice Total matching exact cart sum */}
              <div className="lp-invoice-summary">
                <div className="lp-invoice-row">
                  <span>Cart Subtotal</span>
                  <span className="tabular-nums">{formatINR(totalCartAmount)}</span>
                </div>
                <div className="lp-invoice-row lp-invoice-tax">
                  <span>Delivery & GST (5%)</span>
                  <span className="lp-tax-free-tag">Squad Promo · Waived</span>
                </div>
                <div className="lp-invoice-total">
                  <div>
                    <span className="lp-total-label">Total Invoice</span>
                    <span className="lp-total-sub">Sum of all individual shares</span>
                  </div>
                  <span className="lp-total-amount tabular-nums">
                    {formatINR(totalCartAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   3. FEATURES SECTION — BENTO LAYOUT
   1 Large card (Real-time auto-playing sync) + 2 smaller cards with working interactive demos
   ══════════════════════════════════════════ */
const BENTO_FEED_SEQUENCE = [
  { id: 'bf-1', memberId: 'A', user: 'Aman', item: 'Chicken Seekh Kebab', price: 380 },
  { id: 'bf-2', memberId: 'R', user: 'Riya', item: 'Paneer Tikka', price: 330 },
  { id: 'bf-3', memberId: 'K', user: 'Kabir', item: 'Butter Naan ×5', price: 250 },
  { id: 'bf-4', memberId: 'S', user: 'Sneha', item: 'Gulab Jamun ×2', price: 240 },
  { id: 'bf-5', memberId: 'M', user: 'Mahak', item: 'Dal Makhani', price: 300 },
];

function FeaturesBentoSection() {
  const [soloMode, setSoloMode] = useState(false);
  const [feedIndex, setFeedIndex] = useState(2);
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Initial feed with 3 items so the card is cleanly populated on load
  const [bentoFeed, setBentoFeed] = useState([
    { ...BENTO_FEED_SEQUENCE[2], time: 'Just now' },
    { ...BENTO_FEED_SEQUENCE[1], time: '14s ago' },
    { ...BENTO_FEED_SEQUENCE[0], time: '38s ago' },
  ]);

  // Pause stream when section is off-screen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Auto-play stream every 2.8s: new item slides in, total updates, loops through cast
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !isVisible || isPaused) return;

    const interval = setInterval(() => {
      setFeedIndex((prevIdx) => {
        const nextIdx = (prevIdx + 1) % BENTO_FEED_SEQUENCE.length;
        const nextItem = {
          ...BENTO_FEED_SEQUENCE[nextIdx],
          id: `${BENTO_FEED_SEQUENCE[nextIdx].id}-${Date.now()}`,
          time: 'Just now'
        };

        setBentoFeed((prevFeed) => {
          const updatedOld = prevFeed.slice(0, 2).map((item, i) => ({
            ...item,
            time: i === 0 ? '9s ago' : '26s ago'
          }));
          return [nextItem, ...updatedOld];
        });

        return nextIdx;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [isVisible, isPaused]);

  // Resolve member color and background from canonical cast
  const getMemberMeta = (memberId) => {
    return SQUAD_MEMBERS.find((m) => m.id === memberId) || SQUAD_MEMBERS[0];
  };

  return (
    <section className="lp-features" id="features" ref={sectionRef}>
      <div className="lp-section-container">
        <div className="lp-section-header">
          <span className="lp-pill-eyebrow">Why FoodSquad</span>
          <h2>
            Built for <span className="lp-gradient-text">real squads</span>
          </h2>
          <p>Every interaction exists because group ordering without it is chaotic.</p>
        </div>

        {/* Bento Grid: 1 Big Card + 2 Smaller Cards */}
        <div className="lp-bento-grid">
          {/* BIG CARD: Real-time multiplayer sync with auto-play activity stream */}
          <article
            className="lp-bento-card lp-bento-large"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="lp-bento-top">
              <div className="lp-icon-tile lp-icon-green">
                <Zap size={20} strokeWidth={1.75} />
              </div>
              <span className="lp-bento-badge bento-badge-live">
                <span className="lp-live-pulse-dot" /> Live Multiplayer
              </span>
            </div>

            <div className="lp-bento-content">
              <h3>Real-time sync</h3>
              <p>Every cart update, eater choice, and preference syncs across all devices instantly with zero lag.</p>
            </div>

            {/* Auto-playing activity stream fills card space directly without empty gap */}
            <div className="lp-bento-mini-demo demo-realtime">
              <div className="lp-demo-feed-header">
                <span className="lp-feed-header-left">
                  <span className="lp-live-pulse-dot" /> Squad Activity Stream
                </span>
                <span className="lp-feed-sync-tag">Auto-syncing</span>
              </div>

              <div className="lp-demo-feed-list">
                {bentoFeed.map((f) => {
                  const member = getMemberMeta(f.memberId);
                  return (
                    <div className="lp-demo-feed-item slide-in-top" key={f.id}>
                      <div
                        className="lp-feed-avatar"
                        style={{ backgroundColor: member.bg, color: member.color }}
                      >
                        {member.id}
                      </div>
                      <div className="lp-feed-info">
                        <span className="lp-feed-title">
                          <strong>{f.user}</strong> added {f.item}
                        </span>
                        <span className="lp-feed-time">{f.time}</span>
                      </div>
                      <span className="lp-feed-price tabular-nums">+{formatINR(f.price)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Running live cart summary footer to fill card height naturally */}
              <div className="lp-demo-feed-footer">
                <span className="lp-feed-foot-label">Live Cart · 5 items</span>
                <span className="lp-feed-foot-total tabular-nums">Total: {formatINR(1500)}</span>
              </div>
            </div>
          </article>

          {/* SMALL CARD 1: Solo or Social with working interactive toggle */}
          <article className="lp-bento-card lp-bento-small">
            <div className="lp-bento-top">
              <div className="lp-icon-tile lp-icon-peach">
                <Users size={20} strokeWidth={1.75} />
              </div>
              {/* Working interactive toggle switch */}
              <div
                className="lp-mode-toggle"
                role="group"
                aria-label="Toggle between Squad and Just Me mode"
              >
                <button
                  type="button"
                  className={`lp-toggle-pill ${!soloMode ? 'selected' : ''}`}
                  onClick={() => setSoloMode(false)}
                >
                  Squad
                </button>
                <button
                  type="button"
                  className={`lp-toggle-pill ${soloMode ? 'selected' : ''}`}
                  onClick={() => setSoloMode(true)}
                >
                  Just Me
                </button>
              </div>
            </div>

            <div className="lp-bento-content">
              <h3>Solo or social</h3>
              <p>Order alone in quiet focus or rally the whole crew with one shareable link.</p>
            </div>

            {/* Mini visual reflecting current mode */}
            <div className="lp-bento-mini-demo demo-mode">
              {!soloMode ? (
                <div className="lp-mode-state state-squad">
                  <div className="lp-mode-avatar-group">
                    {SQUAD_MEMBERS.map((m, idx) => (
                      <span
                        key={m.id}
                        className="lp-bento-av"
                        style={{
                          backgroundColor: m.bg,
                          color: m.color,
                          zIndex: 6 - idx
                        }}
                        title={m.name}
                      >
                        {m.id}
                      </span>
                    ))}
                  </div>
                  <div className="lp-mode-text-wrap">
                    <span className="lp-mode-label">5 people collaborating</span>
                    <span className="lp-mode-sub">Shared group cart & split enabled</span>
                  </div>
                </div>
              ) : (
                <div className="lp-mode-state state-solo">
                  <div className="lp-mode-avatar-group">
                    <span
                      className="lp-bento-av solo-av"
                      style={{
                        backgroundColor: '#FDF0EA',
                        color: '#E8520E'
                      }}
                      title="Mahak (Solo)"
                    >
                      M
                    </span>
                  </div>
                  <div className="lp-mode-text-wrap">
                    <span className="lp-mode-label">Ordering solo · 1 person</span>
                    <span className="lp-mode-sub">Direct individual checkout · No split</span>
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* SMALL CARD 2: Perfectly Divided with dynamic visual & concrete legend */}
          <article className="lp-bento-card lp-bento-small">
            <div className="lp-bento-top">
              <div className="lp-icon-tile lp-icon-mustard">
                <Scale size={20} strokeWidth={1.75} />
              </div>
              <span className="lp-bento-badge bento-badge-math">Auto-Split</span>
            </div>

            <div className="lp-bento-content">
              <h3>Perfectly divided</h3>
              <p>Pay only for what you ate; shared starters split proportionally to the rupee.</p>
            </div>

            {/* Segmented ratio bar demo with canonical palette and concrete breakdown */}
            <div className="lp-bento-mini-demo demo-divided">
              <div className="lp-ratio-bar">
                <div style={{ width: '22.7%', background: '#E8520E' }} title="Mahak: ₹340 (22.7%)" />
                <div style={{ width: '20.0%', background: '#2563EB' }} title="Aman: ₹300 (20.0%)" />
                <div style={{ width: '14.7%', background: '#2D8B55' }} title="Riya: ₹220 (14.7%)" />
                <div style={{ width: '14.7%', background: '#D4A017' }} title="Kabir: ₹220 (14.7%)" />
                <div style={{ width: '27.9%', background: '#D63B6F' }} title="Sneha: ₹420 (28.0%)" />
              </div>

              {/* Concrete person legend matching avatar colors */}
              <div className="lp-bento-split-legend">
                <span className="lp-bento-leg-item">
                  <span className="lp-leg-dot" style={{ backgroundColor: '#E8520E' }} />
                  Mahak ₹340
                </span>
                <span className="lp-bento-leg-item">
                  <span className="lp-leg-dot" style={{ backgroundColor: '#2563EB' }} />
                  Aman ₹300
                </span>
                <span className="lp-bento-leg-item">
                  <span className="lp-leg-dot" style={{ backgroundColor: '#2D8B55' }} />
                  Riya ₹220
                </span>
                <span className="lp-bento-leg-item">
                  <span className="lp-leg-dot" style={{ backgroundColor: '#D4A017' }} />
                  Kabir ₹220
                </span>
                <span className="lp-bento-leg-item">
                  <span className="lp-leg-dot" style={{ backgroundColor: '#D63B6F' }} />
                  Sneha ₹420
                </span>
              </div>

              <div className="lp-ratio-meta">
                <span>Shared starters split 5 ways · Fair equity</span>
                <span className="lp-ratio-verified">Auto-balanced ✓</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   USE CASES SECTION
   ══════════════════════════════════════════ */
function UseCases() {
  const ref = useScrollReveal();
  return (
    <section className="lp-use-cases" id="use-cases" ref={ref}>
      <div className="lp-section-container lp-reveal visible">
        <div className="lp-section-header">
          <span className="lp-pill-eyebrow">Real Life Scenarios</span>
          <h2>
            For every <span className="lp-gradient-text">kind of crew</span>
          </h2>
          <p>Whether it's five or fifteen, FoodSquad handles the coordination.</p>
        </div>

        <div className="lp-use-cases-grid">
          <article className="lp-use-case-card">
            <div className="lp-icon-tile lp-icon-peach">
              <Store size={20} strokeWidth={1.75} />
            </div>
            <h3>Office lunch</h3>
            <p>The team lead picks a spot, everyone adds their preferences, and nobody has to collect UPI screenshots.</p>
            <span className="lp-use-case-tag">Popular for 5–20 colleagues</span>
          </article>

          <article className="lp-use-case-card">
            <div className="lp-icon-tile lp-icon-peach">
              <Receipt size={20} strokeWidth={1.75} />
            </div>
            <h3>Roommates</h3>
            <p>Weekly dinner rotation sorted. An automated running ledger tracks who paid without awkward reminders.</p>
            <span className="lp-use-case-tag">Built-in ledger tracking</span>
          </article>

          <article className="lp-use-case-card">
            <div className="lp-icon-tile lp-icon-peach">
              <Sparkles size={20} strokeWidth={1.75} />
            </div>
            <h3>Friday night feasts</h3>
            <p>Paneer starters and tandoori kebabs in the same order. Everyone pays for what they actually ate.</p>
            <span className="lp-use-case-tag">Mixed dietary profiles</span>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   FOOTER
   ══════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-inner">
        <div className="lp-footer-brand-col">
          <div className="lp-footer-brand">
            <div className="lp-footer-brand-icon">
              <CrossedUtensilsGlyph />
            </div>
            <span className="lp-footer-brand-name">
              Food<span className="lp-brand-accent">Squad</span>
            </span>
          </div>
          <p className="lp-footer-desc">
            Collaborative group food ordering with dynamic per-eater bill splitting, diet-aware matching, and zero-spreadsheet squad settlements.
          </p>
          <div className="lp-footer-built-note">
            <span>Built for genuine squad feasts · 2026</span>
          </div>
        </div>

        <div>
          <h4>Product</h4>
          <ul className="lp-footer-links">
            <li><a href="#how-it-works">How it works</a></li>
            <li><a href="#live-preview">Live Cart</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#use-cases">Use cases</a></li>
          </ul>
        </div>

        <div>
          <h4>Partner</h4>
          <ul className="lp-footer-links">
            <li><a href="#restaurants">Restaurants</a></li>
            <li><a href="#integration">Direct Integration</a></li>
            <li><a href="#api">Multiplayer API</a></li>
          </ul>
        </div>

        <div>
          <h4>Trust & Privacy</h4>
          <ul className="lp-footer-links">
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms of Service</a></li>
            <li><a href="#security">Zero Data Selling</a></li>
          </ul>
        </div>
      </div>

      <div className="lp-footer-bottom">
        <span>© 2026 FoodSquad. All rights reserved.</span>
        <div className="lp-footer-socials">
          <a href="#github" className="lp-footer-social-link" aria-label="GitHub">GitHub</a>
          <span className="lp-footer-dot">·</span>
          <a href="#twitter" className="lp-footer-social-link" aria-label="Twitter">Twitter / X</a>
          <span className="lp-footer-dot">·</span>
          <a href="#status" className="lp-footer-social-link" aria-label="System Status">Status: Operational</a>
        </div>
      </div>
    </footer>
  );
}
