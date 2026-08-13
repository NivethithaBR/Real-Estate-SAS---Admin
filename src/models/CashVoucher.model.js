const mongoose = require("mongoose");

const cashVoucherSchema = new mongoose.Schema(
  {
    cv_no: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    amount_in_words: { type: String, required: true },
    purpose: { type: String, required: true },
    invoice_no_date: { type: String },
    paid_through: { type: String, required: true },
    approved_by: { type: String, required: true },
    received_by: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CashVoucher", cashVoucherSchema);
