const mongoose = require("mongoose");

const preBookingSchema = new mongoose.Schema(
  {
    sl_no: { type: String, required: true, unique: true },
    purchaser_name: { type: String, required: true },
    age: { type: Number },
    father_spouse_name: { type: String },
    address: { type: String, required: true },
    mobile_no: { type: String, required: true },
    email: { type: String },
    whatsapp_no: { type: String },
    occupation: { type: String },
    flat_no: { type: String, required: true },
    unit_type: { type: String, enum: ["1", "2", "3"] },
    floor: { type: String, enum: ["1", "2", "3", "4", "5"] },
    housing_loan: { type: Boolean, default: false },
    furnishing_interiors: { type: Boolean, default: false },
    payment_terms: {
      token_advance: { type: Number, required: true },
      date: { type: Date, required: true },
      receipt_no_date: { type: String },
    },
    purchaser_signature_date: { type: Date },
    purchaser_place: { type: String },
    authorised_signatory: { type: String },
    authorised_signatory_name: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PreBooking", preBookingSchema);
