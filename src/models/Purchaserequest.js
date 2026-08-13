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
    // unit: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "units",
    //   required: true,
    // },
    remarks: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const Purchaserequest = new mongoose.Schema({
  prnumber: {
    type : String,
    required : true
  },
  products: {
    type : [ProductSchema],
    required : true,
    default: [],
  },
  status : {
    type : String,
    enum : ["Pending","Converted","Rejected"],
    default : "Pending",
    required : true
  },
  remarks : {
    type : String
  },
  raisedby : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User",
    required : true
  }
},{
    timestamps: true
});


module.exports = mongoose.model("purchaserequests", Purchaserequest);
