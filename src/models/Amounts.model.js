const { model, Schema } = require("mongoose");

const amount_schema = new Schema(
  {
    type: {
      type: String,
      enum: ["For_Expense"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    received_amount: Number,
    spent_amount: Number,
    pending_amount: Number,
  },
  {
    timestamps: true,
  }
);

const amount_model = model("amount", amount_schema);
module.exports = amount_model;
