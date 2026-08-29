import { Schema, Types, model } from "mongoose";

export interface IOrder {
  customer: Types.ObjectId;
  business: Types.ObjectId;
  items: Array<{ listing: Types.ObjectId; quantity: number; price: number }>;
  totalAmount: number;
  status:
    | "pending"
    | "confirmed"
    | "ready_for_pickup"
    | "completed"
    | "cancelled";
  pickupTime: string;
}
const orderSchema = new Schema<IOrder>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    business: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        listing: {
          type: Schema.Types.ObjectId,
          ref: "FoodListing",
          required: true,
        },
        quantity: { type: Number, min: 1, required: true },
        price: { type: Number, min: 0, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "ready_for_pickup",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    pickupTime: { type: String, required: true },
  },
  { timestamps: true },
);
export const Order = model<IOrder>("Order", orderSchema);
