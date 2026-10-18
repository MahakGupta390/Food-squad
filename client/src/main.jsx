import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import LandingPage from './LandingPage.jsx';
import App from './App.jsx';
import './styles.css';

function Root() {
  const [showApp, setShowApp] = useState(false);

  if (showApp) {
    return <App onBackToLanding={() => setShowApp(false)} />;
  }

  return <LandingPage onEnterApp={() => setShowApp(true)} />;
}

createRoot(document.getElementById('root')).render(<Root />);
