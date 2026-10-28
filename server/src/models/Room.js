import mongoose from 'mongoose';

const { Schema } = mongoose;

const memberSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    slot: { type: String, required: true }, // short avatar label unique within the room: "M", "A", "M2"
    budget: { type: Number, default: 450, min: 100, max: 5000 },
    diet: { type: [String], default: [] },
    mood: { type: String, default: 'Spicy' },
    dislikes: { type: String, default: '', maxlength: 120 },
    ready: { type: Boolean, default: false },
  },
  { _id: false },
);

const lineSchema = new Schema(
  {
    lineId: { type: String, required: true },
    menuItemId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true }, // copied from the menu server-side, never from the client
    qty: { type: Number, required: true, min: 1 },
    eaters: [{ type: Schema.Types.ObjectId }],
  },
  { _id: false },
);

const roomSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    restaurantSlug: { type: String, required: true },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [memberSchema],
    cart: [lineSchema],
    status: { type: String, enum: ['open', 'placed'], default: 'open' },
    placedAt: Date,
    // Frozen at placement so later menu/pricing changes can't rewrite history.
    bill: { sub: Number, tax: Number, fee: Number, disc: Number, total: Number },
    finalShares: [{ _id: false, userId: Schema.Types.ObjectId, amount: Number }],
    placedItems: [{ _id: false, name: String, qty: Number }],
  },
  { timestamps: true, optimisticConcurrency: true },
);

roomSchema.index({ 'members.userId': 1, updatedAt: -1 });

export const Room = mongoose.model('Room', roomSchema);
