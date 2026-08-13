const mongoose = require("mongoose");

const plotstage = new mongoose.Schema({
  stagename: {
    type: String,
    required: true
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("plotstages", plotstage);
