import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true }
});

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    image:{type:String},
    cuisines: [{ type: String }],
    deliveryTime: { type: Number, required: true },
    deliveryPrice: { type: Number, required: true },
    menuItems: [menuItemSchema]
}, { timestamps: true });

export const Restaurant = mongoose.model("Restaurant", restaurantSchema);