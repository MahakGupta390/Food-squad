import {Order} from "../models/order.models.js";
import {Restaurant} from "../models/restaurant.models.js"
import mongoose from "mongoose"
const createOrder=async(req,res)=>{
    //take restaurant id
    //identify current user
    //create new order
    //add owner to participants 
    //status="draft"
    //return created order
  try { 
    const { restaurantId } = req.body;

    // ⚠️ For now (since no JWT), hardcode user
   const userId = req.userId;// later → req.auth.payload.sub
console.log("Creating order for User:", userId);

    if (!userId) {
      return res.status(401).json({ message: "Auth failed: No User ID found" });
    }
    // 1️⃣ Validate input
    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    // 2️⃣ Create new order
    const newOrder = new Order({
      restaurantId,
      ownerId: userId,
      participants: [userId],
      items: [],
      totalPrice: 0,
      status: "draft"
    });

    // 3️⃣ Save to DB
    await newOrder.save();

    // 4️⃣ Send response
    res.status(201).json({
      message: "Order created successfully",
      order: newOrder
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating order" });
  }

}


const addItem=async(req,res)=>{
    try{
        //find orderid and check if order exists
        //status of order should be draft
        //add item and attach userid
        //recalculate total pprice 
        //save order
       const { id } = req.params;
       if (!mongoose.Types.ObjectId.isValid(id)) {
  console.log("Invalid ID received:", id);
  return res.status(400).json({ message: "Invalid Order ID format" });
}
       const { name, price, quantity, userId, userName } = req.body;
      //  const userid = req.userId;
       if (!name || !price || !quantity || !userId) {
      return res.status(400).json({ message: "Missing item or user info" });
    }
        const order = await Order.findById(id);
       

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
     if (order.status !== "draft") {
      return res.status(400).json({ message: "Cannot modify placed order" });
    }
    const restaurant = await Restaurant.findById(order.restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    const menuItem = restaurant.menuItems.find(
      item => item.name.toLowerCase ()=== name.toLowerCase()
    );

    if (!menuItem) {
      return res.status(400).json({ message: "Item not found in restaurant menu" });
    }

    // 4️⃣ Add item
    order.items.push({
      name,
      price,
      quantity,
     userId: userId, // Ensure this matches your Schema (userId vs userid)
      userName: userName,
      consumedBy: [userId] // Default to the person who added it
    });
    order.totalPrice = order.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    // 6️⃣ Save
    await order.save();

    const io = req.app.get("io");
    if (io) {
      try {
        // 'id' here is the Order ID from req.params
        io.to(id).emit("orderUpdated", order); 
        console.log(`Broadcasting update for order: ${id}`);
      } catch (socketErr) {
        console.error("Socket emit failed:", socketErr);
        // We don't return an error here because the DB save was successful
      }
    }

    // 7️⃣ Response
    res.json({
      message: "Item added successfully",
      order
    });



    }catch(error){
         console.log(error);
    res.status(500).json({ message: "Error in finding order" });

    }
}
const checkOut = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ REPLACED: Use the ID attached to the request by your Auth middleware
        // This usually comes from req.userId or req.auth.payload.sub
        const userId = req.userId; 

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID missing" });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // 1️⃣ SECURITY CHECK: Ensure the person clicking is the Owner
        // We use .toString() because MongoDB IDs are Objects, and userId is a String
        if (order.ownerId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only the host (owner) can place the group order" });
        }

        // 2️⃣ Check if order has items
        if (!order.items || order.items.length === 0) {
            return res.status(400).json({ message: "Cannot checkout an empty order" });
        }

        // 3️⃣ Ensure it hasn't been placed already
        if (order.status !== "draft") {
            return res.status(400).json({ message: "Order is already finalized" });
        }

        // 4️⃣ Final price calculation (Safety check)
        order.totalPrice = order.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        // 5️⃣ Update status
        order.status = "placed";
        await order.save();

        // 📣 SOCKET EMIT: Use a specific event name for the "Finalized" redirect
        // This tells the frontend to move to the /split page immediately
        req.app.get("io")?.to(id).emit("orderFinalized", { 
            orderId: id, 
            status: "placed" 
        });

        res.json({
            message: "Order placed successfully",
            order
        });

    } catch (error) {
        console.error("Checkout Error:", error);
        res.status(500).json({ message: "Error in checking out" });
    }
};
const addOrder=async(req,res)=>{
  try{
    //finds order
    //check valid
    //check if order is not placed still in draft
    //check if still participant not in order or not
    //now add user to participants
    //saves
    //returned order
    // const token = await getAccessTokenSilently();
    const {id}=req.params;
    const userId = req.userId;
     const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "draft") {
      return res.status(400).json({ message: "Order closed" });
    }
    if (order.participants.includes(userId)) {
      return res.json({ message: "Already joined", order });
    }

    order.participants.addToSet(userId);

    await order.save();
    req.app.get("io")?.to(id).emit("orderUpdated", order);

    res.json({
      message: "Joined successfully",
      order
    });


  }catch(error){
    console.log(error);
    return res.status(500).json({message:"Error joining order"});
    
  }
}
const getOrderById = async (req, res) => {
    try {
   
        const { id } = req.params;
       
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Return the full order object
        res.status(200).json(order);
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const getActiveOrder = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    const userId = req.userId; // Populated by your auth middleware

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find an order that is still in 'draft' for this user at this restaurant
    const activeOrder = await Order.findOne({
      restaurantId: restaurantId,
      ownerId: userId,
      status: "draft"
    });

    if (!activeOrder) {
      // 204 No Content is better than an error if they just haven't started an order yet
      return res.status(204).send(); 
    }

    res.json(activeOrder);
  } catch (error) {
    console.error("Error finding active order:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export {createOrder,addItem,getOrderById,checkOut,addOrder,getActiveOrder}