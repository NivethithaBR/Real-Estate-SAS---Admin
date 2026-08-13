const mongoose = require("mongoose");

const InventoryCategory = new mongoose.Schema({
  categoryname: {
    type: String,
    required : true
  }
},{
    timestamps: true
});

module.exports = mongoose.model("inventorycategories", InventoryCategory);
