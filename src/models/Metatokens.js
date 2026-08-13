const mongoose = require("mongoose");

const metatoken = new mongoose.Schema(
  {
    username : {
      type : String,
      default : "appartments"
    },
    accesstoken : {
        type : String,
        required : true
    },
    expires_in : {
        type : Date,
        required : true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Metatokens", metatoken);
