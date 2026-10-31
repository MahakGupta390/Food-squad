import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import LandingPage from './LandingPage.jsx';
import App from './App.jsx';
import './styles.css';

function Root() {
  const [showApp, setShowApp] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return Boolean(params.get('room') || params.get('join'));
  });
  const [initialView, setInitialView] = useState('dash');
  const [authIntent, setAuthIntent] = useState('start');
  const [joinCode, setJoinCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('room') || params.get('join') || '';
  });

  const handleEnterApp = (intentOrView = 'start', extraCode = '') => {
    if (intentOrView === 'join') {
      setAuthIntent('join');
      if (extraCode) setJoinCode(extraCode);
      setInitialView('room');
    } else if (intentOrView === 'signin') {
      setAuthIntent('signin');
      setInitialView('dash');
    } else if (intentOrView === 'restaurants') {
      setAuthIntent('start');
      setInitialView('restaurants');
    } else {
      setAuthIntent('start');
      setInitialView('dash');
    }
    setShowApp(true);
  };

  if (showApp) {
    return (
      <App
        initialView={initialView}
        authIntent={authIntent}
        initialJoinCode={joinCode}
        onBackToLanding={() => setShowApp(false)}
      />
    );
  }

  return <LandingPage onEnterApp={handleEnterApp} />;
}

createRoot(document.getElementById('root')).render(<Root />);
