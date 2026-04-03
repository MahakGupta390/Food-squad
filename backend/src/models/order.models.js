import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    },

    ownerId: {
      type: String,
      required: true
    },

    participants: [
      {
        type: String
      }
    ],

    items: [
      {
        name: String,
        price: Number,
        quantity: Number,

        userId: {
          type: String
        },
        userName: { 
      type: String 
    },
       consumedBy: { type: [String], default: [] }
    
      }
    ],

    totalPrice: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["draft", "placed", "paid"],
      default: "draft"
    },

    shareableLink: {
      type: String
    }
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);