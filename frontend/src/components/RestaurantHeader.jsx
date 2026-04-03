import { restaurantPics } from "../utils/restaurantPics.jsx"; // Import the map
import { Share2, Copy } from 'lucide-react'; // Optional: for a nice icon

const RestaurantHeader = ({ restaurant, orderId }) => {
  const dynamicImg = restaurantPics[restaurant?.name];

  const handleInvite = () => {
    if (!orderId) return alert("You need to add at least a food item to create an order and get the invite link.");
    
    const link = `${window.location.origin}/join/${restaurant._id}/${orderId}`;
    navigator.clipboard.writeText(link);
    alert("Invite Link Copied to Clipboard! Send it to your friends.");
  };

  return (
    <div className="relative h-64 w-full rounded-3xl overflow-hidden shadow-lg border border-slate-100">
      {/* 1. The Banner Image */}
      <img 
        src={dynamicImg} 
        className="w-full h-full object-contain" // Changed to cover for a better fit
        alt={restaurant?.name}
      />

      {/* 2. Gradient Overlay (Makes text/buttons readable) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      {/* 3. Restaurant Name (Bottom Left) */}
      <div className="absolute bottom-6 left-8">
        <h1 className="text-3xl font-black text-white">{restaurant?.name}</h1>
       
      </div>

      {/* 4. THE INVITE BUTTON (Top Right) */}
      <button 
        onClick={handleInvite}
        className="absolute top-6 right-8 flex items-center gap-2 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl hover:bg-orange-600 hover:text-white transition-all font-bold text-slate-800 active:scale-95"
      >
        <Share2 size={18} />
        <span>Invite Friends</span>
      </button>
      
    </div>
  );
};
export default RestaurantHeader;