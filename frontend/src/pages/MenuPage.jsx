import React, { useState, useEffect ,useRef} from 'react';
import { useNavigate } from "react-router-dom";
import RestaurantHeader from '../components/RestaurantHeader.jsx';
import MenuSection from '../components/MenuSection.jsx';
import OrderSidebar from '../components/OrderSidebar.jsx';
import { useAuth0 } from "@auth0/auth0-react";
import { useParams, useSearchParams } from 'react-router-dom'; // 🚀 1. Add useSearchParams
import { io } from "socket.io-client"; // 🚀 2. Import Socket
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const MenuPage = () => {
  // const socket = io("http://localhost:5000");
  const socketRef = useRef(null);
const { user, isAuthenticated,isLoading, getAccessTokenSilently } = useAuth0();
const navigate = useNavigate();
  const { restaurantId } = useParams();
 const [searchParams, setSearchParams] = useSearchParams();
  const orderIdFromUrl = searchParams.get("orderId"); // 🚀 4. Grab ID from URL link
  const [restaurant, setRestaurant] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);


   useEffect(() => {
  if (typeof window !== "undefined" && !socketRef.current) {
    socketRef.current = io(BASE_URL, {
      transports: ["websocket"], // avoids polling issues
    });
  }

  return () => {
    socketRef.current?.disconnect();
  };
}, []);

  useEffect(() => {
  
    if (isLoading) return; 
  const idFromUrl = searchParams.get("orderId");

  const initializeData = async () => {
  setLoading(true);

  try {
    // 1. Fetch Restaurant
    const res = await fetch(`${BASE_URL}/api/restaurants/${restaurantId}`);
    const restaurantData = await res.json();
    setRestaurant(restaurantData);

    let initialOrder = null;

    // 2. CASE 1: Order from URL
    if (idFromUrl) {
      console.log("Syncing with Order from URL:", idFromUrl);

      const orderRes = await fetch(`${BASE_URL}/api/orders/${idFromUrl}`);
      if (orderRes.ok) {
        initialOrder = await orderRes.json();
      }
    }

    // 3. CASE 2: Active order (ONLY if logged in and no URL order)
    else if (isAuthenticated && user?.sub) {
      console.log("Fetching active order for user:", user.sub);

      const orderRes = await fetch(
        `${BASE_URL}/api/orders/active?restaurantId=${restaurantId}&userId=${user.sub}`
      );

      if (orderRes.ok && orderRes.status !== 204) {
        initialOrder = await orderRes.json();
      }
    }

    // 4. Set order ONCE (no overwrite)
    if (initialOrder) {
      setOrder(initialOrder);

      // Socket join
      socketRef.current?.emit("join-order", initialOrder._id);

      socketRef.current?.off("orderUpdated");
      socketRef.current?.on("orderUpdated", (updatedOrder) => {
        setOrder(updatedOrder);
      });
    }

  } catch (error) {
    console.error("Initialization failed:", error);
  } finally {
    setLoading(false);
  }
};
  if (restaurantId) initializeData();

  // CLEANUP: Disconnect socket listener when component unmounts
  return () => {
    socketRef.current?.off("orderUpdated");
      socketRef.current?.off("orderFinalized");
  };
},[restaurantId, searchParams, isLoading, isAuthenticated, user]); // 🚀 Re-run only if restaurant changes or URL ID changes
  // --- NEW: FUNCTION TO CREATE ORDER ---
  const handleCreateOrder = async () => {
  try {
    // 🛡️ Get the token from Auth0
    
    const token = await getAccessTokenSilently();

    const response = await fetch(`${BASE_URL}/api/orders/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // 🚀 This tells the backend who is creating the order
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ restaurantId }) 
    });
    
    const result = await response.json();

    if (response.ok) {
      const newOrder = result.order;
      
      // Update local state and URL
      setOrder(newOrder);
      setSearchParams({ orderId: newOrder._id }); 
      
      console.log("Order Created Successfully with ID:", newOrder._id);
      return newOrder;
    } else {
      console.error("Server refused to create order:", result.message);
    }
  } catch (error) {
    console.error("Failed to create order session:", error);
  }
};
  // --- NEW: FUNCTION TO UPDATE STATE ---
  const handleUpdateOrder = (newOrder) => {
    setOrder(newOrder); // When an item is added, the Sidebar refreshes automatically
  };

//  useEffect(() => {
//   const fetchMenuAndOrder = async () => {
//     try {
//       setLoading(true);

//       // 1. Fetch Restaurant
//       const resResponse = await fetch(`${BASE_URL}/api/restaurants/${restaurantId}`);
//       const resData = await resResponse.json();
//       setRestaurant(resData);

//       // 2. Fetch Active Order using userId from Auth0 state
//       if (user?.sub) {
//         // 🚀 Pass userId in the URL directly
//         const orderResponse = await fetch(
//           `${BASE_URL}/api/orders/active?restaurantId=${restaurantId}&userId=${user.sub}`
//         );

//         if (orderResponse.ok && orderResponse.status !== 204) {
//           const orderData = await orderResponse.json();
//           setOrder(orderData);
//         }
//       }
//     } catch (error) {
//       console.error("Error loading menu page:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (restaurantId && user) fetchMenuAndOrder();
// }, [restaurantId, user]); // Re-run when user logs in
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <RestaurantHeader 
          restaurant={restaurant} 
          orderId={order?._id} 
        />

        <div className="flex flex-col lg:flex-row gap-8 mt-10">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 tracking-tight">Menu</h2>
            <MenuSection 
              items={restaurant?.menuItems} 
              orderId={order?._id}
              // PASSING THE NEW FUNCTIONS AS PROPS HERE:
              onUpdateOrder={handleUpdateOrder} 
              onCreateOrder={handleCreateOrder} 
            />
          </div>

         <aside className="w-full lg:w-96">
          <div className="lg:sticky lg:top-8">
               <OrderSidebar order={order} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default MenuPage;