import mongoose from "mongoose";

const splitSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true // 🔥 one split per order
    },

    splits: [
      {
        userId: {
          type: String,
          ref: "User"
        },
        amount: {
          type: Number,
          required: true
        },
        userName: { type: String },
        status: {
          type: String,
          enum: ["pending", "paid"],
          default: "pending"
        }
      }
    ],

    totalAmount: {
      type: Number,
      required: true
    },

    paidBy: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

export const Split = mongoose.model("Split", splitSchema);
