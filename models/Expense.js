import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Gider başlığı zorunludur"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Gider tutarı zorunludur"],
      min: [0, "Gider tutarı 0'dan küçük olamaz"],
    },
    category: {
      type: String,
      required: [true, "Gider kategorisi zorunludur"],
      enum: [
        "elektrik",
        "su",
        "doğalgaz",
        "kira",
        "maaş",
        "malzeme",
        "bakım",
        "diğer",
      ],
    },
    date: {
      type: Date,
      required: [true, "Gider tarihi zorunludur"],
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Expense =
  mongoose.models.Expense || mongoose.model("Expense", expenseSchema);

export default Expense;
