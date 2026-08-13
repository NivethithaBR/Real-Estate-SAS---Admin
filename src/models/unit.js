const mongoose = require("mongoose");

const Unit = new mongoose.Schema({
  units: {
    type: String,
    required : true
  }
},{
    timestamps: true
});

module.exports = mongoose.model("units", Unit);
