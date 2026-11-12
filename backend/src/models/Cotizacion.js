const mongoose = require("mongoose");

const quoteItemSchema = new mongoose.Schema(
  {
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Catalogo", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, max: 20 },
    unitPrice: { type: Number, default: null, min: 0 },
    subtotal: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const cotizacionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    items: { type: [quoteItemSchema], required: true },
    modality: { type: String, required: true, enum: ["remote", "onsite"] },
    priority: { type: String, required: true, enum: ["normal", "urgent"] },
    estimatedTotal: { type: Number, required: true, min: 0 },
    pendingItems: { type: Number, required: true, min: 0 }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("Cotizacion", cotizacionSchema);
