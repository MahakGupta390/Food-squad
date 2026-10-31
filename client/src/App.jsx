import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
  ArrowLeft,
  Printer,
  Share2,
  CheckCircle2,
  Search,
  ChevronRight,
  Menu as MenuIcon,
  X as CloseIcon,
  LogOut,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { api, getToken, getUser, clearAuth, getActiveRoom, setActiveRoom } from './api.js';
import { getSocket, joinRoomSocket, disconnectSocket } from './socket.js';

const formatINR = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');

const DIETARY_OPTIONS = ['Veg', 'Non-veg', 'Vegan', 'Jain', 'Egg-free', 'Gluten-free', 'Nut allergy'];
const MOOD_OPTIONS = ['Spicy', 'Comfort Food', 'Light', 'Sweet', 'High Protein'];
const CUISINE_FILTERS = ['All', 'Pure Veg', 'North Indian', 'Biryani', 'Pizza', 'Healthy'];

export default function App({ initialView = 'dash', authIntent = 'start', initialJoinCode = '', onBackToLanding }) {
  const [sessionUser, setSessionUser] = useState(() => getUser());
  const [nameInput, setNameInput] = useState('');
  const [view, setView] = useState(initialView);
  const [state, setState] = useState(null);
  const [flash, setFlash] = useState(null); // { text, type: 'success' | 'error' }
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const notify = (text, type = 'success') => {
    setFlash({ text, type });
    setTimeout(() => setFlash(null), 2500);
  };

  // Fetch full state from backend
  const loadState = useCallback(async () => {
    if (!getToken()) return;
    try {
      const data = await api.getState();
      if (data) {
        setState(data);
        if (data.room?.code) {
          joinRoomSocket(data.room.code);
        }
      }
    } catch (err) {
      console.error('Failed to load state:', err);
      if (err.status === 401) {
        setSessionUser(null);
      } else {
        notify(err.message, 'error');
      }
    }
  }, []);

  // Generic action wrapper
  const act = useCallback(async (actionFn, successMsg) => {
    setLoadingAction(true);
    try {
      const data = await actionFn();
      if (data) {
        setState(data);
        if (data.room?.code) {
          joinRoomSocket(data.room.code);
        }
      }
      if (successMsg) notify(successMsg, 'success');
      return data;
    } catch (err) {
      console.error('Action failed:', err);
      notify(err.message || 'Action failed', 'error');
      return null;
    } finally {
      setLoadingAction(false);
    }
  }, []);

  // Initialize socket & periodic sync
  useEffect(() => {
    if (!sessionUser) return;

    loadState();

    // Socket.io for instantaneous real-time pings across squad members
    const socket = getSocket(() => {
      loadState();
    });

    // Fallback sync timer every 5 seconds
    const interval = setInterval(loadState, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [sessionUser, loadState]);

  // Handle URL join parameter (?room=... or ?join=...) or initialJoinCode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = initialJoinCode || params.get('room') || params.get('join');
    if (roomFromUrl && sessionUser) {
      api.joinRoom(roomFromUrl)
        .then((res) => {
          setState(res);
          notify(`Joined squad room ${res.room?.code || roomFromUrl.toUpperCase()}!`, 'success');
          setView('room');
        })
        .catch((e) => notify(e.message, 'error'));
    }
  }, [sessionUser, initialJoinCode]);

  const handleCreateSession = async (name) => {
    if (!name || !name.trim()) return;
    try {
      const res = await api.createSession(name.trim());
      setSessionUser(res.user);
      notify(`Welcome, ${res.user.name}!`);
      loadState();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const handleLogout = () => {
    disconnectSocket();
    clearAuth();
    setSessionUser(null);
    setState(null);
    notify('Signed out');
  };

  const navigateTo = (newView) => {
    setView(newView);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sign In / Name Dialog Modal if not signed in
  if (!sessionUser) {
    const isSignInMode = authIntent === 'signin';
    const isJoinMode = authIntent === 'join';
    const modalTitle = isSignInMode
      ? 'Sign In to FoodSquad'
      : isJoinMode
      ? `Join Squad ${initialJoinCode ? `(${initialJoinCode.toUpperCase()})` : ''}`
      : 'Start a Squad Order';

    const modalSubtitle = isSignInMode
      ? 'Choose your squad persona or enter your name to access your active rooms and split bills:'
      : isJoinMode
      ? 'Pick a persona or enter your name to join your friends in this order:'
      : 'Pick a host persona or enter your name to launch a collaborative feast:';

    return (
      <div className="modal-overlay">
        <div className="modal-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div className="brand-icon" style={{ width: 36, height: 36, fontSize: '0.95rem' }}>FS</div>
            <div>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{modalTitle}</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Online Food Ordering & Automated Bill Splitting</p>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
            {modalSubtitle}
          </p>

          <div className="avatar-quick-grid">
            {['Mahak (Host)', 'Aman', 'Riya', 'Kabir', 'Sneha'].map((item) => {
              const clean = item.split(' ')[0];
              return (
                <button
                  key={item}
                  type="button"
                  className="avatar-quick-btn"
                  onClick={() => handleCreateSession(clean)}
                >
                  <div className="avatar-circle">{clean[0]}</div>
                  <div className="avatar-label">{clean}</div>
                </button>
              );
            })}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleCreateSession(nameInput); }}>
            <label htmlFor="custom-name-input" style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
              Or enter custom name:
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                id="custom-name-input"
                type="text"
                className="input-field"
                placeholder="e.g. Arjun"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-primary" disabled={!nameInput.trim()}>
                {isSignInMode ? 'Sign In' : isJoinMode ? 'Join Squad' : 'Start Order'}
              </button>
            </div>
          </form>

          {onBackToLanding && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                type="button"
                className="user-switch-btn"
                onClick={onBackToLanding}
              >
                ← Back to Landing Page
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (!state) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-page)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="brand-icon" style={{ margin: '0 auto 12px auto' }}>FS</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
            FoodSquad
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>Connecting to squad ordering network…</p>
        </div>
      </div>
    );
  }

  const {
    restaurants = [],
    currentRestaurant,
    members = [],
    menu = [],
    cart = [],
    calc = { sub: 0, tax: 0, fee: 0, disc: 0, total: 0, shares: {} },
    dashboard = { owed: 0, owe: 0, ledger: [], rooms: [] },
    room
  } = state;

  const me = state.me || members[0] || { id: 'U', name: sessionUser.name, budget: 500, isHost: true };
  const host = state.host || members.find((m) => m.isHost) || me;
  const isHost = Boolean(me.isHost || room?.isHost);
  const cartItemCount = cart.reduce((a, c) => a + c.qty, 0);

  const navItems = [
    { id: 'dash', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'restaurants', label: 'Restaurants', icon: Store, count: restaurants.length },
    { id: 'room', label: '1. Squad Room', icon: Users, disabled: !room },
    { id: 'agent', label: '2. AI Matching', icon: Sparkles, disabled: !room },
    { id: 'cart', label: '3. Group Cart', icon: ShoppingCart, count: cartItemCount, disabled: !room },
    { id: 'settle', label: '4. Bill Settlement', icon: Receipt, disabled: !room }
  ];

  return (
    <div className="app-shell">
      {/* Toast Notification */}
      {flash && (
        <div className={`toast-notice ${flash.type === 'error' ? 'toast-error' : 'toast-success'}`} role="status" aria-live="polite">
          {flash.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
          <span>{flash.text}</span>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>{me.id}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{me.name} {isHost ? '(Host)' : '(Guest)'}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {room ? `Cap: ${formatINR(me.budget)}` : 'Squad Member'}
                </div>
              </div>
            </div>
            <button className="user-switch-btn" onClick={handleLogout} title="Switch Profile">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="sidebar" aria-label="Main Navigation">
        <div className="brand-block">
          <div className="brand-icon">FS</div>
          <span className="brand-title">FoodSquad</span>
          <span className="brand-badge">Live</span>
        </div>

        {onBackToLanding && (
          <button
            type="button"
            className="user-switch-btn"
            style={{ marginBottom: 12, padding: '4px 8px' }}
            onClick={onBackToLanding}
          >
            <ArrowLeft size={13} />
            Landing Page
          </button>
        )}

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
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              {room ? `Room: ${room.code}` : 'No Active Room'}
            </span>
            <span className={`dot-live ${!room ? 'offline' : ''}`} title={room ? 'Live multiplayer sync active' : 'No active session'}></span>
          </div>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {room ? currentRestaurant?.name : 'Select Restaurant'}
          </div>
        </div>

        {/* User Card */}
        <div className="sidebar-user">
          <div className="user-avatar">{me.id}</div>
          <div className="user-info">
            <span className="user-name">{me.name} {isHost ? '(Host)' : '(Guest)'}</span>
            <span className="user-role">{room ? `Cap: ${formatINR(me.budget)}` : 'Squad Member'}</span>
          </div>
          <button className="user-switch-btn" onClick={handleLogout} title="Switch Profile / Sign Out">
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-wrapper" id="main-content">
        {view === 'dash' && (
          <DashboardView
            state={state}
            me={me}
            onNavigate={navigateTo}
            onOpenRestaurants={() => navigateTo('restaurants')}
            onSettleLedger={(id) => {
              act(() => api.settleLedger(id), 'Ledger balance settled');
            }}
            onJoinRoom={(code) => {
              act(() => api.joinRoom(code), `Joined room!`).then((data) => {
                if (data) navigateTo('room');
              });
            }}
            onResumeRoom={(code, step) => {
              setActiveRoom(code);
              act(() => api.getState()).then(() => {
                navigateTo(step || 'room');
              });
            }}
          />
        )}

        {view === 'restaurants' && (
          <RestaurantsDirectoryView
            restaurants={restaurants}
            activeRestaurantSlug={room ? room.restaurantSlug : null}
            onSelect={(id) => {
              act(() => api.selectRestaurant(id), 'Restaurant room ready').then((data) => {
                if (data) navigateTo('room');
              });
            }}
            onBack={() => navigateTo('dash')}
          />
        )}

        {view === 'room' && (
          <SquadRoomView
            state={state}
            me={me}
            onSavePrefs={(prefs) => {
              act(() => api.savePrefs(prefs), 'Preferences saved');
            }}
            onChangeRestaurant={() => navigateTo('restaurants')}
            onProceed={() => navigateTo('agent')}
            notify={notify}
          />
        )}

        {view === 'agent' && (
          <AgentRecommendationView
            state={state}
            onNavigate={navigateTo}
            onProceedToCart={() => navigateTo('cart')}
            onAcceptAgent={() => {
              act(() => api.acceptAgent(), 'AI recommendations added to squad cart').then((data) => {
                if (data) navigateTo('cart');
              });
            }}
            notify={notify}
          />
        )}

        {view === 'cart' && (
          <GroupCartView
            state={state}
            me={me}
            isHost={isHost}
            onNavigate={navigateTo}
            onAddToCart={(params) => {
              act(() => api.addToCart(params), 'Added to group cart');
            }}
            onUpdateQty={(lineId, delta) => {
              act(() => api.updateQty({ lineId, delta }));
            }}
            onToggleEater={(lineId, member) => {
              act(() => api.toggleEater({ lineId, member }));
            }}
            onPlaceOrder={() => {
              act(() => api.placeOrder(), 'Group order placed successfully').then((data) => {
                if (data) navigateTo('settle');
              });
            }}
            notify={notify}
          />
        )}

        {view === 'settle' && (
          <SettlementView
            state={state}
            me={me}
            host={host}
            isHost={isHost}
            onNavigate={navigateTo}
            onConfirmPaid={(id) => {
              act(() => api.confirmPaid(id), 'Payment verified and cleared');
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
function DashboardView({ state, me, onNavigate, onOpenRestaurants, onSettleLedger, onJoinRoom, onResumeRoom }) {
  const { currentRestaurant, members, restaurants = [], dashboard, room } = state;
  const [inviteInput, setInviteInput] = useState('');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <section aria-labelledby="dashboard-title">
      <div className="page-header">
        <h1 id="dashboard-title" className="page-title">{greeting}, {me.name}</h1>
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
          <div className="kpi-value num">{dashboard.rooms?.length || 0}</div>
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
            {room && (
              <button className="btn btn-sm" onClick={() => onNavigate('room')}>
                Continue {currentRestaurant?.name || 'Room'}
              </button>
            )}
          </div>
        </article>

        <article className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Users size={18} color="var(--accent-saffron)" />
            <h2 style={{ fontSize: '1.05rem', margin: 0 }}>Join Room Code</h2>
          </div>
          <form
            className="input-group"
            onSubmit={(e) => {
              e.preventDefault();
              if (inviteInput.trim()) onJoinRoom(inviteInput.trim());
            }}
          >
            <input
              type="text"
              className="input-field"
              aria-label="Room invite code"
              placeholder="e.g. BBQ-4821 or paste invite URL"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={!inviteInput.trim()}>
              Join
            </button>
          </form>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Paste a room code (or any restaurant code like BBQ-4821) to join an active feast.
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
          {restaurants.slice(0, 3).map((r) => {
            const hasActiveRoomHere = Boolean(room && room.restaurantSlug === r.id);
            return (
              <article key={r.id} className="restaurant-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <h3 style={{ fontSize: '0.98rem' }}>{r.name}</h3>
                    <span className={`dietary-tag ${r.dietary?.includes('100%') ? 'veg' : 'mixed'}`}>{r.dietary}</span>
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
                  className={`btn btn-sm ${hasActiveRoomHere ? 'btn-primary' : ''}`}
                  style={{ width: '100%' }}
                  onClick={onOpenRestaurants}
                >
                  {hasActiveRoomHere ? 'Active Room · View' : 'Order Here'}
                </button>
              </article>
            );
          })}
        </div>
      </div>

      {/* Active Rooms & Squad Ledger */}
      <div className="split-layout">
        <div>
          <h2 style={{ marginBottom: 'var(--sp-3)' }}>Active Rooms</h2>
          <div className="card" style={{ padding: 'var(--sp-3) var(--sp-4)' }}>
            {(!dashboard.rooms || dashboard.rooms.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No active rooms yet. Start an order above or join with a code!
              </div>
            ) : (
              dashboard.rooms.map((rm) => (
                <div key={rm.code} className="data-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="user-avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                      {rm.name ? rm.name[0] : 'R'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{rm.name}</span>
                        <span className="pill pill-neutral" style={{ fontSize: '0.65rem' }}>
                          {rm.host ? 'Host' : 'Guest'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Code: <b>{rm.code}</b> · {rm.membersCount} member{rm.membersCount === 1 ? '' : 's'}
                      </div>
                    </div>
                  </div>
                  <button
                    className={`btn btn-sm ${rm.host ? 'btn-primary' : ''}`}
                    onClick={() => onResumeRoom(rm.code, rm.step)}
                  >
                    Resume
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 style={{ marginBottom: 'var(--sp-3)' }}>Squad Ledger</h2>
          <div className="card" style={{ padding: 'var(--sp-3) var(--sp-4)' }}>
            {(!dashboard.ledger || dashboard.ledger.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                All balances settled! Zero outstanding debts.
              </div>
            ) : (
              dashboard.ledger.map((item) => (
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
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   VIEW 2: RESTAURANTS DIRECTORY
   ========================================================================== */
const FLAVOR_MOOD_PATTERNS = {
  spicy: /tikka|65|chili|chilli|spicy|masala|peri|tandoori|seekh|rogan|khowsuey|pepper|spiced|fiery/i,
  sweet: /sweet|dessert|mithai|gulab|jamun|rasmalai|phirni|cake|cookie|fudge|chocolate|lava/i,
  comfort: /dal|biryani|naan|chole|bhature|butter|thali|cheese|roti|pizza/i,
  healthy: /salad|bowl|steamed|grilled|healthy|sub\b|lemonade|cooler|protein|sprouts/i,
  protein: /paneer|chicken|kebab|mutton|egg|dal|protein|lamb/i,
};

const getMatchingHighlights = (r, query) => {
  if (!query) return [];
  const q = query.toLowerCase().trim();
  const highlights = [];

  // Check dishes directly
  if (Array.isArray(r.dishes)) {
    for (const d of r.dishes) {
      if (d.toLowerCase().includes(q) && !highlights.includes(d)) {
        highlights.push(d);
      }
    }
  }

  // Check tagline
  if (r.tagline && r.tagline.toLowerCase().includes(q) && !highlights.includes(r.tagline)) {
    highlights.push(r.tagline);
  }

  // Check flavor & mood patterns if query matches any flavor
  for (const [flavorKey, pattern] of Object.entries(FLAVOR_MOOD_PATTERNS)) {
    if (q.includes(flavorKey) || flavorKey.includes(q)) {
      if (Array.isArray(r.dishes)) {
        for (const d of r.dishes) {
          if (pattern.test(d) && !highlights.includes(d)) {
            highlights.push(d);
          }
        }
      }
      if (r.tagline && pattern.test(r.tagline) && !highlights.includes(r.tagline)) {
        highlights.push(r.tagline);
      }
    }
  }

  return highlights.slice(0, 3);
};

function RestaurantsDirectoryView({ restaurants = [], activeRestaurantSlug, onSelect, onBack }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredRestaurants = useMemo(() => {
    const query = search.trim().toLowerCase();
    const queryTokens = query ? query.split(/\s+/).filter(Boolean) : [];

    return restaurants.filter((r) => {
      // 1. Cuisine Category Filter
      if (filter === 'Pure Veg' && !r.dietary?.includes('100%')) return false;
      if (filter === 'North Indian' && !r.cuisine?.includes('North Indian')) return false;
      if (filter === 'Biryani' && !r.cuisine?.includes('Biryani')) return false;
      if (filter === 'Pizza' && !r.cuisine?.includes('Pizza')) return false;
      if (filter === 'Healthy' && !(r.cuisine?.includes('Healthy') || r.cuisine?.includes('Sandwiches'))) return false;

      // 2. Search Query Matching (Name, Cuisine, Tagline, Code, Dietary, Dishes, Menu items & Mood/Flavor)
      if (!query) return true;

      const searchableBlob = [
        r.name,
        r.cuisine,
        r.tagline,
        r.dietary,
        r.code,
        ...(Array.isArray(r.dishes) ? r.dishes : []),
        r.menuSummary,
        ...(Array.isArray(r.dishCategories) ? r.dishCategories : []),
        ...(Array.isArray(r.dishTags) ? r.dishTags : []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return queryTokens.every((token) => {
        if (searchableBlob.includes(token)) return true;

        for (const [flavorKey, pattern] of Object.entries(FLAVOR_MOOD_PATTERNS)) {
          if (token.includes(flavorKey) || flavorKey.includes(token)) {
            if (pattern.test(searchableBlob)) return true;
          }
        }

        return false;
      });
    });
  }, [restaurants, filter, search]);

  return (
    <section aria-labelledby="restaurants-title">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h1 id="restaurants-title" className="page-title">Choose Restaurant</h1>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing {filteredRestaurants.length} of {restaurants.length} {restaurants.length === 1 ? 'restaurant' : 'restaurants'}
            </span>
          </div>
          <button className="btn btn-sm" onClick={onBack}>← Back to Dashboard</button>
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

          <div style={{ position: 'relative', minWidth: 260, flex: '1 1 260px', maxWidth: 400 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              style={{ padding: '6px 32px 6px 32px', fontSize: '0.825rem', width: '100%' }}
              placeholder="Search by restaurant, dish, or mood (e.g. spicy)…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search restaurants, dishes or mood"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 4,
                }}
                title="Clear search"
                aria-label="Clear search"
              >
                <CloseIcon size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid or Empty State */}
      {filteredRestaurants.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: 'var(--sp-10) var(--sp-6)',
            marginTop: 'var(--sp-4)',
          }}
          role="status"
          aria-live="polite"
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'var(--accent-saffron-soft)',
              color: 'var(--accent-saffron)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              border: '1px solid var(--accent-saffron-border)',
            }}
          >
            <Search size={26} />
          </div>

          <h2 style={{ fontSize: '1.25rem', marginBottom: 8, color: 'var(--text-primary)' }}>
            No restaurants found
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 460, margin: '0 auto 14px auto', lineHeight: 1.5 }}>
            {search.trim() && filter !== 'All' ? (
              <>
                No results found for <strong style={{ color: 'var(--text-primary)' }}>"{search.trim()}"</strong> under the <strong style={{ color: 'var(--text-primary)' }}>{filter}</strong> cuisine filter.
              </>
            ) : search.trim() ? (
              <>
                No restaurants or dishes matched <strong style={{ color: 'var(--text-primary)' }}>"{search.trim()}"</strong>.
              </>
            ) : (
              <>
                No restaurants currently available under <strong style={{ color: 'var(--text-primary)' }}>{filter}</strong>.
              </>
            )}
          </p>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: 20 }}>
            Try checking the spelling, searching for a popular dish (e.g. <em>Biryani</em>, <em>Tikka</em>, <em>Pizza</em>), or clearing active filters.
          </p>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 22 }}>
            {search.trim() && (
              <button
                className="btn btn-sm"
                onClick={() => setSearch('')}
              >
                Clear Search Text
              </button>
            )}
            {filter !== 'All' && (
              <button
                className="btn btn-sm"
                onClick={() => setFilter('All')}
              >
                Show All Cuisines
              </button>
            )}
            {(search.trim() || filter !== 'All') && (
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  setSearch('');
                  setFilter('All');
                }}
              >
                Reset All Filters
              </button>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-line)', paddingTop: 16, maxWidth: 440, margin: '0 auto' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase' }}>
              Popular searches
            </span>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['Spicy', 'Biryani', 'Tikka', 'Pizza', 'North Indian', 'Pure Veg'].map((tag) => (
                <button
                  key={tag}
                  className="chip-btn"
                  style={{ fontSize: '0.75rem', padding: '3px 10px' }}
                  onClick={() => {
                    setFilter('All');
                    setSearch(tag);
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid-2">
          {filteredRestaurants.map((r) => {
            const isSelected = Boolean(activeRestaurantSlug && activeRestaurantSlug === r.id);
            const highlights = getMatchingHighlights(r, search);

            return (
              <article key={r.id} className={`restaurant-card ${isSelected ? 'active-selected' : ''}`}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <h2 style={{ fontSize: '1.1rem' }}>{r.name}</h2>
                    <span className={`dietary-tag ${r.dietary?.includes('100%') ? 'veg' : 'mixed'}`}>{r.dietary}</span>
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

                  {/* Highlights from Search */}
                  {highlights.length > 0 && (
                    <div style={{ marginTop: 8, padding: '4px 8px', backgroundColor: 'var(--accent-saffron-soft)', borderRadius: 'var(--r-sm)', border: '1px solid var(--accent-saffron-border)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-saffron)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Sparkles size={11} /> Matched:
                      </span>
                      {highlights.map((h, idx) => (
                        <span key={idx} style={{ fontSize: '0.72rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                          {h}{idx < highlights.length - 1 ? ' · ' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 'var(--sp-4)', display: 'flex', gap: 8 }}>
                  <button
                    className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-accent'}`}
                    style={{ width: '100%' }}
                    onClick={() => onSelect(r.id)}
                  >
                    {isSelected ? 'Active Session · View Room' : 'Start Squad Order'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ==========================================================================
   VIEW 3: SQUAD ROOM (Step 1)
   ========================================================================== */
function SquadRoomView({ state, me, onSavePrefs, onChangeRestaurant, onProceed, notify }) {
  const { currentRestaurant, members = [], room } = state;

  if (!room) {
    return (
      <section aria-labelledby="room-title">
        <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-10)' }}>
          <Users size={36} color="var(--accent-saffron)" style={{ margin: '0 auto 12px auto' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: 6 }}>No Active Squad Room</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: 420, margin: '0 auto 18px auto' }}>
            Start an order session by choosing a restaurant or join your friends using their room code.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={onChangeRestaurant}>
              Choose Restaurant
            </button>
          </div>
        </div>
      </section>
    );
  }

  const roomCode = room.code;
  const [budget, setBudget] = useState(me?.budget || 500);
  const [diet, setDiet] = useState(me?.diet?.length ? me.diet : ['Veg']);
  const [mood, setMood] = useState(me?.mood || 'Spicy');
  const [dislikes, setDislikes] = useState(me?.dislikes || '');
  const [userIsEditing, setUserIsEditing] = useState(false);

  // Sync from server state only when user is not actively editing
  useEffect(() => {
    if (me && !userIsEditing) {
      if (me.budget) setBudget(me.budget);
      if (Array.isArray(me.diet) && me.diet.length > 0) setDiet(me.diet);
      if (me.mood) setMood(me.mood);
      if (me.dislikes !== undefined) setDislikes(me.dislikes);
    }
  }, [me, userIsEditing]);

  const readyCount = members.filter((m) => m.ready).length;

  const copyRoomInvite = () => {
    const inviteUrl = `${window.location.origin}/?join=${roomCode}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomCode);
      notify(`Copied Room Code: ${roomCode}`);
    } else {
      notify(`Room Code: ${roomCode}`);
    }
  };

  const copyShareLink = () => {
    const inviteUrl = `${window.location.origin}/?join=${roomCode}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
      notify(`Copied Invite Link: ${inviteUrl}`);
    } else {
      notify(`Invite Link: ${inviteUrl}`);
    }
  };

  const handleToggleDiet = (opt) => {
    setUserIsEditing(true);
    const updated = diet.includes(opt) ? diet.filter((x) => x !== opt) : [...diet, opt];
    setDiet(updated);
    onSavePrefs({ budget, diet: updated, mood, dislikes });
  };

  const handleSelectMood = (m) => {
    setUserIsEditing(true);
    setMood(m);
    onSavePrefs({ budget, diet, mood: m, dislikes });
  };

  const handleBudgetChange = (newVal) => {
    setUserIsEditing(true);
    const parsed = Math.max(50, Math.min(10000, Number(newVal) || 0));
    setBudget(parsed);
  };

  return (
    <section aria-labelledby="room-title">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-saffron)', fontWeight: 700 }}>Step 1 of 4</span>
            <h1 id="room-title" className="page-title" style={{ fontSize: '1.5rem', marginTop: 2 }}>{currentRestaurant?.name || 'Squad'} Room</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-sm btn-primary" onClick={copyRoomInvite} aria-label="Copy Room Code">
              <Copy size={14} />
              Code: {roomCode}
            </button>
            <button className="btn btn-sm" onClick={copyShareLink} aria-label="Copy Invite Link">
              <Share2 size={14} />
              Share Link
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
            {members.map((m) => (
              <div key={m.id} className="data-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="user-avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>{m.id}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{m.name}</span>
                      {m.isHost && <span className="pill pill-neutral" style={{ fontSize: '0.65rem' }}>Host</span>}
                      {m.id === me?.id && <span className="pill pill-neutral" style={{ fontSize: '0.65rem' }}>You</span>}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Cap: {formatINR(m.budget)} · {m.mood || 'Spicy'} {m.diet?.length ? `· ${m.diet.join(', ')}` : ''}
                    </div>
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
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>Dietary Profile</label>
              <div className="chip-container">
                {DIETARY_OPTIONS.map((opt) => {
                  const isSelected = diet.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      aria-pressed={isSelected}
                      className={`chip-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleToggleDiet(opt)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label htmlFor="budget-input" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Your Budget Cap</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>₹</span>
                  <input
                    id="budget-input"
                    type="number"
                    min="50"
                    max="10000"
                    step="50"
                    value={budget}
                    onChange={(e) => handleBudgetChange(e.target.value)}
                    onBlur={() => onSavePrefs({ budget, diet, mood, dislikes })}
                    className="input-field"
                    style={{ width: 85, padding: '3px 6px', fontWeight: 800, textAlign: 'right', fontSize: '0.92rem', color: 'var(--accent-saffron)' }}
                  />
                </div>
              </div>
              <input
                id="budget-slider"
                type="range"
                min="100"
                max="3000"
                step="50"
                value={Math.min(3000, budget)}
                onChange={(e) => handleBudgetChange(e.target.value)}
                onMouseUp={() => onSavePrefs({ budget, diet, mood, dislikes })}
                onTouchEnd={() => onSavePrefs({ budget, diet, mood, dislikes })}
                style={{ width: '100%', accentColor: 'var(--accent-saffron)', height: 6 }}
              />
              <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                {[350, 500, 800, 1200, 2000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`chip-btn ${budget === preset ? 'selected' : ''}`}
                    style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                    onClick={() => {
                      handleBudgetChange(preset);
                      onSavePrefs({ budget: preset, diet, mood, dislikes });
                    }}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>Flavor Mood</label>
              <div className="chip-container">
                {MOOD_OPTIONS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={mood === m}
                    className={`chip-btn ${mood === m ? 'selected' : ''}`}
                    onClick={() => handleSelectMood(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <label htmlFor="dislikes-input" style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Dislikes / Allergies</label>
              <input
                id="dislikes-input"
                type="text"
                className="input-field"
                placeholder="e.g. mushrooms, coriander, garlic"
                value={dislikes}
                onChange={(e) => {
                  setUserIsEditing(true);
                  setDislikes(e.target.value);
                }}
                onBlur={() => onSavePrefs({ budget, diet, mood, dislikes })}
              />
            </div>

            <button
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
              onClick={() => {
                setUserIsEditing(false);
                onSavePrefs({ budget, diet, mood, dislikes });
              }}
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
function AgentRecommendationView({ state, onNavigate, onProceedToCart, onAcceptAgent, notify }) {
  const { currentRestaurant, members = [], room } = state;

  if (!room) {
    return (
      <section aria-labelledby="agent-title">
        <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-10)' }}>
          <Sparkles size={36} color="var(--accent-saffron)" style={{ margin: '0 auto 12px auto' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: 6 }}>No Active Squad Room</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: 420, margin: '0 auto 18px auto' }}>
            AI Matching requires an active restaurant room to analyze member dietary constraints and match shared dishes.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => onNavigate('restaurants')}>
              Choose Restaurant
            </button>
          </div>
        </div>
      </section>
    );
  }

  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = useCallback(() => {
    if (!room) return;
    setLoading(true);
    api.getAgent()
      .then((data) => {
        setAgentData(data);
      })
      .catch((err) => {
        console.error('Agent recommendation error:', err);
        notify(err.message || 'Failed to generate recommendations', 'error');
      })
      .finally(() => setLoading(false));
  }, [room, notify]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const recommendations = agentData?.recommendations || [];
  const excluded = agentData?.excluded || [];
  const perPerson = agentData?.perPerson || {};

  return (
    <section aria-labelledby="agent-title">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-saffron)', fontWeight: 700 }}>Step 2 of 4</span>
            <h1 id="agent-title" className="page-title" style={{ fontSize: '1.5rem', marginTop: 2 }}>
              Recommended for {currentRestaurant?.name}
            </h1>
          </div>
          <button className="btn btn-sm" onClick={fetchRecommendations} disabled={loading}>
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Re-run Agent
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-10)' }}>
          <Sparkles size={28} color="var(--accent-saffron)" style={{ animation: 'bounce 1s infinite', margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.1rem' }}>Analyzing Squad Diets & Caps…</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Hard-filtering vegetarian, allergy, and budget constraints across {members.length} members.
          </p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--accent-amber)' }}>No Perfect Match Found</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Try adjusting member budget caps or diet preferences in Step 1.
          </p>
        </div>
      ) : (
        /* Recommended Dishes Grid */
        <div className="grid-3" style={{ marginBottom: 'var(--sp-6)' }}>
          {recommendations.map((item) => (
            <article key={item.menuItemId || item.name} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <h3 style={{ fontSize: '0.95rem' }}>{item.name}</h3>
                  <span className="num" style={{ fontWeight: 800, fontSize: '0.95rem' }}>{formatINR(item.price)}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                  Shared by {item.eaters?.length} member{item.eaters?.length === 1 ? '' : 's'} · {formatINR(item.price / (item.eaters?.length || 1))} each
                </div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                  {item.eaters?.map((id) => (
                    <span key={id} className="user-avatar" style={{ width: 22, height: 22, fontSize: '0.65rem' }}>{id}</span>
                  ))}
                </div>
              </div>
              <div className="ai-badge" style={{ alignSelf: 'flex-start' }}>
                <Sparkles size={11} />
                <span>Diet & Cap Verified</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Split: Estimated Cost per Person & Excluded items */}
      <div className="split-layout">
        <div>
          <h2 style={{ marginBottom: 8 }}>Projected Share Per Person</h2>
          <div className="card" style={{ padding: 'var(--sp-3) var(--sp-4)' }}>
            {members.map((m) => {
              const share = perPerson[m.id] !== undefined ? perPerson[m.id] : (state.calc?.shares?.[m.id] || 0);
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
          <h2 style={{ marginBottom: 8 }}>Excluded Dishes ({excluded.length})</h2>
          <div className="card" style={{ padding: 'var(--sp-3) var(--sp-4)' }}>
            {excluded.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '8px 0' }}>All candidate dishes passed constraints!</div>
            ) : (
              excluded.map((exc) => (
                <div key={exc.dish} className="excluded-dish-item">
                  <span style={{ fontWeight: 600 }}>{exc.dish}</span>
                  <span className="pill pill-neutral" style={{ fontSize: '0.68rem', maxWidth: '65%', textAlign: 'right' }}>
                    {exc.reason}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bar */}
      <div className="bottom-action-bar">
        <button className="btn btn-sm" onClick={onProceedToCart}>Skip to Cart</button>
        <button className="btn btn-accent btn-sm" onClick={onAcceptAgent} disabled={loading || recommendations.length === 0}>
          Accept & Add to Squad Cart
          <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}

/* ==========================================================================
   VIEW 5: GROUP CART & BILL SPLITTER (Step 3)
   ========================================================================== */
function GroupCartView({ state, me, isHost, onNavigate, onAddToCart, onUpdateQty, onToggleEater, onPlaceOrder, notify }) {
  const { currentRestaurant, menu = [], cart = [], members = [], calc = {}, room } = state;

  if (!room) {
    return (
      <section aria-labelledby="cart-title">
        <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-10)' }}>
          <ShoppingCart size={36} color="var(--accent-saffron)" style={{ margin: '0 auto 12px auto' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: 6 }}>No Active Squad Cart</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: 420, margin: '0 auto 18px auto' }}>
            Select a restaurant to open a group cart and start adding items with your friends.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => onNavigate('restaurants')}>
              Choose Restaurant
            </button>
          </div>
        </div>
      </section>
    );
  }

  const myShare = calc.shares?.[me.id] || 0;
  const isOverBudget = myShare > me.budget;

  return (
    <section aria-labelledby="cart-title">
      <div className="page-header">
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-saffron)', fontWeight: 700 }}>Step 3 of 4</span>
        <h1 id="cart-title" className="page-title" style={{ fontSize: '1.5rem', marginTop: 2 }}>{currentRestaurant?.name} Cart</h1>
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
                  onClick={() => onAddToCart({ name: item.name, menuItemId: item.id })}
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
                Cart is empty. Add dishes from the menu catalog on the left.
              </div>
            ) : (
              <div>
                {cart.map((line) => (
                  <div key={line.lineId || line.name} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-line)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{line.name}</span>
                        <div className="num" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {formatINR(line.price)} × {line.qty} = <b style={{ color: 'var(--text-primary)' }}>{formatINR(line.price * line.qty)}</b>
                        </div>
                      </div>

                      <div className="qty-stepper">
                        <button
                          className="qty-btn"
                          aria-label="Decrease quantity"
                          onClick={() => onUpdateQty(line.lineId, -1)}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="qty-count num">{line.qty}</span>
                        <button
                          className="qty-btn"
                          aria-label="Increase quantity"
                          onClick={() => onUpdateQty(line.lineId, 1)}
                        >
                          <Plus size={12} />
                        </button>
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
                            onClick={() => onToggleEater(line.lineId, m.id)}
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

                {/* Your share pill */}
                <div style={{ marginTop: 10, padding: '8px 12px', backgroundColor: isOverBudget ? 'var(--accent-rose-soft)' : 'var(--bg-card-subtle)', borderRadius: 'var(--r-sm)', border: `1px solid ${isOverBudget ? 'var(--accent-rose-border)' : 'var(--border-line)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Your Share ({me.name}):</span>
                    <span className="num" style={{ fontWeight: 800, fontSize: '0.98rem', color: isOverBudget ? 'var(--accent-rose)' : 'var(--accent-saffron)' }}>
                      {formatINR(myShare)} {isOverBudget ? '(Over budget cap!)' : ''}
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
        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
          {isHost ? 'You are host · Authorize squad order' : `Hosted by ${state.host?.name || 'Host'}`}
        </span>
        <button
          className="btn btn-accent btn-sm"
          disabled={!cart.length || (!isHost && !state.placed)}
          onClick={onPlaceOrder}
        >
          {state.placed ? 'View Bill Settlement' : isHost ? `Place Order (${formatINR(calc.total)})` : 'Awaiting Host Authorization'}
          <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}

/* ==========================================================================
   VIEW 6: SETTLEMENT & LEDGER (Step 4)
   ========================================================================== */
function SettlementView({ state, me, host, isHost, onNavigate, onConfirmPaid, onBackToDashboard, notify }) {
  const { currentRestaurant, members = [], paid = {}, calc = {}, room } = state;

  if (!room) {
    return (
      <section aria-labelledby="settle-title">
        <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-10)' }}>
          <Receipt size={36} color="var(--accent-saffron)" style={{ margin: '0 auto 12px auto' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: 6 }}>No Placed Order to Settle</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: 420, margin: '0 auto 18px auto' }}>
            Start a squad order to experience automated per-eater bill splitting and instant receipt confirmations.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => onNavigate('restaurants')}>
              Choose Restaurant
            </button>
          </div>
        </div>
      </section>
    );
  }

  const otherMembers = members.filter((m) => m.id !== host.id);
  const openPayments = otherMembers.filter((m) => !paid[m.id]);
  const myShare = calc.shares?.[me.id] || 0;

  const copySummary = () => {
    const text = `${currentRestaurant?.name} Order Total: ${formatINR(calc.total)}. Individual Shares: ` +
      members.map((m) => `${m.name}: ${formatINR(calc.shares?.[m.id] || 0)}`).join(', ') +
      ` to host ${host.name}.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      notify('Group chat summary copied');
    }
  };

  return (
    <section aria-labelledby="settle-title">
      <div className="page-header">
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-mint)', fontWeight: 700 }}>Step 4 of 4</span>
        <h1 id="settle-title" className="page-title" style={{ fontSize: '1.5rem', marginTop: 2 }}>
          {state.placed ? 'Order Placed' : 'Bill Settlement'} · {currentRestaurant?.name}
        </h1>
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--sp-6)' }}>
        <article className="card" style={{ padding: 'var(--sp-4)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Your Share ({me.name})
          </div>
          <div className="num" style={{ fontSize: '1.6rem', fontWeight: 800, margin: '2px 0', color: 'var(--text-primary)' }}>
            {formatINR(myShare)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {isHost ? 'Your portion of the group bill' : `Pay ${host.name} via UPI`}
          </div>
        </article>

        <article className="card" style={{ padding: 'var(--sp-4)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Awaiting Collection
          </div>
          <div className="num" style={{ fontSize: '1.6rem', fontWeight: 800, margin: '2px 0', color: openPayments.length ? 'var(--accent-amber)' : 'var(--accent-mint)' }}>
            {formatINR(openPayments.reduce((acc, m) => acc + (calc.shares?.[m.id] || 0), 0))}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {openPayments.length} of {otherMembers.length} payments pending
          </div>
        </article>
      </div>

      {/* Payment Rows */}
      <h2 style={{ marginBottom: 8 }}>Who Pays {host.name}</h2>
      <div className="card" style={{ padding: 'var(--sp-3) var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        {otherMembers.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', padding: '12px 0', fontSize: '0.85rem' }}>
            Solo order or no other squad members.
          </div>
        ) : (
          otherMembers.map((m) => {
            const isPaid = paid[m.id];
            const share = calc.shares?.[m.id] || 0;
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
                    <span className="pill pill-success" style={{ fontSize: '0.7rem' }}>Received ✓</span>
                  ) : isHost ? (
                    <button
                      className="btn btn-sm btn-primary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => onConfirmPaid(m.id)}
                    >
                      Confirm Received
                    </button>
                  ) : (
                    <span className="pill pill-warning" style={{ fontSize: '0.7rem' }}>Pending</span>
                  )}
                </div>
              </div>
            );
          })
        )}
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
