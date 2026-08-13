const mongoose = require("mongoose");

const plotstageadded = new mongoose.Schema({
  plot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "plots",
    required: true
  },
  stage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "plotstages",
    required: true
  },
  stagecost : {
    type: Number,
    required: true
  },
  plot_stage_photo: {
    public_id: { type: String },
    url: { type: String },
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("plotstageaddeds", plotstageadded);
