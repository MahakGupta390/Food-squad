import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * `from` paid `to`. Debts are never mutated; balances are always
 * (sum of debts) - (sum of payments), so every rupee has an audit trail.
 */
const paymentSchema = new Schema(
  {
    fromId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    toId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room' }, // set when the host confirmed it from the room screen
    source: { type: String, enum: ['room', 'ledger'], required: true },
  },
  { timestamps: true },
);

// A host can confirm a given person's room payment only once.
paymentSchema.index(
  { roomId: 1, fromId: 1, toId: 1 },
  { unique: true, partialFilterExpression: { roomId: { $exists: true } } },
);

export const Payment = mongoose.model('Payment', paymentSchema);
