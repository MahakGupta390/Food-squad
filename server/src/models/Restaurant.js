import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: String,
    veg: { type: Boolean, required: true },
    desc: String,
    // Optional dietary tags: 'vegan', 'jain', 'gluten-free', 'egg', 'nuts'
    tags: { type: [String], default: [] },
  },
  { _id: false },
);

const restaurantSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  order: { type: Number, default: 0 },
  name: { type: String, required: true },
  tagline: String,
  cuisine: String,
  rating: Number,
  reviews: Number,
  deliveryTime: String,
  priceForTwo: Number,
  dietary: String,
  code: { type: String, required: true }, // e.g. BBQ-4821; the prefix seeds room codes
  menu: [menuItemSchema],
});

export const Restaurant = mongoose.model('Restaurant', restaurantSchema);
