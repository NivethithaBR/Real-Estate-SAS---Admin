const { Schema, model } = require("mongoose");

const refund_schema = new Schema(
  {
    client_name: String,
    contact_no: Number,
    email_id: String,
    address: String,
    city: String,
    state: String,
    booking_date: Date,
    token_advance: String,
    site_id: {
      type: Schema.ObjectId,
      ref: "Site",
    },
    plot_id: {
      type: Schema.ObjectId,
      ref: "Plot",
    },
    paid_amount: Number,
    refund_amount: Number,
    status: String,
  },
  { timestamps: true }
);

const refund_model = model("refund", refund_schema);
module.exports = refund_model;
