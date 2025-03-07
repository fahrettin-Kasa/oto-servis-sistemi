import mongoose from "mongoose";

// Firma şeması oluşturuluyor
const FirmSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      required: false,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: false,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      required: false,
      default: "",
    },
    taxNumber: {
      type: String,
      trim: true,
      required: false,
      default: "",
    },
    totalBalance: {
      type: Number,
      default: 0,
    },
    currentBalance: {
      type: Number,
      default: 0,
    },
    payments: [
      {
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        description: {
          type: String,
          trim: true,
          default: "Ödeme",
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // Otomatik olarak oluşturulma ve güncellenme zamanlarını ekler
  }
);

// Modeli sil ve yeniden oluştur
if (mongoose.models.Firm) {
  delete mongoose.models.Firm;
}

const Firm = mongoose.model("Firm", FirmSchema);

export default Firm;
