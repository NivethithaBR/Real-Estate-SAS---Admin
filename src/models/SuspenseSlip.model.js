const mongoose = require("mongoose");

const suspenseSlipSchema = new mongoose.Schema(
  {
    ss_no: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    purpose: { type: String, required: true },
    previous_balance: { type: Number, default: 0 },
    previous_ss_no: { type: String },
    amount_in_words: { type: String, required: true },
    prepared_by: { type: String, required: true },
    approved_by: { type: String, required: true },
    received_by: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SuspenseSlip", suspenseSlipSchema);
