


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth0ProviderWithNavigate from "./auth/Auth0Provider.jsx";
import AuthCallbackPage from "./pages/AuthCallBack.jsx";
import LandingPage from "./pages/LandingPages.jsx";
import ExplorePage from "./pages/ExplorePages.jsx";
import MenuPage from "./pages/MenuPage.jsx";
import JoinOrderPage from "./pages/JoinOrderPage.jsx";
import SplitPage from "./pages/SplitPage.jsx";

function App() {
  return (
   
    <Router>
      <Auth0ProviderWithNavigate>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/auth-callback" element={<AuthCallbackPage />} />
        <Route path="/restaurant/:restaurantId" element={<MenuPage />} />
        <Route path="/join/:restaurantId/:orderId" element={<JoinOrderPage />} />
        <Route path="/split/:orderId" element={<SplitPage />} />
      </Routes>
      </Auth0ProviderWithNavigate>  
    </Router>

  );
}

export default App;