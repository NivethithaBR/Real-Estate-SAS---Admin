const { model, Schema } = require("mongoose");

const bookingland_schema = new Schema(
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

const Bookingland_model = model("bookingland", bookingland_schema);

module.exports = Bookingland_model;
