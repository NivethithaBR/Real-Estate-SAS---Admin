const mongoose = require("mongoose");

const estimatelimitmodel = new mongoose.Schema({
  estimatelimit : {
    type : Number,
    required : true
  },
},{
    timestamps: true
});

module.exports = mongoose.model("estimatelimits", estimatelimitmodel);
