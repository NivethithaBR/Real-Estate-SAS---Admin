const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    stock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "inventories",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const Purchaseorder = new mongoose.Schema({
  ponumber: {
    type: String,
    required: true
  },
  products: {
    type: [ProductSchema],
    required: true,
    default: [],
  },
  prid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "purchaserequests",
  },
  status: {
    type: String,
    enum: ["Pending", "Completed"],
    default: "Pending"
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "suppliers",
    required: true
  },
  totalamount: {
    type: Number,
    required: true
  },
  gstrate: {
    type: Number,
    required: true
  },
  gstamount: {
    type: Number,
    required: true
  },
  remarks: {
    type: String,
  },
  departure: {
    type: String,
    required: true
  },
  raisedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("purchaseorders", Purchaseorder);
