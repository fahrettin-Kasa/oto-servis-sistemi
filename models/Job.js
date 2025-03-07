import mongoose from "mongoose";

// Job şeması oluşturuluyor
const JobSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Müşteri adı zorunludur"],
    },
    phone: {
      type: String,
      required: [true, "Telefon numarası zorunludur"],
    },
    brand: {
      type: String,
      required: [true, "Marka zorunludur"],
    },
    model: {
      type: String,
      required: [true, "Model zorunludur"],
    },
    plate: {
      type: String,
      required: [true, "Plaka zorunludur"],
    },
    job: {
      type: String,
      required: [true, "İş detayı zorunludur"],
    },
    price: {
      type: Number,
      required: [true, "Fiyat zorunludur"],
      min: [0, "Fiyat 0'dan küçük olamaz"],
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: ["Beklemede", "Devam Ediyor", "Tamamlandı", "İptal"],
        message: "Geçersiz durum değeri",
      },
      default: "Beklemede",
    },
    firm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Firm",
      required: false,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
    },
    vehicle: {
      type: String,
      required: [true, "Araç tipi zorunludur"],
      enum: {
        values: [
          "sedan",
          "hatchback",
          "suv",
          "pickup",
          "van",
          "truck",
          "other",
        ],
        message: "Geçersiz araç tipi",
      },
    },
    date: {
      type: Date,
      default: Date.now,
    },
    parts: [
      {
        part: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Stock",
        },
        quantity: {
          type: Number,
          min: [1, "Parça miktarı en az 1 olmalıdır"],
          default: 1,
        },
        price: {
          type: Number,
          min: [0, "Parça fiyatı 0'dan küçük olamaz"],
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Eğer model zaten varsa, o modeli kullan; yoksa yeni bir model oluştur
const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);

export default Job;
