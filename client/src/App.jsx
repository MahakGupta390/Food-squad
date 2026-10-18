import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  LayoutDashboard,
  Store,
  Users,
  Sparkles,
  ShoppingCart,
  Receipt,
  Copy,
  Check,
  Plus,
  Minus,
  Star,
  Clock,
  ArrowRight,
  Printer,
  Share2,
  CheckCircle2,
  Search,
  ChevronRight,
  Menu as MenuIcon,
  X as CloseIcon
} from 'lucide-react';

const formatINR = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');

const api = (path, body) =>
  fetch('/api' + path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : undefined)
    .then((r) => r.json())
    .catch((err) => {
      console.error('API Error:', err);
      return null;
    });

const DIETARY_OPTIONS = ['Veg', 'Non-veg', 'Vegan', 'Jain', 'Egg-free', 'Gluten-free', 'Nut allergy'];
const MOOD_OPTIONS = ['Spicy', 'Comfort Food', 'Light', 'Sweet', 'High Protein'];
const CUISINE_FILTERS = ['All', 'Pure Veg', 'North Indian', 'Biryani', 'Pizza', 'Healthy'];

export default function App() {
  const [view, setView] = useState('dash');
  const [state, setState] = useState(null);
  const [flash, setFlash] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const act = useCallback((p, b) => {
    return api(p, b).then((data) => {
      if (data) setState(data);
      return data;
    });
  }, []);

  const notify = (msg) => {
    setFlash(msg);
    setTimeout(() => setFlash(''), 2200);
  };

  useEffect(() => {
    api('/state').then((data) => {
      if (data) setState(data);
    });
    const timer = setInterval(() => {
      api('/state').then((data) => {
        if (data) setState(data);
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const navigateTo = (newView) => {
    setView(newView);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!state) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-page)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
            FoodSquad
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>Loading squad order state…</p>
        </div>
      </div>
    );
  }

  const { restaurants, currentRestaurant, members, menu, cart, calc, dashboard } = state;
  const currentUser = members[0];
  const cartItemCount = cart.reduce((a, c) => a + c.qty, 0);

  const navItems = [
    { id: 'dash', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'restaurants', label: 'Restaurants', icon: Store, count: restaurants.length },
    { id: 'room', label: '1. Squad Room', icon: Users },
    { id: 'agent', label: '2. AI Matching', icon: Sparkles },
    { id: 'cart', label: '3. Group Cart', icon: ShoppingCart, count: cartItemCount },
    { id: 'settle', label: '4. Bill Settlement', icon: Receipt }
  ];

  return (
    <div className="app-shell">
      {/* Toast Notification */}
      {flash && (
        <div className="toast-notice" role="status" aria-live="polite">
          <Check size={16} />
          <span>{flash}</span>
        </div>
      )}

      {/* Mobile Top Bar */}
      <header className="mobile-top-bar" aria-label="Mobile Header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="brand-icon" style={{ width: 28, height: 28, fontSize: '0.85rem' }}>FS</div>
          <span className="brand-title" style={{ fontSize: '1.1rem' }}>FoodSquad</span>
        </div>
        <button
          className="mobile-hamburger-btn"
          aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`mobile-drawer-backdrop ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Slide-Out Drawer */}
      <nav className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`} aria-label="Mobile Navigation Drawer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="brand-icon" style={{ width: 30, height: 30, fontSize: '0.9rem' }}>FS</div>
            <span className="brand-title" style={{ fontSize: '1.15rem' }}>FoodSquad</span>
          </div>
          <button
            className="mobile-hamburger-btn"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                className={`nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => navigateTo(item.id)}
              >
                <div className="nav-btn-inner">
                  <Icon size={17} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="nav-step">{item.count}</span>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border-line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>{currentUser.id}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{currentUser.name} (Host)</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Cap: {formatINR(currentUser.budget)}</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="sidebar" aria-label="Main Navigation">
        <div className="brand-block">
          <div className="brand-icon">FS</div>
          <span className="brand-title">FoodSquad</span>
          <span className="brand-badge">SaaS</span>
        </div>

        <nav className="nav-section">
          <div className="nav-label">Navigation</div>
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                className={`nav-btn ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => navigateTo(item.id)}
              >
                <div className="nav-btn-inner">
                  <Icon size={17} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className="nav-step">{item.count}</span>
                )}
              </button>
            );
          })}
        </nav>

        <nav className="nav-section">
          <div className="nav-label">Order Process</div>
          {navItems.slice(2).map((item) => {
            const Icon = item.icon;
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                className={`nav-btn ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => navigateTo(item.id)}
              >
                <div className="nav-btn-inner">
                  <Icon size={17} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="nav-step">{item.count}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Compact Active Room Info */}
        <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-line)', marginBottom: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Active Room</span>
            <span className="dot-live" title="Live multiplayer room active"></span>
          </div>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentRestaurant.name}
          </div>
        </div>

        {/* User Card */}
        <div className="sidebar-user">
          <div className="user-avatar">{currentUser.id}</div>
          <div className="user-info">
            <span className="user-name">{currentUser.name} (Host)</span>
            <span className="user-role">Cap: {formatINR(currentUser.budget)}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-wrapper" id="main-content">
        {view === 'dash' && (
          <DashboardView
            state={state}
            onNavigate={navigateTo}
            onOpenRestaurants={() => navigateTo('restaurants')}
            onSettleLedger={(id) => {
              act('/ledger/settle', { id });
              notify('Ledger balance settled');
            }}
          />
        )}

        {view === 'restaurants' && (
          <RestaurantsDirectoryView
            restaurants={restaurants}
            currentId={currentRestaurant.id}
            onSelect={(id) => {
              act('/restaurant/select', { id }).then(() => {
                notify('Selected restaurant updated');
                navigateTo('room');
              });
            }}
            onBack={() => navigateTo('dash')}
          />
        )}

        {view === 'room' && (
          <SquadRoomView
            state={state}
            onSavePrefs={(prefs) => {
              act('/prefs', prefs);
              notify('Preferences saved');
            }}
            onChangeRestaurant={() => navigateTo('restaurants')}
            onProceed={() => navigateTo('agent')}
            notify={notify}
          />
        )}

        {view === 'agent' && (
          <AgentRecommendationView
            state={state}
            onProceedToCart={() => navigateTo('cart')}
            onRegenerate={() => notify('Matching refreshed')}
          />
        )}

        {view === 'cart' && (
          <GroupCartView
            state={state}
            onAddToCart={(name) => {
              act('/cart/add', { name });
              notify('Added to group cart');
            }}
            onUpdateQty={(index, delta) => act('/cart/qty', { index, delta })}
            onToggleEater={(index, member) => act('/cart/eat', { index, member })}
            onPlaceOrder={() => {
              act('/order/place', {}).then(() => {
                notify('Group order placed successfully');
                navigateTo('settle');
              });
            }}
            notify={notify}
          />
        )}

        {view === 'settle' && (
          <SettlementView
            state={state}
            onConfirmPaid={(id) => {
              act('/paid', { id });
              notify('Payment verified');
            }}
            onBackToDashboard={() => navigateTo('dash')}
            notify={notify}
          />
        )}
      </main>
    </div>
  );
}

/* ==========================================================================
   VIEW 1: DASHBOARD
   ========================================================================== */
function DashboardView({ state, onNavigate, onOpenRestaurants, onSettleLedger }) {
  const { dashboard, currentRestaurant, restaurants, members } = state;
  const [inviteInput, setInviteInput] = useState('');

  return (
    <section aria-labelledby="dashboard-title">
      <div className="page-header">
        <h1 id="dashboard-title" className="page-title">Good evening, Mahak</h1>
      </div>

      {/* KPI Ribbon */}
      <div className="kpi-row" role="region" aria-label="Financial Summary">
        <article className="kpi-card">
          <div className="kpi-label">You Are Owed</div>
          <div className="kpi-value num" style={{ color: 'var(--accent-mint)' }}>
            {formatINR(dashboard.owed)}
          </div>
        </article>
        <article className="kpi-card">
          <div className="kpi-label">You Owe</div>
          <div className="kpi-value num" style={{ color: 'var(--accent-amber)' }}>
            {formatINR(dashboard.owe)}
          </div>
        </article>
        <article className="kpi-card">
          <div className="kpi-label">Active Rooms</div>
          <div className="kpi-value num">2</div>
        </article>
        <article className="kpi-card">
          <div className="kpi-label">Squad Members</div>
          <div className="kpi-value num">{members.length}</div>
        </article>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid-2" style={{ marginBottom: 'var(--sp-6)' }}>
        <article className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Store size={18} color="var(--accent-saffron)" />
            <h2 style={{ fontSize: '1.05rem', margin: 0 }}>Start Squad Order</h2>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
            <button className="btn btn-accent btn-sm" onClick={onOpenRestaurants}>
              Choose Restaurant
              <ChevronRight size={14} />
            </button>
            <button className="btn btn-sm" onClick={() => onNavigate('room')}>
              Continue {currentRestaurant.name}
            </button>
          </div>
        </article>

        <article className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Users size={18} color="var(--accent-saffron)" />
            <h2 style={{ fontSize: '1.05rem', margin: 0 }}>Join Room Code</h2>
          </div>
          <div className="input-group">
            <input
              type="text"
              className="input-field"
              aria-label="Room invite code"
              placeholder="e.g. BBQ-4821 or HLD-9102"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                if (inviteInput.trim()) onNavigate('room');
              }}
            >
              Join
            </button>
          </div>
        </article>
      </div>

      {/* Partner Restaurants */}
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <div className="section-head">
          <h2>Partner Restaurants</h2>
          <button className="btn btn-sm" onClick={onOpenRestaurants}>
            View All ({restaurants.length})
          </button>
        </div>

        <div className="grid-3">
          {restaurants.slice(0, 3).map((r) => (
            <article key={r.id} className="restaurant-card">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <h3 style={{ fontSize: '0.98rem' }}>{r.name}</h3>
                  <span className={`dietary-tag ${r.dietary.includes('100%') ? 'veg' : 'mixed'}`}>{r.dietary}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                    <Star size={13} fill="#F59E0B" color="#F59E0B" /> {r.rating}
                  </span>
                  <span>·</span>
                  <span>{r.deliveryTime}</span>
                  <span>·</span>
                  <span>{formatINR(r.priceForTwo)} for 2</span>
                </div>
              </div>
              <button
                className={`btn btn-sm ${r.id === currentRestaurant.id ? 'btn-primary' : ''}`}
                style={{ width: '100%' }}
                onClick={onOpenRestaurants}
              >
                {r.id === currentRestaurant.id ? 'Active Session' : 'Order Here'}
              </button>
            </article>
          ))}
        </div>
      </div>

      {/* Active Rooms & Squad Ledger */}
      <div className="split-layout">
        <div>
          <h2 style={{ marginBottom: 'var(--sp-3)' }}>Active Rooms</h2>
          <div className="card" style={{ padding: 'var(--sp-3) var(--sp-4)' }}>
            {dashboard.rooms.map((room) => (
              <div key={room.name} className="data-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="user-avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>{room.name[0]}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{room.name}</span>
                      <span className="pill pill-neutral" style={{ fontSize: '0.65rem' }}>{room.host ? 'Host' : 'Guest'}</span>
                    </div>
                  </div>
                </div>
                <button
                  className={`btn btn-sm ${room.host ? 'btn-primary' : ''}`}
                  onClick={() => onNavigate(room.step || 'room')}
                >
                  Resume
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ marginBottom: 'var(--sp-3)' }}>Squad Ledger</h2>
          <div className="card" style={{ padding: 'var(--sp-3) var(--sp-4)' }}>
            {dashboard.ledger.map((item) => (
              <div key={item.id} className="data-row">
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.text}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="num" style={{ fontWeight: 800, fontSize: '0.9rem' }}>{formatINR(item.amt)}</span>
                  {!item.settled ? (
                    <button className="btn btn-sm" style={{ padding: '3px 8px', fontSize: '0.72rem' }} onClick={() => onSettleLedger(item.id)}>
                      Settle
                    </button>
                  ) : (
                    <span className="pill pill-success" style={{ fontSize: '0.65rem' }}>Paid</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   VIEW 2: RESTAURANTS DIRECTORY
   ========================================================================== */
function RestaurantsDirectoryView({ restaurants, currentId, onSelect, onBack }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;
      if (filter === 'Pure Veg') return r.dietary.includes('100%');
      if (filter === 'North Indian') return r.cuisine.includes('North Indian');
      if (filter === 'Biryani') return r.cuisine.includes('Biryani');
      if (filter === 'Pizza') return r.cuisine.includes('Pizza');
      if (filter === 'Healthy') return r.cuisine.includes('Healthy') || r.cuisine.includes('Sandwiches');

      return true;
    });
  }, [restaurants, filter, search]);

  return (
    <section aria-labelledby="restaurants-title">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 id="restaurants-title" className="page-title">Choose Restaurant</h1>
          <button className="btn btn-sm" onClick={onBack}>← Back</button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="card" style={{ marginBottom: 'var(--sp-4)', padding: 'var(--sp-3)' }}>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="chip-container" role="tablist" aria-label="Cuisine filters">
            {CUISINE_FILTERS.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={filter === cat}
                className={`chip-btn ${filter === cat ? 'selected' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative', minWidth: 220 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 9, color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              style={{ padding: '5px 10px 5px 30px', fontSize: '0.825rem' }}
              placeholder="Search restaurant…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid-2">
        {filteredRestaurants.map((r) => {
          const isSelected = r.id === currentId;
          return (
            <article key={r.id} className={`restaurant-card ${isSelected ? 'active-selected' : ''}`}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <h2 style={{ fontSize: '1.1rem' }}>{r.name}</h2>
                  <span className={`dietary-tag ${r.dietary.includes('100%') ? 'veg' : 'mixed'}`}>{r.dietary}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>{r.cuisine}</div>

                <div style={{ display: 'flex', gap: 10, fontSize: '0.8rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card-subtle)', padding: '6px 10px', borderRadius: 'var(--r-sm)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    <Star size={13} fill="#F59E0B" color="#F59E0B" /> {r.rating}
                  </span>
                  <span>·</span>
                  <span><Clock size={13} style={{ display: 'inline', verticalAlign: '-1px' }} /> {r.deliveryTime}</span>
                  <span>·</span>
                  <span className="num">{formatINR(r.priceForTwo)} for 2</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-line)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Code: <b style={{ color: 'var(--text-primary)' }}>{r.code}</b></span>
                <button className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-accent'}`} onClick={() => onSelect(r.id)}>
                  {isSelected ? 'Open Room' : 'Select Restaurant'}
                  <ArrowRight size={14} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* ==========================================================================
   VIEW 3: SQUAD ROOM (Step 1)
   ========================================================================== */
function SquadRoomView({ state, onSavePrefs, onChangeRestaurant, onProceed, notify }) {
  const { currentRestaurant, members } = state;
  const me = members[0];
  const [budget, setBudget] = useState(me.budget || 450);
  const [diet, setDiet] = useState(me.diet || ['Veg']);
  const [mood, setMood] = useState(me.mood || 'Spicy');
  const [dislikes, setDislikes] = useState('');

  const readyCount = members.filter((m) => m.ready).length;

  const copyRoomInvite = () => {
    const inviteUrl = `https://foodsquad.app/join/${currentRestaurant.code}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
      notify(`Copied: ${currentRestaurant.code}`);
    }
  };

  return (
    <section aria-labelledby="room-title">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-saffron)', fontWeight: 700 }}>Step 1 of 4</span>
            <h1 id="room-title" className="page-title" style={{ fontSize: '1.5rem', marginTop: 2 }}>{currentRestaurant.name} Room</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-sm" onClick={copyRoomInvite} aria-label="Copy Room Code">
              <Copy size={14} />
              Code: {currentRestaurant.code}
            </button>
            <button className="btn btn-sm" onClick={onChangeRestaurant}>
              Change Restaurant
            </button>
          </div>
        </div>
      </div>

      <div className="split-layout">
        {/* Members Roster */}
        <div>
          <div className="section-head">
            <h2>Members ({members.length})</h2>
            <span className="pill pill-success" style={{ fontSize: '0.7rem' }}>
              <span className="dot-live"></span> {readyCount} of {members.length} Ready
            </span>
          </div>

          <div className="card" style={{ padding: 'var(--sp-3) var(--sp-4)' }}>
            {members.map((m, idx) => (
              <div key={m.id} className="data-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="user-avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>{m.id}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{m.name}</span>
                      {idx === 0 && <span className="pill pill-neutral" style={{ fontSize: '0.65rem' }}>Host</span>}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Cap: {formatINR(m.budget)}</div>
                  </div>
                </div>
                {m.ready ? (
                  <span className="pill pill-success" style={{ fontSize: '0.7rem' }}>Ready</span>
                ) : (
                  <span className="pill pill-warning" style={{ fontSize: '0.7rem' }}>Pending</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Your Preferences Form */}
        <div>
          <h2 style={{ marginBottom: 8 }}>Your Preferences</h2>
          <div className="card" style={{ padding: 'var(--sp-4)' }}>
            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>Diet</label>
              <div className="chip-container">
                {DIETARY_OPTIONS.map((opt) => {
                  const isSelected = diet.includes(opt);
                  return (
                    <button
                      key={opt}
                      aria-pressed={isSelected}
                      className={`chip-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => setDiet(isSelected ? diet.filter((x) => x !== opt) : [...diet, opt])}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <label htmlFor="budget-slider" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Budget Cap</label>
                <span className="num" style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--accent-saffron)' }}>{formatINR(budget)}</span>
              </div>
              <input
                id="budget-slider"
                type="range"
                min="200"
                max="1000"
                step="25"
                value={budget}
                onChange={(e) => setBudget(+e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-saffron)', height: 6 }}
              />
            </div>

            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>Flavor Mood</label>
              <div className="chip-container">
                {MOOD_OPTIONS.map((m) => (
                  <button
                    key={m}
                    aria-pressed={mood === m}
                    className={`chip-btn ${mood === m ? 'selected' : ''}`}
                    onClick={() => setMood(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <label htmlFor="dislikes-input" style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Dislikes</label>
              <input
                id="dislikes-input"
                type="text"
                className="input-field"
                placeholder="e.g. mushrooms, coriander"
                value={dislikes}
                onChange={(e) => setDislikes(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
              onClick={() => onSavePrefs({ budget, diet, mood })}
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Bar */}
      <div className="bottom-action-bar">
        <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{readyCount} of {members.length} ready</span>
        <button className="btn btn-accent btn-sm" onClick={onProceed}>
          Run AI Matching
          <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}

/* ==========================================================================
   VIEW 4: AGENT RECOMMENDATION (Step 2)
   ========================================================================== */
function AgentRecommendationView({ state, onProceedToCart, onRegenerate }) {
  const { currentRestaurant, members, cart, calc } = state;
  const [votes, setVotes] = useState({});

  return (
    <section aria-labelledby="agent-title">
      <div className="page-header">
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-saffron)', fontWeight: 700 }}>Step 2 of 4</span>
        <h1 id="agent-title" className="page-title" style={{ fontSize: '1.5rem', marginTop: 2 }}>Recommended for {currentRestaurant.name}</h1>
      </div>

      {/* Recommended Dishes */}
      <div className="grid-3" style={{ marginBottom: 'var(--sp-6)' }}>
        {cart.slice(0, 3).map((item, idx) => {
          const vote = votes[item.name];
          const tags = ['Veg · Shared by 3', 'Non-veg · Aman & Sneha only', 'Veg · Shared by all 5'];
          return (
            <article key={item.name} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <h3 style={{ fontSize: '0.95rem' }}>{item.name}</h3>
                  <span className="num" style={{ fontWeight: 800, fontSize: '0.95rem' }}>{formatINR(item.price)}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>{tags[idx]}</div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                  {item.eaters.map((id) => (
                    <span key={id} className="user-avatar" style={{ width: 22, height: 22, fontSize: '0.65rem' }}>{id}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, paddingTop: 8, borderTop: '1px solid var(--border-line)' }}>
                <button
                  className={`btn btn-sm ${vote === 'like' ? 'btn-primary' : ''}`}
                  style={{ flex: 1, padding: '4px 8px', fontSize: '0.75rem' }}
                  aria-pressed={vote === 'like'}
                  onClick={() => setVotes({ ...votes, [item.name]: vote === 'like' ? null : 'like' })}
                >
                  Like
                </button>
                <button
                  className={`btn btn-sm ${vote === 'pass' ? 'btn-outline-danger' : ''}`}
                  style={{ flex: 1, padding: '4px 8px', fontSize: '0.75rem' }}
                  aria-pressed={vote === 'pass'}
                  onClick={() => setVotes({ ...votes, [item.name]: vote === 'pass' ? null : 'pass' })}
                >
                  Pass
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Split: Estimated Cost per Person & Excluded items */}
      <div className="split-layout">
        <div>
          <h2 style={{ marginBottom: 8 }}>Cost Per Person</h2>
          <div className="card" style={{ padding: 'var(--sp-3) var(--sp-4)' }}>
            {members.map((m) => {
              const share = calc.shares[m.id] || 0;
              const isOver = share > m.budget;
              return (
                <div key={m.id} className="data-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="user-avatar" style={{ width: 26, height: 26, fontSize: '0.7rem' }}>{m.id}</div>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{m.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="num" style={{ fontWeight: 800, fontSize: '0.9rem' }}>{formatINR(share)}</span>
                    {isOver ? (
                      <span className="pill pill-danger" style={{ fontSize: '0.65rem' }}>{formatINR(share - m.budget)} over</span>
                    ) : (
                      <span className="pill pill-success" style={{ fontSize: '0.65rem' }}>Within Cap</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 style={{ marginBottom: 8 }}>Dishes Excluded</h2>
          <div className="card" style={{ padding: 'var(--sp-3) var(--sp-4)' }}>
            {[
              { dish: 'Mutton Rogan Josh', reason: 'Over ₹400 cap' },
              { dish: 'Egg Biryani', reason: 'Riya is egg-free' },
              { dish: 'Loaded Brownie', reason: 'Contains egg' }
            ].map((exc) => (
              <div key={exc.dish} className="data-row" style={{ fontSize: '0.8rem' }}>
                <span style={{ fontWeight: 600 }}>{exc.dish}</span>
                <span className="pill pill-neutral" style={{ fontSize: '0.68rem' }}>{exc.reason}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bar */}
      <div className="bottom-action-bar">
        <button className="btn btn-sm" onClick={onRegenerate}>Regenerate</button>
        <button className="btn btn-accent btn-sm" onClick={onProceedToCart}>
          Accept & Open Cart
          <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}

/* ==========================================================================
   VIEW 5: GROUP CART & BILL SPLITTER (Step 3)
   ========================================================================== */
function GroupCartView({ state, onAddToCart, onUpdateQty, onToggleEater, onPlaceOrder }) {
  const { currentRestaurant, menu, cart, members, calc } = state;
  const currentUser = members[0];
  const isOverBudget = calc.shares.M > currentUser.budget;

  return (
    <section aria-labelledby="cart-title">
      <div className="page-header">
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-saffron)', fontWeight: 700 }}>Step 3 of 4</span>
        <h1 id="cart-title" className="page-title" style={{ fontSize: '1.5rem', marginTop: 2 }}>{currentRestaurant.name} Cart</h1>
      </div>

      <div className="split-layout">
        {/* Menu Catalog */}
        <div>
          <div className="section-head">
            <h2>Menu Catalog</h2>
            <span className="pill pill-neutral" style={{ fontSize: '0.7rem' }}>{menu.length} items</span>
          </div>

          <div className="card" style={{ padding: 0 }}>
            {menu.map((item) => (
              <div
                key={item.id || item.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--border-line)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        backgroundColor: item.veg ? 'var(--accent-mint)' : 'var(--accent-rose)',
                        display: 'inline-block'
                      }}
                      title={item.veg ? 'Vegetarian' : 'Non-Vegetarian'}
                    />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{item.name}</span>
                  </div>
                  <div className="num" style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: 2 }}>
                    {formatINR(item.price)}
                  </div>
                </div>

                <button
                  className="btn btn-sm btn-primary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  onClick={() => onAddToCart(item.name)}
                >
                  <Plus size={13} /> Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Cart with Clickable Eaters */}
        <div>
          <div className="section-head">
            <h2>Shared Cart</h2>
            <span className="pill pill-success" style={{ fontSize: '0.7rem' }}>
              <span className="dot-live"></span> Live Split
            </span>
          </div>

          <div className="card" style={{ padding: 'var(--sp-4)' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--sp-6) 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Cart is empty. Add dishes from the menu.
              </div>
            ) : (
              <div>
                {cart.map((line, k) => (
                  <div key={line.name} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-line)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{line.name}</span>
                        <div className="num" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {formatINR(line.price)} × {line.qty} = <b style={{ color: 'var(--text-primary)' }}>{formatINR(line.price * line.qty)}</b>
                        </div>
                      </div>

                      <div className="qty-stepper">
                        <button className="qty-btn" aria-label="Decrease quantity" onClick={() => onUpdateQty(k, -1)}><Minus size={12} /></button>
                        <span className="qty-count num">{line.qty}</span>
                        <button className="qty-btn" aria-label="Increase quantity" onClick={() => onUpdateQty(k, 1)}><Plus size={12} /></button>
                      </div>
                    </div>

                    {/* Eater Avatar Toggles */}
                    <div className="eaters-group">
                      <span className="eaters-label">Eaters:</span>
                      {members.map((m) => {
                        const isEating = line.eaters && line.eaters.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            className={`eater-pill ${isEating ? 'active' : ''}`}
                            title={`${m.name} (${isEating ? 'Eating' : 'Not eating'})`}
                            aria-pressed={isEating}
                            onClick={() => onToggleEater(k, m.id)}
                          >
                            {m.id}
                          </button>
                        );
                      })}
                      <span className="num" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 4 }}>
                        ({formatINR((line.price * line.qty) / (line.eaters?.length || 1))} each)
                      </span>
                    </div>
                  </div>
                ))}

                {/* Subtotals */}
                <div style={{ marginTop: 'var(--sp-4)', paddingTop: 'var(--sp-2)' }}>
                  <div className="data-row" style={{ fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                    <span className="num">{formatINR(calc.sub)}</span>
                  </div>
                  <div className="data-row" style={{ fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>GST (5%)</span>
                    <span className="num">{formatINR(calc.tax)}</span>
                  </div>
                  <div className="data-row" style={{ fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Delivery Fee</span>
                    <span className="num">{formatINR(calc.fee)}</span>
                  </div>
                  <div className="data-row" style={{ fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--accent-mint)' }}>Squad Discount</span>
                    <span className="num" style={{ color: 'var(--accent-mint)', fontWeight: 700 }}>−{formatINR(calc.disc)}</span>
                  </div>
                  <div className="data-row" style={{ paddingTop: 8, marginTop: 4, borderTop: '2px solid var(--border-line)' }}>
                    <span style={{ fontWeight: 800 }}>Total Invoice</span>
                    <span className="num" style={{ fontWeight: 800, fontSize: '1.15rem' }}>{formatINR(calc.total)}</span>
                  </div>
                </div>

                {/* Host share pill */}
                <div style={{ marginTop: 10, padding: '8px 12px', backgroundColor: isOverBudget ? 'var(--accent-rose-soft)' : 'var(--bg-card-subtle)', borderRadius: 'var(--r-sm)', border: `1px solid ${isOverBudget ? 'var(--accent-rose-border)' : 'var(--border-line)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Your Share (Mahak):</span>
                    <span className="num" style={{ fontWeight: 800, fontSize: '0.98rem', color: isOverBudget ? 'var(--accent-rose)' : 'var(--accent-saffron)' }}>
                      {formatINR(calc.shares.M)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bar */}
      <div className="bottom-action-bar">
        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Host authorizes group order dispatch</span>
        <button className="btn btn-accent btn-sm" disabled={!cart.length} onClick={onPlaceOrder}>
          Place Order ({formatINR(calc.total)})
          <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}

/* ==========================================================================
   VIEW 6: SETTLEMENT & LEDGER (Step 4)
   ========================================================================== */
function SettlementView({ state, onConfirmPaid, onBackToDashboard, notify }) {
  const { currentRestaurant, members, paid, calc } = state;
  const otherMembers = members.slice(1);
  const openPayments = otherMembers.filter((m) => !paid[m.id]);

  const copySummary = () => {
    const text = `${currentRestaurant.name} Total ${formatINR(calc.total)}. Shares: ` +
      otherMembers.map((m) => `${m.name}: ${formatINR(calc.shares[m.id])}`).join(', ') + ' to Mahak.';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      notify('Group chat summary copied');
    }
  };

  return (
    <section aria-labelledby="settle-title">
      <div className="page-header">
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-mint)', fontWeight: 700 }}>Step 4 of 4</span>
        <h1 id="settle-title" className="page-title" style={{ fontSize: '1.5rem', marginTop: 2 }}>Order Placed · {currentRestaurant.name}</h1>
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--sp-6)' }}>
        <article className="card" style={{ padding: 'var(--sp-4)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Your Share (Mahak)</div>
          <div className="num" style={{ fontSize: '1.6rem', fontWeight: 800, margin: '2px 0', color: 'var(--text-primary)' }}>
            {formatINR(calc.shares.M)}
          </div>
        </article>

        <article className="card" style={{ padding: 'var(--sp-4)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Awaiting Collection</div>
          <div className="num" style={{ fontSize: '1.6rem', fontWeight: 800, margin: '2px 0', color: openPayments.length ? 'var(--accent-amber)' : 'var(--accent-mint)' }}>
            {formatINR(openPayments.reduce((acc, m) => acc + (calc.shares[m.id] || 0), 0))}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{openPayments.length} of {otherMembers.length} pending</div>
        </article>
      </div>

      {/* Payment Rows */}
      <h2 style={{ marginBottom: 8 }}>Who Pays Mahak</h2>
      <div className="card" style={{ padding: 'var(--sp-3) var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        {otherMembers.map((m) => {
          const isPaid = paid[m.id];
          const share = calc.shares[m.id] || 0;
          return (
            <div key={m.id} className="data-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="user-avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>{m.id}</div>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{m.name}</span>
                  <div className="num" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Owes <b style={{ color: 'var(--text-primary)' }}>{formatINR(share)}</b>
                  </div>
                </div>
              </div>

              <div>
                {isPaid ? (
                  <span className="pill pill-success" style={{ fontSize: '0.7rem' }}>Received</span>
                ) : (
                  <button className="btn btn-sm btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => onConfirmPaid(m.id)}>
                    Confirm Received
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bar */}
      <div className="bottom-action-bar">
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sm" onClick={copySummary}>
            <Share2 size={14} /> Copy Summary
          </button>
          <button className="btn btn-sm" onClick={() => window.print()}>
            <Printer size={14} /> Receipt
          </button>
        </div>
        <button className="btn btn-accent btn-sm" onClick={onBackToDashboard}>
          Return to Dashboard
        </button>
      </div>
    </section>
  );
}
