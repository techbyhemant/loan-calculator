import mongoose, { Schema } from "mongoose";

const CreditCardSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    issuer: { type: String, trim: true, default: "" },
    creditLimit: { type: Number, required: true, min: 0 },
    currentOutstanding: { type: Number, required: true, min: 0, default: 0 },
    monthlyRate: {
      type: Number,
      required: true,
      default: 0.035, // 3.5% = 42% PA (standard India)
      min: 0,
      max: 0.1, // cap at 10%/month = 120% PA (safety)
    },
    minimumDuePercent: {
      type: Number,
      default: 0.05,
      min: 0.01,
      max: 0.5,
    },
    billingDate: { type: Number, min: 1, max: 28, default: 1 },
    dueDate: { type: Number, min: 1, max: 28, default: 20 },
    isActive: { type: Boolean, default: true, index: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const CreditCardModel =
  mongoose.models.CreditCard ??
  mongoose.model("CreditCard", CreditCardSchema);
