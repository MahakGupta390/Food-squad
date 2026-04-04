import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SplitPage = () => {
  const { orderId } = useParams();
  const { user, getAccessTokenSilently } = useAuth0();
  const [splitData, setSplitData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSplit = async () => {
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${BASE_URL}/api/split/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSplitData(data.split);
      }
    } catch (err) {
      console.error("Error fetching split:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchSplit();
  }, [orderId]);

  const handlePay = async (userId) => {
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${BASE_URL}/api/splits/pay_user/${orderId}/${userId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ userId }) 
      });

      if (res.ok) {
        fetchSplit(); 
      }
    } catch (err) {
      console.error("Payment update failed", err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-bounce text-orange-500 font-bold">Calculating the goodness...</div>
    </div>
  );

  if (!splitData) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-red-500 bg-white p-8 rounded-3xl shadow-xl">Oops! Split not found.</div>
    </div>
  );

 return (
  <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
    <div className="max-w-xl mx-auto bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-slate-100">
      
      {/* Header with warm message */}
      <div className="bg-orange-500 p-10 text-center text-white">
        <div className="text-4xl mb-3">✨</div>
        <h1 className="text-3xl font-black mb-2">Order Finalized!</h1>
        <p className="text-orange-100 font-medium">Thank you for coming! Enjoy your delicious meal.</p>
      </div>

      <div className="p-8">
        <div className="space-y-4">
          {splitData.splits.map((individual) => {
            const isMe = individual.userId === user?.sub;
            return (
              <div key={individual.userId} className="p-5 rounded-3xl bg-slate-50 flex justify-between items-center border border-slate-100">
                <div className="flex items-center gap-4">
                  {/* Initials Circle */}
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black">
                    {(individual.userName || "S").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className={`font-bold ${isMe ? 'text-orange-600' : 'text-slate-800'}`}>
                      {isMe ? "Your Share" : individual.userName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {individual.status === 'paid' ? 'Settled' : 'Pending'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {/* 🚀 Changed to Rupees */}
                  <p className="text-xl font-black text-slate-900">₹{individual.amount.toFixed(2)}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Grand Total */}
        <footer className="mt-10 pt-8 border-t-2 border-dashed border-slate-200">
          <div className="flex justify-between items-center bg-slate-900 p-6 rounded-[2rem] text-white">
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Bill</span>
              <span className="text-3xl font-black">₹{splitData.totalAmount.toFixed(2)}</span>
            </div>
          
          </div>
          <p className="text-center mt-8 text-slate-400 text-xs font-medium italic">
             "A meal shared is a memory made. See you next time!"
          </p>
        </footer>
      </div>
    </div>
  </div>
);
};

export default SplitPage;