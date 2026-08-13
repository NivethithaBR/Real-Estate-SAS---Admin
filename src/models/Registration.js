const { Schema, model } = require("mongoose");

const registrationSchema = new Schema(
  {
    client_name: String,
    contact_no: Number,
    location: String,
    date: Date,
    payment_type: String,
    site_id: {
      type: Schema.ObjectId,
      ref: "Site",
    },
    plot_id: {
      type: Schema.ObjectId,
      ref: "Plot",
    },
    amount: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = model("Registration", registrationSchema);
