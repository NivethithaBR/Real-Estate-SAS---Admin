const { Schema, model } = require("mongoose");

const registrationlandSchema = new Schema(
  {
    client_name: String,
    contact_no: Number,
    location: String,
    date: Date,
    payment_type: String,
    site_id: {
      type: Schema.ObjectId,
      ref: "Land",
    },
    plot_id: {
      type: Schema.ObjectId,
      ref: "Landplot",
    },
    amount: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = model("Registrationland", registrationlandSchema);
