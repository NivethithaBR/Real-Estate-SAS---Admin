const mongoose = require("mongoose");

const InventoryRecord = new mongoose.Schema({
  stock: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "inventories",
    required: true
  },
  openingstock: {
    type: Number,
    required: true,
    default: 0
  },
  closingstock: {
    type: Number,
    required: true,
    default: 0
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  overalltotal: {
    type: Number,
    required: true,
    default: 0
  },
  godown: {
    type : String,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("inventoryrecords", InventoryRecord);
