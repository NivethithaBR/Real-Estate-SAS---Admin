const mongoose = require("mongoose");

const godownmaster = new mongoose.Schema({
  godownname: {
    type: String,
    required : true
  }
},{
    timestamps: true
});

module.exports = mongoose.model("godownmasters", godownmaster);
