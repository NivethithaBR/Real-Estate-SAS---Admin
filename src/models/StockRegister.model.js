const mongoose = require("mongoose");

const stockRegisterSchema = new mongoose.Schema(
  {
    sl_no: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    invoice_no_date: { type: String, required: true },
    invoice_amount: { type: Number, required: true },
    opening_stock: { type: String, required: true },
    purchase_material: { type: String, required: true },
    total_stock_hand: { type: String, required: true },
    issued: { type: String, required: true },
    issued_by: { type: String, required: true },
    verified_by: { type: String, required: true },
    received_by: { type: String, required: true },
    damage: { type: String, default: "0" },
    closing_stock: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockRegister", stockRegisterSchema);
