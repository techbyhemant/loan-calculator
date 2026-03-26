import mongoose, { Schema } from "mongoose";

const LoanSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        "home",
        "car",
        "two_wheeler",
        "personal",
        "education",
        "gold",
        "consumer_durable",
        "credit_card",
        "lap",
        "medical",
        "other",
      ],
      required: true,
      default: "personal",
    },
    lender: { type: String, trim: true, default: "" },
    originalAmount: { type: Number, required: true, min: 0 },
    currentOutstanding: { type: Number, required: true, min: 0 },
    interestRate: { type: Number, required: true, min: 0, max: 100 },
    emiAmount: { type: Number, required: true, min: 0 },
    emiDate: { type: Number, min: 1, max: 31, default: 1 },
    startDate: { type: Date, required: true },
    tenureMonths: { type: Number, required: true, min: 1 },
    rateType: {
      type: String,
      enum: ["fixed", "floating"],
      default: "floating",
    },
    prepaymentPenalty: { type: Number, default: 0, min: 0, max: 10 },
    moratoriumEndDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true, index: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

export const LoanModel =
  mongoose.models.Loan ?? mongoose.model("Loan", LoanSchema);
