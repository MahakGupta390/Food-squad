import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { Server } from "socket.io"; // 🚀 1. Import Socket.io
import http from "http";            // 🚀 2. Import HTTP module

import router from "./routes/user.routes.js";
import restaurantRoutes from "./routes/restaurant.route.js";
import orderRoutes from "./routes/order.route.js";
import splitRoutes from "./routes/split.route.js";

dotenv.config();

mongoose.connect(process.env.MONGO_CONNECT_STRING)
  .then(() => console.log("Connected to MongoDB"));

const app = express();
app.use(express.json());
app.use(cors());

// 🚀 3. Create the HTTP Server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your Frontend URL
    methods: ["GET", "POST", "PATCH"]
  }
});

// 🚀 4. Make 'io' accessible to your routes (Important!)
app.set("io", io);

// 🚀 5. Socket Logic: Handling "Rooms"
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-order", (orderId) => {
    socket.join(orderId);
    console.log(`User joined order room: ${orderId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Routes
app.use("/api/users", router);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/split", splitRoutes);

// 🚀 6. Change app.listen to server.listen
server.listen(5000, () => {
  console.log("Server is running on port 5000 with WebSockets enabled");
});