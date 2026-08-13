const mongoose = require("mongoose");

const Supplier = new mongoose.Schema({
  suppliername : {
    type : String,
    required : true
  },
  address : {
    type : String,
    required : true
  },
  contactnumber: {
    type : String,
    required : true
  }
},{
    timestamps: true
});

module.exports = mongoose.model("suppliers", Supplier);
