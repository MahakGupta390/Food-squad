import { Router } from "express";
import {
    createRestaurant,
    getRestaurants,
    getRestaurantById
} from "../controllers/restaurant.controllers.js";

const restaurantRoutes = Router();

restaurantRoutes.post("/", createRestaurant);        // add restaurant (testing/admin)
restaurantRoutes.get("/", getRestaurants);           // get all
restaurantRoutes.get("/:id", getRestaurantById);     // get one

export default restaurantRoutes;