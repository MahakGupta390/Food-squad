import {Split} from "../models/split.models.js"
import {Order} from "../models/order.models.js"


const createSplit=async(req,res)=>{
    try{
    //     Get orderId
    // 2. Check if split already exists
    // 3. Fetch order
    // 4. Check order.status === "finalized"
    // 5. Loop through items
    // 6. Divide cost using consumedBy
    // 7. Store result in Split model
    // 8. Return split
    const { orderId } = req.params;
    console.log("🚀 Create Split triggered for Order:", orderId); // LOG 1
    const existing = await Split.findOne({ orderId });
    if (existing) {
      return res.json({ success: true, split: existing });
    }
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "placed") {
      console.log("❌ Blocked: Order status is", order.status); // LOG 2
      return res.status(400).json({ message: "Order not finalized" });
    }

    const userTotals = {};
    const nameMap = {};
    let totalAmount = 0;

    for (let item of order.items) {
      const itemTotal = item.price * item.quantity;
      totalAmount += itemTotal;

      if (!item.consumedBy || item.consumedBy.length === 0) {
        return res.status(400).json({ message: "consumedBy missing" });
      }

      const share = itemTotal / item.consumedBy.length;

      item.consumedBy.forEach((userId) => {
        const id = userId.toString();

        if (!userTotals[id]) userTotals[id] = 0;
        userTotals[id] += share;
        if (item.userId === id) {
          nameMap[id] = item.userName;
        }
      });
    }

    // 4. Round values
    Object.keys(userTotals).forEach((id) => {
      userTotals[id] = parseFloat(userTotals[id].toFixed(2));
    });

    // 5. Convert to array
    const splits = Object.keys(userTotals).map((userId) => ({
      userId,
      userName: nameMap[userId] || "Squad Member",
      amount: userTotals[userId],
      status: "pending"
    }));

    // 6. Save
    const split = await Split.create({
      orderId,
      splits,
      totalAmount
    });
    console.log("✅ Split saved to DB:", split._id);

    res.status(201).json({ success: true, split });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const getSplit = async (req, res) => {
  try {
    console.log("🔥 Split API hit");

    const { orderId } = req.params;
    console.log("👉 Order ID received:", orderId);

    const split = await Split.findOne({ orderId })


    console.log("👉 Split from DB:", split);

    if (!split) {
      console.log("❌ No split found for order:", orderId);
      return res.status(404).json({ message: "Split not found" });
    }

    console.log("✅ Sending split response");

    res.json({ success: true, split });

  } catch (err) {
    console.error("💥 Split ERROR:", err); // 🔥 VERY IMPORTANT
    res.status(500).json({ message: err.message });
  }
};
const payFull = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paidBy } = req.body; // since no auth

    const split = await Split.findOne({ orderId });

    if (!split) {
      return res.status(404).json({ message: "Split not found" });
    }

    split.paidBy = paidBy;

    await split.save();

    res.json({
      success: true,
      message: "Full payment recorded",
      split
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const payUser = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.body;

    const split = await Split.findOne({ orderId });

    if (!split) {
      return res.status(404).json({ message: "Split not found" });
    }

    const userSplit = split.splits.find(
      (s) => s.userId.toString() === userId
    );

    if (!userSplit) {
      return res.status(404).json({ message: "User not in split" });
    }

    if (userSplit.status === "paid") {
      return res.json({ message: "Already paid" });
    }

    userSplit.status = "paid";

    await split.save();

    res.json({
      success: true,
      message: "User payment recorded",
      split
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export {createSplit,getSplit,payFull,payUser}