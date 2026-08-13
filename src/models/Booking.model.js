const { model, Schema } = require("mongoose");

const booking_schema = new Schema(
  {
    client_name: String,
    contact_no: Number,
    email_id: String,
    address: String,
    state: String,
    token_advance: Number,
    location: String,
    remarks: String,
    payment_type: String,
    assigned_to : {
      type : Schema.Types.ObjectId,
      ref : "User"
    },
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

const booking_model = model("booking", booking_schema);

module.exports = booking_model;
