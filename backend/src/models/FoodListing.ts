import { Schema, Types, model } from "mongoose";

export type FoodListingStatus =
  | "active"
  | "sold_out"
  | "expired"
  | "cancelled"
  | "draft";

export interface IFoodListing {
  business: Types.ObjectId;
  businessName: string;
  name: string;
  description: string;
  image?: string;
  category: string;
  originalPrice: number;
  surplusPrice: number;
  quantity: number;
  pickupLocation: string;
  pickupTime: string;
  availableUntil: Date;
  status: FoodListingStatus;
}

const foodListingSchema = new Schema<IFoodListing>(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    businessName: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    originalPrice: {
      type: Number,
      required: true,
      min: 0.01,
    },

    surplusPrice: {
      type: Number,
      required: true,
      min: 0.01,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },

    pickupLocation: {
      type: String,
      required: true,
      trim: true,
    },

    pickupTime: {
      type: String,
      required: true,
      trim: true,
    },

    availableUntil: {
      type: Date,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "sold_out", "expired", "cancelled", "draft"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

foodListingSchema.pre("validate", function () {
  if (this.surplusPrice >= this.originalPrice) {
    this.invalidate(
      "surplusPrice",
      "Surplus price must be lower than original price",
    );
  }
});

foodListingSchema.index({
  status: 1,
  availableUntil: 1,
});

foodListingSchema.index({
  category: 1,
  status: 1,
});

foodListingSchema.index({
  business: 1,
  createdAt: -1,
});

export const FoodListing = model<IFoodListing>(
  "FoodListing",
  foodListingSchema,
);
