import { Schema, model } from "mongoose";

export type Role = "customer" | "business" | "admin";
export interface IUser {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  location?: string;
}
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "business", "admin"],
      default: "customer",
    },
    phone: String,
    location: String,
  },
  { timestamps: true },
);
export const User = model<IUser>("User", userSchema);
