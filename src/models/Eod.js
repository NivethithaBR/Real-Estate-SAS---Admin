const mongoose = require("mongoose");

const Eod = new mongoose.Schema({
  eod_description: {
    type: String,
    required : true
  },
  userid: {
    type: String,
    required: true,
  },
},{
    timestamps: true
});

module.exports = mongoose.model("eods", Eod);
