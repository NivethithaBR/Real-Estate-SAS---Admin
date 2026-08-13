const mongoose = require("mongoose");

const InventoryRegister = new mongoose.Schema({
  stock : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "inventories",
    required : true
  },
  quantity : {
    type : String,
    required : true
  },
  transaction_type : {
    type : String,
    enum : ['Stock-Inward','Stock-Outward']
  },
  remarks : {
    type : String
  }
},{
    timestamps: true
});

module.exports = mongoose.model("inventoryregisters", InventoryRegister);
