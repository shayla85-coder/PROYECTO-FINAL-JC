const mongoose = require("mongoose");

const catalogoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    category: {
      type: String,
      required: true,
      enum: ["Mantenimiento", "Desarrollo"]
    },
    price: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, trim: true, maxlength: 500 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Catalogo", catalogoSchema);
