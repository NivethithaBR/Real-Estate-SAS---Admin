const { Schema, model } = require("mongoose");

const expense_schema = new Schema(
  {
    expense_name: String,
    expense_category: String,
    amount: Number,
    payment_mode: String,
    description:String,
    date: Date,
    receipt: {
      url: String,
      public_id: String,
    },
  },
  {
    timestamps: true,
  }
);

const expense_model = model("expense", expense_schema);
module.exports = expense_model;
