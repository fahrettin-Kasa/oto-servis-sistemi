import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ürün adı zorunludur"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Ürün kodu zorunludur"],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Kategori zorunludur"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Miktar zorunludur"],
      min: [0, "Miktar 0'dan küçük olamaz"],
      default: 0,
    },
    unit: {
      type: String,
      required: [true, "Birim zorunludur"],
      trim: true,
    },
    purchasePrice: {
      type: Number,
      required: [true, "Alış fiyatı zorunludur"],
      min: [0, "Alış fiyatı 0'dan küçük olamaz"],
    },
    salePrice: {
      type: Number,
      required: [true, "Satış fiyatı zorunludur"],
      min: [0, "Satış fiyatı 0'dan küçük olamaz"],
    },
    minQuantity: {
      type: Number,
      required: [true, "Minimum miktar zorunludur"],
      min: [0, "Minimum miktar 0'dan küçük olamaz"],
      default: 0,
    },
    supplier: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Stock = mongoose.models.Stock || mongoose.model("Stock", stockSchema);

export default Stock;
