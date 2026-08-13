const mongoose = require("mongoose");

const cancelduration = new mongoose.Schema({
  duration : {
    type : Number,
    required : true
  },
},{
    timestamps: true
});

module.exports = mongoose.model("canceldurations", cancelduration);
