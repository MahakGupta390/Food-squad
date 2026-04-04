import React from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from 'react-router-dom';
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


const OrderSidebar = ({ order }) => {
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();
  // 1. Identify "Me" (In a real app, this comes from your Auth context/Redux)
  const { user } = useAuth0(); 
const currentUserId = user?.sub;
  // 2. Derive helper variables from the 'order' prop
  const items = order?.items || [];
  const participants = order?.participants || [];
  const totalPrice = order?.totalPrice || 0;
  const isGroup = participants.length > 1;
  console.log("Current Logged In User (user.sub):", user?.sub);
        console.log("Order Owner ID (order.ownerId):", order?.ownerId);
      const isOwner = 
  user?.sub && 
  order?.ownerId && 
  String(user.sub) === String(order.ownerId);

  // 3. Action: Finalize Order (Hits your checkOut controller)
  const handleCheckout = async () => {
  try {
    const token = await getAccessTokenSilently();

    // 1️⃣ Checkout order
    const checkoutRes = await fetch(
      `${BASE_URL}/api/orders/${order._id}/checkout`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!checkoutRes.ok) {
      const err = await checkoutRes.json();
      console.error("❌ Checkout failed:", err);
      return;
    }

    console.log("✅ Order placed");

    // 2️⃣ Create split
    const splitRes = await fetch(
      `${BASE_URL}/api/split/create/${order._id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const splitData = await splitRes.json();

    if (!splitRes.ok) {
      console.error("❌ Split creation failed:", splitData);
      return;
    }

    console.log("✅ Split created");

    // 3️⃣ Small delay (ensures DB write is done) 🔥
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 4️⃣ Navigate to split page
    navigate(`/split/${order._id}`);

  } catch (err) {
    console.error("💥 Checkout/Split failed:", err);
  }
};
  return (
    <aside className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 sticky top-8 flex flex-col h-[calc(100vh-120px)] w-full">
      
      {/* --- HEADER: Title & Live Status --- */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Group Cart 🛒</h2>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-100 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
          <span className="text-[10px] font-black text-orange-600 uppercase">{order?.status || 'Draft'}</span>
        </div>
      </div>

      {/* --- PARTICIPANTS: Visualizing the Group --- */}
      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl mb-6">
        <div className="flex -space-x-2">
          {participants.map((_, i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
              U{i + 1}
            </div>
          ))}
        </div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
          {isGroup ? `${participants.length} Friends Joined` : 'Ordering Solo'}
        </p>
      </div>

      {/* --- ITEM LIST: Scrollable Area --- */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-300 text-sm italic">The cart is empty.<br/>Add something delicious!</p>
          </div>
        ) : (
          items.map((item, idx) => {
            const isMine = item.userid === currentUserId;
            return (
              <div key={idx} className="flex flex-col border-b border-slate-50 pb-3 last:border-0">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-slate-800">{item.quantity}x {item.name}</span>
                  <span className="text-sm font-black text-slate-900">₹{item.price * item.quantity}</span>
                </div>
               <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isMine ? 'text-blue-500' : 'text-orange-500'}`}>
  {/* 🚀 THE CHANGE IS HERE */}
  {isMine ? 'Added by You' : `Added by ${item.userName || 'Friend'}`}
</span>
              </div>
            );
          })
        )}
      </div>

      {/* --- SUMMARY: The Financial Breakdown --- */}
      <div className="pt-6 border-t border-slate-100 space-y-4">
        
        {/* Split Estimator (The 'Balanced' 2026 Touch) */}
        {isGroup && totalPrice > 0 && (
          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
            <span className="text-xs font-bold text-orange-700">Estimated Share</span>
            <span className="text-lg font-black text-orange-700">₹{Math.round(totalPrice / participants.length)}</span>
          </div>
        )}

        <div className="flex justify-between items-end py-2">
          <span className="text-slate-400 text-xs font-bold uppercase">Total Bill</span>
          <span className="text-3xl font-black text-slate-900">₹{totalPrice}</span>
        </div>

        {/* Action Button */}
        {/* Check if the current user (from Auth0) matches the owner stored in the DB */}
         {/* console.log("Current Logged In User (user.sub):", user?.sub);
        console.log("Order Owner ID (order.ownerId):", order?.ownerId);
      const isOwner = user?.sub?.toString() === order?.ownerId?.toString(); */}
{isOwner ? (
  <button 
    onClick={handleCheckout}
    disabled={items.length === 0}
    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm tracking-widest hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed"
  >
    PLACE GROUP ORDER
  </button>
) : (
  <div className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold text-center border-2 border-dashed border-slate-300">
    <p className="text-sm tracking-widest uppercase">Waiting for Host to finalize...</p>
    <p className="text-[10px] font-medium opacity-60 mt-1">You can keep adding items until the order is placed</p>
  </div>
)}
      </div>
    </aside>
  );
};

export default OrderSidebar;