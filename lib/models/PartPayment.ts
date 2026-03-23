import mongoose, { Schema } from "mongoose";

const PartPaymentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    loanId: {
      type: Schema.Types.ObjectId,
      ref: "Loan",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 1 },
    date: { type: Date, required: true },
    reduceType: { type: String, enum: ["emi", "tenure"], required: true },
    interestSaved: { type: Number, required: true, default: 0 },
    monthsReduced: { type: Number, required: true, default: 0 },
    note: { type: String, default: "" },
  },
  { timestamps: true },
);

export const PartPaymentModel =
  mongoose.models.PartPayment ??
  mongoose.model("PartPayment", PartPaymentSchema);
