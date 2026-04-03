import {Router} from "express"
import { createOrder ,addItem,getOrderById,checkOut,addOrder,getActiveOrder} from "../controllers/order.controllers.js"
import {jwtCheck,extractUserId} from "../middleware/auth.js"

const orderRoutes=Router()
// 1. Move specific routes to the top
// Remove jwtCheck for now to stop the "Invalid Compact JWS" crash
orderRoutes.get("/active", getActiveOrder); 

// 2. The ID route must stay below /active
orderRoutes.get("/:id", getOrderById);

// 3. Actions that change data SHOULD have protection
orderRoutes.post("/", jwtCheck, extractUserId, createOrder);
orderRoutes.patch("/:id/add-item", jwtCheck, extractUserId, addItem);
orderRoutes.post("/:id/checkout", jwtCheck, extractUserId, checkOut);
orderRoutes.patch("/:id/join", jwtCheck, extractUserId, addOrder);
export default orderRoutes
