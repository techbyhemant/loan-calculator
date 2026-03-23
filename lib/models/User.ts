import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, trim: true },
    image: { type: String },
    plan: { type: String, enum: ["free", "pro"], default: "free" },
    planExpiry: { type: Date },
    razorpayCustomerId: { type: String },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

export const UserModel =
  mongoose.models.User ?? mongoose.model("User", UserSchema);
