const mongoose = require("mongoose");

const InventoryAdjustment = new mongoose.Schema({
  stock : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "inventories",
    required : true
  },
  quantity : {
    type : String,
    required : true
  },
  adjustment_type : {
    type : String,
    enum : ['Increase','Decrease']
  },
  remarks : {
    type : String
  },
  status : {
    type : String,
    enum : ['Accepted','Pending','Declined'],
    default : "Pending"
  },
  approvalphoto : {
    public_id : {type : String},
    url : {type : String}
  }
},{
    timestamps: true
});

module.exports = mongoose.model("inventoryadjustments", InventoryAdjustment);
