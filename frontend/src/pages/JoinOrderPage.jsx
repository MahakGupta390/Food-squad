import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const JoinOrderPage = () => {
  const { restaurantId, orderId } = useParams(); // Automatically grabs from /join/:resId/:ordId
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const processJoin = async () => {
      if (isLoading) return;

      // 1. If not logged in, go to Auth0
      if (!isAuthenticated) {
        loginWithRedirect({
          appState: { returnTo: window.location.pathname } 
        });
        return;
      }

      // 2. If logged in, tell the backend to add this user
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${BASE_URL}/api/orders/${orderId}/join`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          // 3. SUCCESS: Take them to the restaurant menu page!
          // They are now "synced" with the group.
         navigate(`/restaurant/${restaurantId}?orderId=${orderId}`);
        } else {
          console.error("Failed to join order");
          navigate("/"); // Send home if something is wrong
        }
      } catch (error) {
        console.error("Join error:", error);
      }
    };

    processJoin();
  }, [isAuthenticated, isLoading, orderId, restaurantId]);

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-slate-50">
      <div className="animate-bounce mb-4 text-orange-500">
         {/* You can put your Cutlery Logo here! */}
         <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
      </div>
      <h2 className="text-xl font-bold text-slate-800">Joining your squad's order...</h2>
      <p className="text-slate-500">Syncing menu and shared cart.</p>
    </div>
  );
};

export default JoinOrderPage;