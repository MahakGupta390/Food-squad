import mongoose from 'mongoose';

const { Schema } = mongoose;

/** Created once when the host places the order: `debtor` owes `creditor` (the host) `amount`. */
const debtSchema = new Schema(
  {
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    roomCode: String,
    restaurantName: String,
    debtorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    creditorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 1 }, // whole rupees
  },
  { timestamps: true },
);

// Placing an order twice can never double-charge anyone.
debtSchema.index({ roomId: 1, debtorId: 1 }, { unique: true });

export const Debt = mongoose.model('Debt', debtSchema);
