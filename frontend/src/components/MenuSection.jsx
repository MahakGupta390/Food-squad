import React, { useState,useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
// const { user, getAccessTokenSilently } = useAuth0();

const MenuSection = ({ items, orderId, onUpdateOrder,onCreateOrder }) => {
  const [addingItem, setAddingItem] = useState(null); // Track which item is currently being saved
  const { user, isAuthenticated, isLoading,getAccessTokenSilently } = useAuth0();

  useEffect(() => {
  const fetchOrder = async () => {
    // 🛑 Guard: Don't fetch if orderId is missing or "undefined"
    if (!orderId || orderId === "undefined") return;

    try {
      const response = await fetch(`${BASE_URL}/api/orders/${orderId}`);
      const result = await response.json();
      
      if (response.ok) {
        // This sends the data up to the parent so the Sidebar can see it
        onUpdateOrder(result); 
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    }
  };

  fetchOrder();
}, [orderId]); 


  const handleAddItem = async (item) => {
    // 1. Ensure user is present before doing anything
      if (isLoading) {
      console.log("Auth still loading...");
      return;
    }

    // 🛑 Ensure user is authenticated
    if (!isAuthenticated || !user?.sub) {
      alert("Please log in first!");
      return;
    }
     let token;
    try {
      // ✅ Get token AFTER auth check
      token = await getAccessTokenSilently();
    } catch (err) {
      console.error("Token error:", err);
      alert("Authentication error. Please login again.");
      return;
    }

    setAddingItem(item.name);

    try {
        let currentOrderId = orderId;

        // 2. Handle Order Creation if it doesn't exist yet
        if (!currentOrderId) {
            console.log("No Order ID found, creating new order...");
            const newOrder = await onCreateOrder(); 
            // Check if the returned object has the ID (sometimes it's result.data._id)
            currentOrderId = newOrder?._id || newOrder?.order?._id; 
        }
        console.log("Current Order ID:", currentOrderId);

        // 3. The API Call
        const response = await fetch(`${BASE_URL}/api/orders/${currentOrderId}/add-item`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json','Authorization': `Bearer ${token}` },
            
            body: JSON.stringify({
                name: item.name,
                price: item.price,
                quantity: 1,
                userId: user.sub,      // Match this key exactly with Backend
                userName: user.name, 
                consumedBy: [user.sub]  // Match this key exactly with Backend
            })
        });

        const result = await response.json();

        if (response.ok) {
            onUpdateOrder(result.order);
        } else {
            console.error("Backend Error:", result.message);
            alert(result.message || "Failed to add item");
        }
    } catch (error) {
        console.error("Add Item Error:", error);
    } finally {
        setAddingItem(null);
    }
};
 if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Full Menu</h2>
        <span className="text-sm text-slate-400 font-medium">{items?.length || 0} items available</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items?.map((item, index) => (
          <div 
            key={index} 
            className="group flex bg-white p-4 rounded-3xl border border-slate-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300"
          >
            {/* Item Info */}
            <div className="flex-1 pr-4">
              <h4 className="text-lg font-bold text-slate-900 mb-1">{item.name}</h4>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="text-lg font-black text-orange-600">₹{item.price}</span>
                
                <button
                  onClick={() => handleAddItem(item)}
                  disabled={addingItem === item.name}
                  className={`
                    px-5 py-2 rounded-2xl font-bold text-sm transition-all active:scale-95
                    ${addingItem === item.name 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white'}
                  `}
                >
                  {addingItem === item.name ? 'Adding...' : '+ Add'}
                </button>
              </div>
            </div>

           
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuSection;