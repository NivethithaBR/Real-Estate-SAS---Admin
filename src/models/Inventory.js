const mongoose = require("mongoose");

const Inventory = new mongoose.Schema({
  inventoryname: {
    type: String,
    required : true
  },
  category: {
    type : mongoose.Schema.Types.ObjectId,
    ref : "inventorycategories",
    required : true
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "units",
    required: true
  }
},{
    timestamps: true
});

module.exports = mongoose.model("inventories", Inventory);
